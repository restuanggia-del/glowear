import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Image, ActivityIndicator, Dimensions, Platform } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useAlert } from "../components/CustomAlert";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get("window");

export default function PaymentScreen() {
  const { showAlert } = useAlert();
  const { orderId, totalHarga } = useLocalSearchParams();
  const router = useRouter();

  const [settings, setSettings] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch settings saat mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
      } catch (error) {
        console.log("Error fetching settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const formatRupiah = (number: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(number));
  };

  const copyToClipboard = async (text: string, bank: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
    showAlert({
      title: "Tersalin!",
      message: `Nomor rekening ${bank} berhasil disalin.`,
      type: "success"
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleConfirm = async () => {
    if (!receiptImage) {
      return showAlert({
        title: "Perhatian",
        message: "Silakan upload bukti transfer Anda terlebih dahulu.",
        type: "warning"
      });
    }

    setUploading(true);
    try {
      const formData = new FormData();
      const fileExt = receiptImage.split('.').pop() || 'jpeg';
      const fileName = `struk-${orderId}.${fileExt}`;

      formData.append('struk', {
        uri: receiptImage,
        name: fileName,
        type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
      } as any);

      // Hanya upload bukti pembayaran — admin yang akan memverifikasi & mengubah status
      await api.post(`/orders/${orderId}/upload-receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert({
        title: "Bukti Terkirim! ✅",
        message: "Bukti pembayaran Anda telah terkirim.\n\nAdmin akan memverifikasi dan memproses pesanan Anda segera.",
        type: "success",
        onConfirm: () => router.push("/my-orders")
      });
      
    } catch (error: any) {
      console.log("Error Upload:", error.response?.data || error.message);
      showAlert({
        title: "Gagal",
        message: "Gagal mengupload bukti transfer. Pastikan koneksi internet Anda lancar.",
        type: "error"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loadingSettings) {
    return (
      <View style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: "#64748b", marginTop: 15, fontFamily: 'Poppins_500Medium' }}>Memuat informasi pembayaran...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ 
        title: "Konfirmasi Pembayaran", 
        headerStyle: { backgroundColor: "#ffffff" }, 
        headerTintColor: "#1e293b", 
        headerTitleStyle: { fontFamily: "Poppins_700Bold", fontSize: 16 },
        headerShadowVisible: false
      }} />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Progress Stepper */}
        <View style={styles.stepper}>
          <View style={styles.step}>
            <View style={[styles.stepDot, styles.stepDotActive]}><Text style={styles.stepNum}>1</Text></View>
            <Text style={[styles.stepText, styles.stepTextActive]}>Transfer</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.step}>
            <View style={[styles.stepDot, receiptImage && styles.stepDotActive]}><Text style={styles.stepNum}>2</Text></View>
            <Text style={[styles.stepText, receiptImage && styles.stepTextActive]}>Upload</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.step}>
            <View style={styles.stepDot}><Text style={styles.stepNum}>3</Text></View>
            <Text style={styles.stepText}>Verifikasi</Text>
          </View>
        </View>

        {/* Bill Summary Card */}
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <View>
              <Text style={styles.billLabel}>Total Tagihan</Text>
              <Text style={styles.billAmount}>{formatRupiah(totalHarga)}</Text>
            </View>
            <View style={styles.orderBadge}>
              <Text style={styles.orderBadgeText}>ORD-{orderId.toString().substring(0, 6).toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.billFooter}>
            <Ionicons name="time-outline" size={14} color="#3b82f6" />
            <Text style={styles.billExpiry}>Selesaikan pembayaran dalam 24 jam</Text>
          </View>
        </View>

        {/* Bank Card (Premium Look) */}
        <Text style={styles.sectionTitle}>Tujuan Transfer</Text>
        <View style={styles.bankCard}>
          <View style={styles.bankCardTop}>
            <View>
              <Text style={styles.bankNameLabel}>{settings?.namaBank || "BANK TRANSFER"}</Text>
              <Text style={styles.bankOwnerName}>{settings?.atasNamaBank || "Glowear Official"}</Text>
            </View>
            <MaterialCommunityIcons name="chip" size={32} color="#fcd34d" />
          </View>
          
          <View style={styles.bankCardBody}>
            <Text style={styles.cardNumberText}>
              {settings?.nomorRekening?.match(/.{1,4}/g)?.join('  ') || "xxxx  xxxx  xxxx"}
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.bankCardAction} 
            onPress={() => copyToClipboard(settings?.nomorRekening, settings?.namaBank)}
            activeOpacity={0.7}
          >
            <Ionicons name={copied ? "checkmark-circle" : "copy-outline"} size={18} color="#fff" />
            <Text style={styles.bankCardActionText}>{copied ? "Berhasil Salin" : "Salin No. Rekening"}</Text>
          </TouchableOpacity>
        </View>

        {/* Syarat & Ketentuan Card */}
        {settings?.syaratKetentuan && (
          <View style={styles.infoBox}>
            <View style={styles.infoBoxHeader}>
              <Ionicons name="information-circle" size={18} color="#3b82f6" />
              <Text style={styles.infoBoxTitle}>Informasi Penting</Text>
            </View>
            <Text style={styles.infoBoxContent}>{settings.syaratKetentuan}</Text>
          </View>
        )}

        {/* Upload Section */}
        <Text style={styles.sectionTitle}>Bukti Pembayaran</Text>
        <TouchableOpacity style={styles.uploadContainer} onPress={pickImage} activeOpacity={0.9}>
          {receiptImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: receiptImage }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <View style={styles.changeBtn}>
                  <Ionicons name="camera-outline" size={20} color="#fff" />
                  <Text style={styles.changeBtnText}>Ganti Foto</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload" size={32} color="#3b82f6" />
              </View>
              <Text style={styles.uploadMainText}>Klik untuk Unggah Struk</Text>
              <Text style={styles.uploadSubText}>Format JPG, PNG atau Screenshot</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.confirmBtn, !receiptImage && styles.confirmBtnDisabled]} 
          onPress={handleConfirm}
          disabled={uploading || !receiptImage}
          activeOpacity={0.8}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.confirmBtnContent}>
              <Text style={[styles.confirmBtnText, !receiptImage && { color: "#64748b" }]}>
                {receiptImage ? "Konfirmasi Pembayaran" : "Upload Bukti Terlebih Dahulu"}
              </Text>
              {receiptImage && <Ionicons name="arrow-forward" size={18} color="#0f172a" />}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8fafc" },
  scrollArea: { flex: 1 }, 
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 32 },
  step: { alignItems: "center", gap: 6 },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#e2e8f0", justifyContent: "center", alignItems: "center" },
  stepDotActive: { backgroundColor: "#3b82f6" },
  stepNum: { fontSize: 10, fontFamily: "Poppins_700Bold", color: "#fff" },
  stepText: { fontSize: 10, color: "#94a3b8", fontFamily: "Poppins_600SemiBold" },
  stepTextActive: { color: "#1e293b" },
  stepLine: { width: 30, height: 2, backgroundColor: "#e2e8f0", marginHorizontal: 8, marginTop: -15 },

  billCard: { backgroundColor: "#ffffff", borderRadius: 24, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  billHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  billLabel: { color: "#64748b", fontFamily: "Poppins_600SemiBold", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 },
  billAmount: { color: "#1e293b", fontFamily: "Poppins_800ExtraBold", fontSize: 32, marginTop: 4 },
  orderBadge: { backgroundColor: "rgba(59, 130, 246, 0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.2)" },
  orderBadgeText: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 11 },
  billFooter: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 16, borderTopWidth: 1, borderColor: "#f1f5f9" },
  billExpiry: { color: "#3b82f6", fontFamily: "Poppins_500Medium", fontSize: 12 },

  sectionTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 18, marginBottom: 16 },

  bankCard: { backgroundColor: "#0369a1", borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: "#0369a1", shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
  bankCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 },
  bankNameLabel: { color: "rgba(255,255,255,0.7)", fontFamily: "Poppins_700Bold", fontSize: 12, letterSpacing: 1 },
  bankOwnerName: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 18, marginTop: 2 },
  bankCardBody: { marginBottom: 24 },
  cardNumberText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 24, letterSpacing: 2 },
  bankCardAction: { backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "flex-start", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  bankCardActionText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 12 },

  infoBox: { backgroundColor: "rgba(59, 130, 246, 0.04)", borderRadius: 20, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.12)" },
  infoBoxHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  infoBoxTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 14 },
  infoBoxContent: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 22 },

  uploadContainer: { backgroundColor: "#ffffff", borderRadius: 24, borderWidth: 2, borderColor: "#e2e8f0", borderStyle: "dashed", overflow: "hidden", minHeight: 180 },
  uploadPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  uploadIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(59, 130, 246, 0.08)", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  uploadMainText: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 15 },
  uploadSubText: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 4 },
  
  imagePreviewContainer: { width: "100%", height: 350 },
  imagePreview: { width: "100%", height: "100%", resizeMode: "cover" },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.4)", justifyContent: "center", alignItems: "center" },
  changeBtn: { backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  changeBtnText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },

  bottomBar: { backgroundColor: "#ffffff", padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: "#94a3b8", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 15 },
  confirmBtn: { backgroundColor: "#3b82f6", height: 60, borderRadius: 18, justifyContent: "center", alignItems: "center", shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  confirmBtnDisabled: { backgroundColor: "#e2e8f0", shadowOpacity: 0, elevation: 0 },
  confirmBtnContent: { flexDirection: "row", alignItems: "center", gap: 10 },
  confirmBtnText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16 },
});