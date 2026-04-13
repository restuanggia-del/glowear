import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { API_URL } from "../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutScreen() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("L"); // Default ukuran L
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    const prepareCheckout = async () => {
      try {
        // Ambil data user dari lokal
        const userString = await AsyncStorage.getItem("userData");
        if (userString) setUserData(JSON.parse(userString));

        // Ambil data produk dari API
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data);
      } catch (error) {
        Alert.alert("Error", "Gagal memuat data produk.");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    prepareCheckout();
  }, [productId]);

  const handleIncrement = () => setQty(prev => prev + 1);
  const handleDecrement = () => setQty(prev => (prev > 1 ? prev - 1 : 1));

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  const handleCheckout = async () => {
    if (!userData?.alamat || !userData?.noTelepon) {
      Alert.alert("Data Belum Lengkap", "Silakan lengkapi Alamat dan Nomor Telepon di menu Profil terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      // Simulasi pengiriman pesanan ke backend (Nanti kita buat endpoint-nya)
      // await api.post('/orders', { productId, qty, size, catatan, userId: userData.id });
      
      setTimeout(() => {
        setSubmitting(false);
        Alert.alert("Berhasil!", "Pesanan Anda sedang diproses. Silakan lakukan pembayaran.", [
          { text: "OK", onPress: () => router.push("/(tabs)/profile") } // Arahkan ke profil setelah sukses
        ]);
      }, 1500);

    } catch (error) {
      setSubmitting(false);
      Alert.alert("Gagal", "Terjadi kesalahan sistem saat membuat pesanan.");
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.loadingArea}>
        <Stack.Screen options={{ title: "Checkout", headerStyle: { backgroundColor: "#0f172a" }, headerTintColor: "#fff" }} />
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Detail Pesanan", headerStyle: { backgroundColor: "#0f172a" }, headerTintColor: "#fff", headerTitleStyle: { fontFamily: "Poppins_700Bold" } }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* 1. Rincian Produk */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produk</Text>
          <View style={styles.productCard}>
            <Image source={{ uri: product.gambar?.startsWith('http') ? product.gambar : `${API_URL}/uploads/${product.gambar}` }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{product.namaProduk}</Text>
              <Text style={styles.productPrice}>{formatRupiah(product.harga)}</Text>
            </View>
          </View>
        </View>

        {/* 2. Form Pemesanan (Ukuran & Jumlah) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilih Ukuran</Text>
          <View style={styles.sizeContainer}>
            {['S', 'M', 'L', 'XL', 'XXL'].map((item) => (
              <TouchableOpacity 
                key={item} 
                style={[styles.sizeButton, size === item && styles.sizeButtonActive]}
                onPress={() => setSize(item)}
              >
                <Text style={[styles.sizeText, size === item && styles.sizeTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Jumlah Pesanan</Text>
          <View style={styles.qtyContainer}>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrement}>
              <Ionicons name="remove" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrement}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Catatan Tambahan</Text>
          <TextInput
            style={styles.input}
            placeholder="Warna sablon, detail posisi, dll..."
            placeholderTextColor="#64748b"
            value={catatan}
            onChangeText={setCatatan}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* 3. Info Pengiriman (Dari Profil) */}
        <View style={styles.section}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <Text style={styles.sectionTitle}>Kirim Ke</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
              <Text style={{color: '#38bdf8', fontFamily: 'Poppins_600SemiBold', fontSize: 12}}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressCard}>
            <Ionicons name="location" size={24} color="#38bdf8" />
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>{userData?.nama} ({userData?.noTelepon || "No HP Kosong"})</Text>
              <Text style={styles.addressText}>{userData?.alamat || "Alamat belum diisi! Silakan edit profil."}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* 4. Total & Tombol Konfirmasi */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalPrice}>{formatRupiah(product.harga * qty)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.checkoutBtn} 
          disabled={submitting}
          onPress={handleCheckout}
        >
          {submitting ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.checkoutBtnText}>Buat Pesanan</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  loadingArea: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },
  
  section: { marginBottom: 25 },
  sectionTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16, marginBottom: 12 },
  
  productCard: { flexDirection: "row", backgroundColor: "#1e293b", padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "#334155" },
  productImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: "#334155" },
  productInfo: { flex: 1, marginLeft: 15, justifyContent: "center" },
  productName: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  productPrice: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 16, marginTop: 5 },

  sizeContainer: { flexDirection: "row", gap: 10 },
  sizeButton: { flex: 1, paddingVertical: 12, backgroundColor: "#1e293b", borderRadius: 10, borderWidth: 1, borderColor: "#334155", alignItems: "center" },
  sizeButtonActive: { backgroundColor: "rgba(56, 189, 248, 0.15)", borderColor: "#38bdf8" },
  sizeText: { color: "#94a3b8", fontFamily: "Poppins_600SemiBold" },
  sizeTextActive: { color: "#38bdf8", fontFamily: "Poppins_800ExtraBold" },

  qtyContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", alignSelf: "flex-start", borderRadius: 12, borderWidth: 1, borderColor: "#334155" },
  qtyBtn: { padding: 10, paddingHorizontal: 15 },
  qtyText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 18, width: 40, textAlign: "center" },

  input: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155", borderRadius: 12, color: "#fff", fontFamily: "Poppins_400Regular", padding: 15 },

  addressCard: { flexDirection: "row", backgroundColor: "rgba(56, 189, 248, 0.05)", padding: 15, borderRadius: 16, borderWidth: 1, borderColor: "rgba(56, 189, 248, 0.2)", alignItems: "center" },
  addressInfo: { flex: 1, marginLeft: 15 },
  addressName: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 13, marginBottom: 4 },
  addressText: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18 },

  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#1e293b", flexDirection: "row", padding: 20, paddingBottom: 25, alignItems: "center", borderTopWidth: 1, borderColor: "#334155" },
  totalContainer: { flex: 1 },
  totalLabel: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 11 },
  totalPrice: { color: "#38bdf8", fontFamily: "Poppins_800ExtraBold", fontSize: 22 },
  checkoutBtn: { backgroundColor: "#38bdf8", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  checkoutBtnText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 15 },
});