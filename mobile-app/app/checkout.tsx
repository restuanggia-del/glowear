import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { API_URL } from "../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

export default function CheckoutScreen() {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  
  // State untuk menyimpan gambar desain custom
  const [designImage, setDesignImage] = useState<string | null>(null);

  const [product, setProduct] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("L");
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    const prepareCheckout = async () => {
      try {
        const userString = await AsyncStorage.getItem("userData");
        if (userString) setUserData(JSON.parse(userString));

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

  // Fungsi untuk membuka galeri memilih desain
  const pickDesign = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setDesignImage(result.assets[0].uri);
    }
  };

  // Fungsi Checkout menggunakan FormData (Bisa ngirim teks + gambar)
  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Data Dasar
      formData.append('userId', userData.id);
      formData.append('totalHarga', (product.harga * qty).toString());
      formData.append('alamatPengiriman', userData.alamat);
      formData.append('catatanCustom', catatan);
      
      // Data Items diubah ke string
      const itemsData = [{
        productId: product.id,
        jumlah: qty,
        hargaSatuan: product.harga,
        jenisSablon: "DTL"
      }];
      formData.append('items', JSON.stringify(itemsData));

      // Jika user memilih gambar desain, masukkan ke paket pengiriman
      if (designImage) {
        const fileExt = designImage.split('.').pop() || 'jpg';
        formData.append('fileDesain', {
          uri: designImage,
          name: `design-${Date.now()}.${fileExt}`,
          type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
        } as any);
      }

      // Tembak ke endpoint custom
      await api.post('/orders/custom', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert("Berhasil!", "Pesanan Anda telah dibuat.", [
        { text: "OK", onPress: () => router.push("/(tabs)/profile") }
      ]);

    } catch (error) {
      console.log("Error Checkout:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat membuat pesanan.");
    } finally {
      setSubmitting(false);
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

        {/* 2. Form Pemesanan */}
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

          {/* AREA UPLOAD DESAIN CUSTOM */}
          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Desain Sablon Custom (Opsional)</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickDesign} activeOpacity={0.8}>
            {designImage ? (
              <Image source={{ uri: designImage }} style={styles.designPreview} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="image-outline" size={36} color="#38bdf8" />
                <Text style={styles.uploadText}>Ketuk untuk melampirkan gambar referensi atau desain Anda</Text>
              </View>
            )}
          </TouchableOpacity>
          {designImage && (
            <TouchableOpacity onPress={() => setDesignImage(null)} style={{ alignSelf: "flex-end", marginTop: 8 }}>
              <Text style={{ color: "#ef4444", fontFamily: "Poppins_600SemiBold", fontSize: 12 }}>Batal Pakai Gambar</Text>
            </TouchableOpacity>
          )}

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

        {/* 3. Info Pengiriman */}
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

      {/* 4. Total & Tombol */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Tagihan</Text>
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

  // Style untuk Upload Desain Custom
  uploadBox: { backgroundColor: "#1e293b", borderRadius: 12, borderWidth: 2, borderColor: "#334155", borderStyle: "dashed", overflow: "hidden", minHeight: 120, justifyContent: "center", alignItems: "center" },
  uploadPlaceholder: { padding: 20, alignItems: "center" },
  uploadText: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, textAlign: "center", marginTop: 8 },
  designPreview: { width: "100%", height: 200, resizeMode: "contain", backgroundColor: "#0f172a" },

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