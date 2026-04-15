import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { api } from "../services/api";

export default function PaymentScreen() {
  const { orderId, totalHarga } = useLocalSearchParams();
  const router = useRouter();

  // State untuk menyimpan gambar bukti transfer
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const formatRupiah = (number: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(number));
  };

  const copyToClipboard = async (text: string, bank: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Tersalin!", `Nomor rekening ${bank} berhasil disalin ke papan klip.`);
  };

  // Fungsi untuk membuka Galeri HP
  const pickImage = async () => {
    // Meminta izin akses galeri (otomatis diurus oleh Expo)
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Hanya gambar
      allowsEditing: true, // Izinkan potong gambar
      aspect: [3, 4], // Rasio standar struk
      quality: 0.8, // Kompresi sedikit agar tidak berat
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  // Fungsi Konfirmasi & Ubah Status
  const handleConfirm = async () => {
    if (!receiptImage) {
      return Alert.alert("Perhatian", "Silakan upload bukti transfer Anda terlebih dahulu agar kami bisa memprosesnya.");
    }

    setUploading(true);
    try {
      // Logika Asli: Kita tembak endpoint update status dari BELUM_BAYAR menjadi DIPROSES
      // (Untuk upload gambar fisik ke server, biasanya butuh konfigurasi Multer di NestJS, 
      // jadi untuk MVP ini kita fokus mengubah status pesanannya agar pindah tab)
      
      await api.put(`/orders/${orderId}/status`, { status: "DIPROSES" });

      Alert.alert(
        "Berhasil!", 
        "Pembayaran sedang diverifikasi. Pesanan Anda kini masuk ke tahap Diproses.",
        [{ text: "Mantap", onPress: () => router.push("/(tabs)/profile") }]
      );
    } catch (error) {
      console.error("Gagal update status:", error);
      Alert.alert("Gagal", "Terjadi kesalahan koneksi saat memproses pembayaran.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Pembayaran", headerStyle: { backgroundColor: "#0f172a" }, headerTintColor: "#fff", headerTitleStyle: { fontFamily: "Poppins_700Bold" } }} />

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Info Total Tagihan */}
        <View style={styles.billCard}>
          <Text style={styles.billLabel}>Total Pembayaran</Text>
          <Text style={styles.billAmount}>{formatRupiah(totalHarga)}</Text>
          <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
        </View>

        <Text style={styles.sectionTitle}>Pilih Metode Transfer</Text>

        {/* Rekening BCA */}
        <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <View style={styles.bankLogoPlaceholder}>
              <Text style={styles.bankLogoText}>BCA</Text>
            </View>
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>Bank Central Asia</Text>
              <Text style={styles.bankOwner}>a.n. Glowear Official</Text>
            </View>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountNumber}>1234 5678 9012</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard("123456789012", "BCA")}>
              <Ionicons name="copy-outline" size={18} color="#38bdf8" />
              <Text style={styles.copyBtnText}>Salin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rekening Mandiri */}
        <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <View style={[styles.bankLogoPlaceholder, { backgroundColor: '#fcd34d' }]}>
              <Text style={[styles.bankLogoText, { color: '#0f172a' }]}>MDR</Text>
            </View>
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>Bank Mandiri</Text>
              <Text style={styles.bankOwner}>a.n. Glowear Official</Text>
            </View>
          </View>
          <View style={styles.accountRow}>
            <Text style={styles.accountNumber}>0987 6543 2109</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={() => copyToClipboard("098765432109", "Mandiri")}>
              <Ionicons name="copy-outline" size={18} color="#38bdf8" />
              <Text style={styles.copyBtnText}>Salin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION UPLOAD BUKTI TRANSFER */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Bukti Transfer</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickImage} activeOpacity={0.8}>
          {receiptImage ? (
            // Jika sudah ada gambar, tampilkan preview-nya
            <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
          ) : (
            // Jika belum, tampilkan ikon upload
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="cloud-upload-outline" size={40} color="#38bdf8" />
              <Text style={styles.uploadText}>Ketuk untuk upload struk/screenshot transfer</Text>
            </View>
          )}
        </TouchableOpacity>
        {receiptImage && (
          <TouchableOpacity onPress={pickImage} style={{ alignSelf: "flex-end", marginTop: 8 }}>
            <Text style={{ color: "#38bdf8", fontFamily: "Poppins_600SemiBold", fontSize: 12 }}>Ganti Gambar</Text>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.confirmBtn, !receiptImage && { backgroundColor: "#334155" }]} 
          onPress={handleConfirm}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={[styles.confirmBtnText, !receiptImage && { color: "#94a3b8" }]}>
              {receiptImage ? "Kirim Bukti Pembayaran" : "Upload Bukti Dulu"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  scrollArea: { flex: 1 }, 
  scrollContent: { padding: 20, paddingBottom: 30 },
  
  billCard: { backgroundColor: "#1e293b", padding: 20, borderRadius: 16, alignItems: "center", marginBottom: 25, borderWidth: 1, borderColor: "#38bdf8" },
  billLabel: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
  billAmount: { color: "#fff", fontFamily: "Poppins_800ExtraBold", fontSize: 32, marginVertical: 5 },
  orderIdText: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 5 },

  sectionTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16, marginBottom: 15 },

  bankCard: { backgroundColor: "#1e293b", padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: "#334155" },
  bankHeader: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: "#334155", paddingBottom: 15, marginBottom: 15 },
  bankLogoPlaceholder: { width: 50, height: 35, backgroundColor: "#0284c7", borderRadius: 6, justifyContent: "center", alignItems: "center" },
  bankLogoText: { color: "#fff", fontFamily: "Poppins_800ExtraBold", fontSize: 12 },
  bankInfo: { marginLeft: 15 },
  bankName: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  bankOwner: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12 },
  accountRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  accountNumber: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 18, letterSpacing: 2 },
  copyBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(56, 189, 248, 0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  copyBtnText: { color: "#38bdf8", fontFamily: "Poppins_600SemiBold", fontSize: 12, marginLeft: 5 },

  // Styling Upload Box Baru
  uploadBox: { backgroundColor: "#1e293b", borderRadius: 16, borderWidth: 2, borderColor: "#334155", borderStyle: "dashed", overflow: "hidden", minHeight: 150, justifyContent: "center", alignItems: "center" },
  uploadPlaceholder: { padding: 30, alignItems: "center" },
  uploadText: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 13, textAlign: "center", marginTop: 10 },
  receiptPreview: { width: "100%", height: 300, resizeMode: "cover" },

  bottomBar: { backgroundColor: "#1e293b", padding: 20, paddingBottom: 25, borderTopWidth: 1, borderColor: "#334155" },
  confirmBtn: { backgroundColor: "#38bdf8", paddingVertical: 15, borderRadius: 14, alignItems: "center" },
  confirmBtnText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 15 },
});