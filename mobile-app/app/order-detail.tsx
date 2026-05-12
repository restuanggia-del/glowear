import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Platform, StatusBar, TouchableOpacity, Alert, Linking, Modal, TextInput } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useAlert } from "../components/CustomAlert";
import { api } from "../services/api";
import { API_URL } from "../constants/config";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderDetailScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Review State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    showAlert({
      title: "Tersalin",
      message: "Nomor resi berhasil disalin ke clipboard!",
      type: "success"
    });
  };

  const openTracking = (kurir: string, resi: string) => {
    // Sebagai fallback, kita bisa arahkan ke cekresi.com
    const url = `https://cekresi.com/?noresi=${resi}`;
    Linking.openURL(url).catch(() => {
      showAlert({
        title: "Error",
        message: "Gagal membuka browser.",
        type: "error"
      });
    });
  };

  // Logika Timeline Jejak
  const getTimelineSteps = (currentStatus: string) => {
    if (currentStatus === 'DIBATALKAN') {
      return [
        { label: 'Pesanan Dibuat', completed: true },
        { label: 'Pesanan Dibatalkan', completed: true, isError: true }
      ];
    }
    
    const steps = [
      { id: 'PENDING', label: 'Pesanan Dibuat' },
      { id: 'DIPROSES', label: 'Pembayaran Dikonfirmasi & Diproses' },
      { id: 'DIKIRIM', label: 'Pesanan Dikirim' },
      { id: 'SELESAI', label: 'Pesanan Selesai' }
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStatus);
    return steps.map((s, index) => ({
      ...s,
      completed: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
  };

  const pickImage = async () => {
    if (reviewImages.length >= 5) {
      return showAlert({
        title: "Batas Maksimal",
        message: "Maksimal 5 foto ulasan.",
        type: "warning"
      });
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - reviewImages.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setReviewImages(prev => [...prev, ...uris].slice(0, 5));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setReviewImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const submitReview = async () => {
    setSubmittingReview(true);
    try {
      const userString = await AsyncStorage.getItem("userData");
      const user = userString ? JSON.parse(userString) : null;
      if (!user) {
        showAlert({
          title: "Error",
          message: "Sesi login tidak valid.",
          type: "error"
        });
        return;
      }

      const formData = new FormData();
      formData.append("orderId", orderId as string);
      formData.append("userId", user.id);
      formData.append("rating", rating.toString());
      formData.append("komentar", reviewText);

      if (reviewImages.length > 0) {
        reviewImages.forEach((uri) => {
          const filename = uri.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;
          formData.append('foto', { uri, name: filename, type } as any);
        });
      }

      await api.post("/reviews", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert({
        title: "Berhasil",
        message: "Terima kasih atas ulasan Anda!",
        type: "success"
      });
      setIsReviewModalOpen(false);
      
      // Update local state to hide button
      setOrder({...order, status: 'SELESAI'});
    } catch (error) {
      console.error("Gagal mengirim ulasan:", error);
      showAlert({
        title: "Gagal",
        message: "Terjadi kesalahan saat mengirim ulasan.",
        type: "error"
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <Stack.Screen options={{ title: "Detail Pesanan", headerStyle: { backgroundColor: "#ffffff" }, headerTintColor: "#1e293b", headerShadowVisible: false }} />
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingArea}>
        <Stack.Screen options={{ title: "Detail Pesanan", headerStyle: { backgroundColor: "#ffffff" }, headerTintColor: "#1e293b", headerShadowVisible: false }} />
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
        headerStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#1e293b",
        headerTitleStyle: { fontFamily: "Poppins_700Bold" },
        headerShadowVisible: false
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

        {/* JEJAK PESANAN (TIMELINE) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="map-outline" size={16} color="#38bdf8" /> Jejak Pesanan
          </Text>
          <View style={styles.timelineCard}>
            {getTimelineSteps(order.status).map((step, index, arr) => (
              <View key={index} style={styles.timelineRow}>
                <View style={styles.timelineDotContainer}>
                  <View style={[
                    styles.timelineDot,
                    step.completed ? (step.isError ? styles.timelineDotError : styles.timelineDotActive) : styles.timelineDotInactive
                  ]}>
                    {step.completed && <Ionicons name={step.isError ? "close" : "checkmark"} size={12} color="#fff" />}
                  </View>
                  {index < arr.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      step.completed && !step.isCurrent ? styles.timelineLineActive : styles.timelineLineInactive
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineLabel,
                    step.completed ? (step.isError ? {color: '#ef4444'} : {color: '#1e293b'}) : {color: '#94a3b8'},
                    step.isCurrent && {fontFamily: 'Poppins_700Bold'}
                  ]}>
                    {step.label}
                  </Text>
                  
                  {/* Tampilkan Kurir & Resi jika langkah ini adalah DIKIRIM dan sedang aktif/sudah lewat */}
                  {step.id === 'DIKIRIM' && step.completed && order.nomorResi && (
                    <View style={styles.resiBox}>
                      <View style={{flex: 1}}>
                        <Text style={styles.kurirName}>{order.kurir || "Kurir Reguler"}</Text>
                        <Text style={styles.resiNumber}>{order.nomorResi}</Text>
                      </View>
                      <View style={{flexDirection: 'row', gap: 8}}>
                        <TouchableOpacity onPress={() => copyToClipboard(order.nomorResi)} style={styles.iconBtn}>
                          <Ionicons name="copy-outline" size={16} color="#38bdf8" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openTracking(order.kurir, order.nomorResi)} style={styles.iconBtnFilled}>
                          <Ionicons name="search" size={16} color="#0f172a" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

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
                    <View style={{ marginTop: 6, backgroundColor: "#f1f5f9", padding: 8, borderRadius: 8 }}>
                      <Text style={{ color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 11 }}>
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

        {/* TOMBOL AKSI KONTEKSTUAL */}
        <View style={{ marginTop: 10, gap: 12 }}>
          {/* 1. Tombol Bayar (Jika belum lunas dan tidak dibatalkan) */}
          {order.statusPembayaran !== 'LUNAS' && order.status !== 'DIBATALKAN' && (
            <TouchableOpacity 
              style={[styles.receiveButton, { backgroundColor: '#3b82f6' }]}
              onPress={() => router.push({ 
                pathname: '/payment', 
                params: { orderId: order.id, totalHarga: order.totalHarga } 
              })}
            >
              <Ionicons name="wallet-outline" size={20} color="#fff" />
              <Text style={[styles.receiveButtonText, { color: '#fff' }]}>
                {order.statusPembayaran === 'DP' ? 'Konfirmasi Pelunasan' : 'Bayar Sekarang'}
              </Text>
            </TouchableOpacity>
          )}

          {/* 2. Tombol Pesanan Diterima (Hanya jika status DIKIRIM) */}
          {order.status === 'DIKIRIM' && (
            <TouchableOpacity 
              style={styles.receiveButton}
              onPress={() => setIsReviewModalOpen(true)}
            >
              <Ionicons name="checkmark-done-circle" size={20} color="#0f172a" />
              <Text style={styles.receiveButtonText}>Pesanan Diterima</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* MODAL ULASAN */}
      <Modal visible={isReviewModalOpen} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pesanan Diterima!</Text>
              <TouchableOpacity onPress={() => setIsReviewModalOpen(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Bagaimana kualitas produk dan layanan kami?</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons 
                    name={star <= rating ? "star" : "star-outline"} 
                    size={40} 
                    color={star <= rating ? "#f59e0b" : "#64748b"} 
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Ceritakan kepuasan Anda (Opsional)..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              value={reviewText}
              onChangeText={setReviewText}
            />

            {reviewImages.length < 5 && (
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <Ionicons name="camera-outline" size={20} color="#38bdf8" />
                <Text style={styles.imagePickerText}>
                  Unggah Foto ({reviewImages.length}/5)
                </Text>
              </TouchableOpacity>
            )}

            {reviewImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewContainer}>
                {reviewImages.map((uri, idx) => (
                  <View key={idx} style={styles.previewImageWrapper}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity 
                      style={styles.removeImageBtn} 
                      onPress={() => removeImage(idx)}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity 
              style={styles.submitReviewBtn} 
              onPress={submitReview}
              disabled={submittingReview}
            >
              {submittingReview ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.submitReviewText}>Kirim Ulasan & Selesaikan Pesanan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  loadingArea: { flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center" },

  statusBanner: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 16, marginBottom: 20 },
  statusLabel: { fontFamily: "Poppins_700Bold", fontSize: 16 },
  statusDate: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 2 },

  // Timeline Styles
  timelineCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  timelineRow: { flexDirection: "row", minHeight: 60 },
  timelineDotContainer: { alignItems: "center", width: 30 },
  timelineDot: { width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center", zIndex: 2 },
  timelineDotActive: { backgroundColor: "#3b82f6", shadowColor: "#3b82f6", shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  timelineDotError: { backgroundColor: "#ef4444" },
  timelineDotInactive: { backgroundColor: "#e2e8f0", borderWidth: 2, borderColor: "#cbd5e1" },
  timelineLine: { width: 2, flex: 1, marginVertical: -2 },
  timelineLineActive: { backgroundColor: "#3b82f6" },
  timelineLineInactive: { backgroundColor: "#e2e8f0" },
  timelineContent: { flex: 1, paddingLeft: 10, paddingBottom: 25, marginTop: -2 },
  timelineLabel: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  
  resiBox: { marginTop: 10, backgroundColor: "rgba(59,130,246,0.06)", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(59,130,246,0.15)", flexDirection: "row", alignItems: "center" },
  kurirName: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  resiNumber: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 14, marginTop: 2 },
  iconBtn: { padding: 8, backgroundColor: "rgba(59,130,246,0.08)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(59,130,246,0.2)" },
  iconBtnFilled: { padding: 8, backgroundColor: "#3b82f6", borderRadius: 8 },

  section: { marginBottom: 24 },
  sectionTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 15, marginBottom: 12 },

  itemCard: { flexDirection: "row", backgroundColor: "#ffffff", padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 10, alignItems: "flex-start", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  itemImage: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#f1f5f9" },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 13, lineHeight: 18 },
  itemMeta: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 3 },
  itemTotal: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 13, marginLeft: 8 },

  sablonBadge: { alignSelf: "flex-start", marginTop: 6, backgroundColor: "rgba(59,130,246,0.08)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: "rgba(59,130,246,0.2)" },
  sablonText: { color: "#3b82f6", fontFamily: "Poppins_600SemiBold", fontSize: 10 },

  summaryCard: { backgroundColor: "#ffffff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#f1f5f9" },
  summaryLabel: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 13 },
  summaryValue: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 14 },

  payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  payBadgeText: { fontFamily: "Poppins_700Bold", fontSize: 11 },

  addressCard: { backgroundColor: "#ffffff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  addressName: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 14 },
  addressPhone: { color: "#3b82f6", fontFamily: "Poppins_500Medium", fontSize: 12, marginTop: 2 },
  addressText: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 6, lineHeight: 20 },

  noteText: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },

  receiveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#3b82f6", paddingVertical: 16, borderRadius: 16, marginTop: 10, shadowColor: "#3b82f6", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  receiveButtonText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 15, marginLeft: 8 },

  // Modal Review Styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, minHeight: "50%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  modalTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 20 },
  modalSubtitle: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 13, marginBottom: 20 },
  
  starsContainer: { flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 25 },
  
  reviewInput: { backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, color: "#1e293b", fontFamily: "Poppins_400Regular", paddingHorizontal: 15, paddingVertical: 15, height: 100, textAlignVertical: 'top', marginBottom: 20 },
  
  imagePickerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(59,130,246,0.08)", paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(59,130,246,0.2)", marginBottom: 15 },
  imagePickerText: { color: "#3b82f6", fontFamily: "Poppins_600SemiBold", fontSize: 13, marginLeft: 8 },
  
  previewContainer: { marginBottom: 20, flexDirection: 'row' },
  previewImageWrapper: { position: 'relative', marginRight: 10 },
  previewImage: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  removeImageBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: "#ef4444", borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: "#fff" },
  
  submitReviewBtn: { backgroundColor: "#3b82f6", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 10, marginBottom: 20 },
  submitReviewText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 15 }
});
