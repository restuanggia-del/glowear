import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, StatusBar, RefreshControl, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { api } from "../../services/api";
import { API_URL } from "../../constants/config";
import Skeleton from "../../components/Skeleton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function OrdersScreen() {
  const router = useRouter();
  const { initialStatus } = useLocalSearchParams(); 
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialStatus || "SEMUA");

  const tabs = [
    { id: "SEMUA", label: "Semua" },
    { id: "PENDING", label: "Belum Bayar" },
    { id: "DIPROSES", label: "Diproses" },
    { id: "DIKIRIM", label: "Dikirim" },
    { id: "SELESAI", label: "Selesai" },
    { id: "DIBATALKAN", label: "Dibatalkan" }
  ];

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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      "Batalkan Pesanan?",
      "Yakin ingin membatalkan pesanan ini?",
      [
        { text: "Tidak", style: "cancel" },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: async () => {
            setCancellingId(orderId);
            try {
              await api.patch(`/orders/${orderId}/cancel`);
              Alert.alert("Sukses", "Pesanan dibatalkan.");
              fetchOrders();
            } catch (error: any) {
              Alert.alert("Gagal", "Gagal membatalkan pesanan.");
            } finally {
              setCancellingId(null);
            }
          }
        }
      ]
    );
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "#f59e0b";
      case "DIPROSES": return "#3b82f6";
      case "DIKIRIM": return "#10b981";
      case "SELESAI": return "#8b5cf6";
      case "DIBATALKAN": return "#ef4444";
      default: return "#94a3b8";
    }
  };

  const getImageUrl = (item: any) => {
    const imgName = item.items?.[0]?.product?.gambar;
    if (!imgName) return "https://via.placeholder.com/150";
    if (imgName.startsWith('http')) return imgName;
    return `${API_URL}/uploads/${imgName}`;
  };

  const filteredOrders = activeTab === "SEMUA" 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
           <Text style={styles.headerTitle}>Pesanan Saya</Text>
        </View>
        <View style={{ padding: 20 }}>
          <Skeleton height={40} borderRadius={20} style={{ marginBottom: 20 }} />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height={120} borderRadius={20} style={{ marginBottom: 15 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
      </View>

      <View style={styles.tabContainer}>
        <FlatList
          data={tabs}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20 }}
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

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38bdf8" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#334155" />
            <Text style={styles.emptyText}>Belum ada pesanan.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100)}>
            <TouchableOpacity
              style={styles.orderCard}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/order-detail', params: { orderId: item.id } })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.productRow}>
                <Image source={{ uri: getImageUrl(item) }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.items?.[0]?.product?.namaProduk || "Custom Order"}
                  </Text>
                  <Text style={styles.totalPrice}>{formatRupiah(item.totalHarga)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#334155" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: "#1e293b", borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 22 },
  tabContainer: { paddingVertical: 15 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginRight: 10, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  tabButtonActive: { backgroundColor: "rgba(56, 189, 248, 0.15)", borderColor: "#38bdf8" },
  tabText: { color: "#94a3b8", fontFamily: "Poppins_600SemiBold", fontSize: 12 },
  tabTextActive: { color: "#38bdf8" },
  orderCard: { backgroundColor: "#1e293b", borderRadius: 20, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: "#334155" },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  orderDate: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 11 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontFamily: "Poppins_700Bold", fontSize: 10 },
  productRow: { flexDirection: "row", alignItems: "center" },
  productImage: { width: 50, height: 50, borderRadius: 10 },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  totalPrice: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 13, marginTop: 2 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#64748b", fontFamily: "Poppins_500Medium", marginTop: 10 },
});
