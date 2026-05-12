import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, StatusBar, RefreshControl } from "react-native";
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
  const [activeTab, setActiveTab] = useState(initialStatus || "SEMUA");

  const tabs = [
    { id: "SEMUA", label: "Semua" }, { id: "PENDING", label: "Belum Bayar" },
    { id: "DIPROSES", label: "Diproses" }, { id: "DIKIRIM", label: "Dikirim" },
    { id: "SELESAI", label: "Selesai" }, { id: "DIBATALKAN", label: "Dibatalkan" }
  ];

  const fetchOrders = async () => {
    try {
      const userString = await AsyncStorage.getItem("userData");
      if (userString) {
        const user = JSON.parse(userString);
        const res = await api.get(`/orders/user/${user.id}`);
        setOrders(res.data);
      }
    } catch (error) { console.error("Gagal mengambil pesanan:", error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchOrders(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchOrders(); }, []);

  const formatRupiah = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
  const formatDate = (d: any) => { if (!d) return "-"; const date = new Date(d); return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); };
  const getStatusColor = (s: string) => { switch (s) { case "PENDING": return "#f59e0b"; case "DIPROSES": return "#3b82f6"; case "DIKIRIM": return "#10b981"; case "SELESAI": return "#8b5cf6"; case "DIBATALKAN": return "#ef4444"; default: return "#94a3b8"; } };
  const getImageUrl = (item: any) => { const img = item.items?.[0]?.product?.gambar; if (!img) return "https://via.placeholder.com/150"; if (img.startsWith('http')) return img; return `${API_URL}/uploads/${img}`; };

  const filteredOrders = activeTab === "SEMUA" ? orders : orders.filter(o => o.status === activeTab);

  if (loading) {
    return (
      <View style={s.container}>
        <View style={s.header}><Text style={s.headerTitle}>Pesanan Saya</Text></View>
        <View style={{ padding: 20 }}>
          <Skeleton height={40} borderRadius={20} style={{ marginBottom: 20 }} />
          {[1,2,3].map(i => <Skeleton key={i} height={120} borderRadius={20} style={{ marginBottom: 15 }} />)}
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={s.headerTitle}>Riwayat Transaksi</Text></View>
      <View style={s.tabContainer}>
        <FlatList data={tabs} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(i) => i.id} contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[s.tabButton, activeTab === item.id && s.tabButtonActive]} onPress={() => setActiveTab(item.id as string)}>
              <Text style={[s.tabText, activeTab === item.id && s.tabTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList data={filteredOrders} keyExtractor={(i) => i.id} contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        ListEmptyComponent={<View style={s.emptyContainer}><Ionicons name="receipt-outline" size={64} color="#cbd5e1" /><Text style={s.emptyText}>Belum ada pesanan.</Text></View>}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100)}>
            <TouchableOpacity style={s.orderCard} activeOpacity={0.8} onPress={() => router.push({ pathname: '/order-detail', params: { orderId: item.id } })}>
              <View style={s.orderHeader}>
                <Text style={s.orderDate}>{formatDate(item.createdAt)}</Text>
                <View style={[s.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}><Text style={[s.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text></View>
              </View>
              <View style={s.productRow}>
                <Image source={{ uri: getImageUrl(item) }} style={s.productImage} />
                <View style={s.productInfo}>
                  <Text style={s.productName} numberOfLines={1}>{item.items?.[0]?.product?.namaProduk || "Custom Order"}</Text>
                  <Text style={s.totalPrice}>{formatRupiah(item.totalHarga)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: "#ffffff", borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  headerTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 22 },
  tabContainer: { paddingVertical: 15 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginRight: 10, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0" },
  tabButtonActive: { backgroundColor: "rgba(59, 130, 246, 0.1)", borderColor: "#3b82f6" },
  tabText: { color: "#94a3b8", fontFamily: "Poppins_600SemiBold", fontSize: 12 },
  tabTextActive: { color: "#3b82f6" },
  orderCard: { backgroundColor: "#ffffff", borderRadius: 20, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  orderDate: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 11 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontFamily: "Poppins_700Bold", fontSize: 10 },
  productRow: { flexDirection: "row", alignItems: "center" },
  productImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: "#f1f5f9" },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  totalPrice: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 13, marginTop: 2 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#94a3b8", fontFamily: "Poppins_500Medium", marginTop: 10 },
});
