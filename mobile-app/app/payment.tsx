import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';

export default function PaymentScreen() {
  const { orderId, totalHarga } = useLocalSearchParams();
  const router = useRouter();

  const formatRupiah = (number: any) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(number));
  };

  const copyToClipboard = async (text: string, bank: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Tersalin!", `Nomor rekening ${bank} berhasil disalin ke papan klip.`);
  };

  const handleConfirm = () => {
    Alert.alert(
      "Konfirmasi", 
      "Apakah Anda yakin sudah melakukan transfer? Nanti kita akan buat fitur upload bukti transfer di sini!",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: "Pembayaran", headerStyle: { backgroundColor: "#0f172a" }, headerTintColor: "#fff", headerTitleStyle: { fontFamily: "Poppins_700Bold" } }} />

      {/* Bagian Konten yang Bisa di-Scroll */}
      <ScrollView 
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.billCard}>
          <Text style={styles.billLabel}>Total Pembayaran</Text>
          <Text style={styles.billAmount}>{formatRupiah(totalHarga)}</Text>
          <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
        </View>

        <Text style={styles.sectionTitle}>Pilih Metode Transfer</Text>

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

        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={24} color="#f59e0b" />
          <Text style={styles.warningText}>Pastikan Anda mentransfer tepat sesuai nominal <Text style={{ fontFamily: "Poppins_700Bold", color: "#fff" }}>{formatRupiah(totalHarga)}</Text> agar pesanan dapat diproses secara otomatis.</Text>
        </View>
      </ScrollView>

      {/* Bagian Tombol yang Selalu Menempel di Bawah (Tanpa Absolute) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Saya Sudah Transfer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0f172a" },
  
  // Perbaikan Layout Utama
  scrollArea: { flex: 1 }, 
  scrollContent: { padding: 20, paddingBottom: 30 }, // Padding bottom secukupnya
  
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

  warningBox: { flexDirection: "row", backgroundColor: "rgba(245, 158, 11, 0.1)", padding: 15, borderRadius: 16, marginTop: 10, borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.3)" },
  warningText: { color: "#cbd5e1", fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 20, marginLeft: 10, flex: 1 },

  // Perbaikan Layout Bottom Bar (Menghapus absolute positioning)
  bottomBar: { 
    backgroundColor: "#1e293b", 
    padding: 20, 
    paddingBottom: 25, 
    borderTopWidth: 1, 
    borderColor: "#334155" 
  },
  confirmBtn: { backgroundColor: "#38bdf8", paddingVertical: 15, borderRadius: 14, alignItems: "center" },
  confirmBtnText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 15 },
});