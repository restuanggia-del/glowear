import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Platform, StatusBar } from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { API_URL } from "../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function MyOrdersScreen() {
  const router = useRouter();
  const { initialStatus } = useLocalSearchParams(); 
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialStatus || "SEMUA");

  const tabs = [
    { id: "SEMUA", label: "Semua" },
    { id: "BELUM_BAYAR", label: "Belum Bayar" },
    { id: "DIPROSES", label: "Diproses" },
    { id: "DIKIRIM", label: "Dikirim" }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userString = await AsyncStorage.getItem("userData");
        if (userString) {
          const user = JSON.parse(userString);
          const res = await api.get(`/orders/user/${user.id}`);
          setOrders(res.data);
        }
      } catch (error) {
        console.error("Gagal mengambil pesanan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  // Fungsi Format Tanggal yang Aman
  const formatDate = (dateString: any) => {
    if (!dateString) return "Tanggal tidak tersedia";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Tanggal tidak valid";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BELUM_BAYAR": return "#f59e0b"; // Amber
      case "DIPROSES": return "#3b82f6"; // Blue
      case "DIKIRIM": return "#10b981"; // Emerald
      case "SELESAI": return "#64748b"; // Slate
      default: return "#94a3b8";
    }
  };

  // Fungsi aman untuk mengambil URL Gambar
  const getImageUrl = (item: any) => {
    const imgName = item.items?.[0]?.product?.gambar;
    if (!imgName) return "https://via.placeholder.com/150"; // Gambar fallback jika kosong
    if (imgName.startsWith('http')) return imgName;
    return `${API_URL}/uploads/${imgName}`;
  };

  const filteredOrders = activeTab === "SEMUA" 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <Stack.Screen options={{ title: "Pesanan Saya", headerStyle: { backgroundColor: "#0f172a" }, headerTintColor: "#fff" }} />
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Pesanan Saya", headerStyle: { backgroundColor: "#0f172a" }, headerTintColor: "#fff", headerTitleStyle: { fontFamily: "Poppins_700Bold" } }} />

      {/* Tabs Filter */}
      <View style={styles.tabContainer}>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === item.id && styles.tabButtonActive]}
              onPress={() => setActiveTab(item.id as string)}
            >
              <Text style={[styles.tabText, activeTab === item.id && styles.tabTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Daftar Pesanan */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#334155" />
          <Text style={styles.emptyText}>Belum ada pesanan di kategori ini.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                {/* Membaca waktuDibuat atau createdAt dari backend */}
                <Text style={styles.orderDate}>{formatDate(item.waktuDibuat || item.createdAt)}</Text>
                
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.replace("_", " ")}
                  </Text>
                </View>
              </View>

              <View style={styles.productRow}>
                {/* Mengambil gambar menggunakan fungsi pengaman */}
                <Image 
                  source={{ uri: getImageUrl(item) }} 
                  style={styles.productImage} 
                />
                <View style={styles.productInfo}>
                  {/* Membaca nama produk dari relasi items */}
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.items?.[0]?.product?.namaProduk || "Produk Custom / Dihapus"}
                  </Text>
                  
                  {/* Membaca jumlah (qty) dan sablon */}
                  <Text style={styles.productDetail}>
                    Qty: {item.items?.[0]?.jumlah || 0} Pcs {item.items?.[0]?.jenisSablon ? `| ${item.items[0].jenisSablon}` : ''}
                  </Text>
                  
                  <Text style={styles.totalPrice}>{formatRupiah(item.totalHarga)}</Text>
                </View>
              </View>

              {item.status === "BELUM_BAYAR" && (
                <TouchableOpacity 
                  style={styles.payButton} 
                  onPress={() => router.push({ pathname: '/payment', params: { orderId: item.id, totalHarga: item.totalHarga } })}
                >
                  <Text style={styles.payButtonText}>Cara Pembayaran</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f172a",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0, 
  },
  loadingArea: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },
  
  tabContainer: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#1e293b", paddingLeft: 10 },
  tabButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  tabButtonActive: { backgroundColor: "rgba(56, 189, 248, 0.15)", borderColor: "#38bdf8" },
  tabText: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 13 },
  tabTextActive: { color: "#38bdf8", fontFamily: "Poppins_700Bold" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 50 },
  emptyText: { color: "#64748b", fontFamily: "Poppins_500Medium", marginTop: 15 },

  orderCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: "#334155" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderColor: "#334155", paddingBottom: 10, marginBottom: 15 },
  orderDate: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontFamily: "Poppins_700Bold", fontSize: 10 },

  productRow: { flexDirection: "row", alignItems: "center" },
  productImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: "#334155" },
  productInfo: { flex: 1, marginLeft: 15 },
  productName: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  productDetail: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },
  totalPrice: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 14, marginTop: 5 },

  payButton: { marginTop: 15, backgroundColor: "rgba(56, 189, 248, 0.1)", borderWidth: 1, borderColor: "#38bdf8", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  payButtonText: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 13 }
});