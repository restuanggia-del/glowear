import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Platform, StatusBar } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { API_URL } from "../constants/config";
import { Ionicons } from "@expo/vector-icons";

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (error) {
        console.error("Gagal mengambil detail pesanan:", error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  const formatDate = (dateString: any) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING": return { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Menunggu Pembayaran", icon: "time-outline" as const };
      case "DIPROSES": return { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Sedang Diproses", icon: "construct-outline" as const };
      case "DIKIRIM": return { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Dalam Pengiriman", icon: "car-outline" as const };
      case "SELESAI": return { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", label: "Pesanan Selesai", icon: "checkmark-circle-outline" as const };
      case "DIBATALKAN": return { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Dibatalkan", icon: "close-circle-outline" as const };
      default: return { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", label: status, icon: "help-circle-outline" as const };
    }
  };

  const getPaymentLabel = (status: string) => {
    switch (status) {
      case "BELUM_BAYAR": return "Belum Bayar";
      case "DP": return "DP (Uang Muka)";
      case "LUNAS": return "Lunas";
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <Stack.Screen options={{ title: "Detail Pesanan", headerStyle: { backgroundColor: "#0f172a" }, headerTintColor: "#fff" }} />
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingArea}>
        <Stack.Screen options={{ title: "Detail Pesanan", headerStyle: { backgroundColor: "#0f172a" }, headerTintColor: "#fff" }} />
        <Ionicons name="alert-circle-outline" size={48} color="#64748b" />
        <Text style={{ color: "#64748b", fontFamily: "Poppins_500Medium", marginTop: 12 }}>Pesanan tidak ditemukan</Text>
      </View>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: "Detail Pesanan",
        headerStyle: { backgroundColor: "#0f172a" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontFamily: "Poppins_700Bold" }
      }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* STATUS BANNER */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={28} color={statusConfig.color} />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            <Text style={styles.statusDate}>Dipesan: {formatDate(order.waktuDibuat)}</Text>
          </View>
        </View>

        {/* NOMOR RESI */}
        {order.nomorResi && (
          <View style={styles.resiCard}>
            <Ionicons name="bus-outline" size={20} color="#10b981" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 11, textTransform: "uppercase" }}>Nomor Resi</Text>
              <Text style={{ color: "#10b981", fontFamily: "Poppins_700Bold", fontSize: 15, marginTop: 2 }}>{order.nomorResi}</Text>
            </View>
          </View>
        )}

        {/* DAFTAR ITEM PESANAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="cube-outline" size={16} color="#38bdf8" /> Produk Dipesan ({order.items?.length || 0} item)
          </Text>

          {order.items?.map((item: any, index: number) => {
            const imgSrc = item.product?.gambar
              ? (item.product.gambar.startsWith("http") ? item.product.gambar : `${API_URL}/uploads/${item.product.gambar}`)
              : "https://via.placeholder.com/80";

            return (
              <View key={item.id || index} style={styles.itemCard}>
                <Image source={{ uri: imgSrc }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product?.namaProduk || "Produk (dihapus)"}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {item.jumlah} pcs × {formatRupiah(item.hargaSatuan)}
                  </Text>
                  {item.jenisSablon && (
                    <View style={styles.sablonBadge}>
                      <Text style={styles.sablonText}>Sablon: {item.jenisSablon}</Text>
                    </View>
                  )}
                  {/* Status Desain Custom */}
                  {item.statusDesain && item.statusDesain !== "MENUNGGU" && (
                    <View style={[styles.sablonBadge, {
                      backgroundColor: item.statusDesain === "DISETUJUI" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      borderColor: item.statusDesain === "DISETUJUI" ? "#10b981" : "#ef4444"
                    }]}>
                      <Text style={[styles.sablonText, {
                        color: item.statusDesain === "DISETUJUI" ? "#10b981" : "#ef4444"
                      }]}>
                        Desain: {item.statusDesain === "DISETUJUI" ? "Disetujui ✓" : "Ditolak ✗"}
                      </Text>
                    </View>
                  )}
                  {/* Catatan Admin */}
                  {item.catatanAdmin && (
                    <View style={{ marginTop: 6, backgroundColor: "#0f172a", padding: 8, borderRadius: 8 }}>
                      <Text style={{ color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 11 }}>
                        Catatan Admin: {item.catatanAdmin}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.itemTotal}>{formatRupiah(item.jumlah * item.hargaSatuan)}</Text>
              </View>
            );
          })}
        </View>

        {/* RINGKASAN PEMBAYARAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="wallet-outline" size={16} color="#38bdf8" /> Ringkasan Pembayaran
          </Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Harga</Text>
              <Text style={styles.summaryValue}>{formatRupiah(order.totalHarga)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status Pembayaran</Text>
              <View style={[styles.payBadge, {
                backgroundColor: order.statusPembayaran === "LUNAS" ? "rgba(16,185,129,0.12)" :
                  order.statusPembayaran === "DP" ? "rgba(59,130,246,0.12)" : "rgba(245,158,11,0.12)"
              }]}>
                <Text style={[styles.payBadgeText, {
                  color: order.statusPembayaran === "LUNAS" ? "#10b981" :
                    order.statusPembayaran === "DP" ? "#3b82f6" : "#f59e0b"
                }]}>
                  {getPaymentLabel(order.statusPembayaran)}
                </Text>
              </View>
            </View>
            {order.dpAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>DP Dibayar</Text>
                <Text style={[styles.summaryValue, { color: "#10b981" }]}>{formatRupiah(order.dpAmount)}</Text>
              </View>
            )}
            {order.sisaPembayaran > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sisa Pembayaran</Text>
                <Text style={[styles.summaryValue, { color: "#ef4444" }]}>{formatRupiah(order.sisaPembayaran)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* INFO PENGIRIMAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={16} color="#38bdf8" /> Alamat Pengiriman
          </Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{order.pengguna?.nama || "Pelanggan"}</Text>
            {order.pengguna?.noTelp && (
              <Text style={styles.addressPhone}>{order.pengguna.noTelp}</Text>
            )}
            <Text style={styles.addressText}>{order.alamatPengiriman}</Text>
          </View>
        </View>

        {/* CATATAN CUSTOM */}
        {order.catatanCustom && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="chatbox-ellipses-outline" size={16} color="#38bdf8" /> Catatan Pesanan
            </Text>
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>{order.catatanCustom}</Text>
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  loadingArea: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },

  statusBanner: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 16, marginBottom: 16 },
  statusLabel: { fontFamily: "Poppins_700Bold", fontSize: 16 },
  statusDate: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },

  resiCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(16,185,129,0.08)", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", marginBottom: 20 },

  section: { marginBottom: 24 },
  sectionTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 15, marginBottom: 12 },

  itemCard: { flexDirection: "row", backgroundColor: "#1e293b", padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "#334155", marginBottom: 10, alignItems: "flex-start" },
  itemImage: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#334155" },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 13, lineHeight: 18 },
  itemMeta: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 3 },
  itemTotal: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 13, marginLeft: 8 },

  sablonBadge: { alignSelf: "flex-start", marginTop: 6, backgroundColor: "rgba(56,189,248,0.12)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: "rgba(56,189,248,0.3)" },
  sablonText: { color: "#38bdf8", fontFamily: "Poppins_600SemiBold", fontSize: 10 },

  summaryCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#334155" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#293548" },
  summaryLabel: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 13 },
  summaryValue: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },

  payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  payBadgeText: { fontFamily: "Poppins_700Bold", fontSize: 11 },

  addressCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#334155" },
  addressName: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },
  addressPhone: { color: "#38bdf8", fontFamily: "Poppins_500Medium", fontSize: 12, marginTop: 2 },
  addressText: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 6, lineHeight: 20 },

  noteCard: { backgroundColor: "#1e293b", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#334155" },
  noteText: { color: "#cbd5e1", fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
});
