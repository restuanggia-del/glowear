import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Dimensions, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { API_URL } from "../../constants/config";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../../store/cart-store";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Gagal mengambil detail produk", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: Math.random().toString(36).substring(7),
      productId: product.id,
      namaProduk: product.namaProduk,
      harga: product.harga,
      gambar: product.gambar,
      jumlah: 1,
      ukuran: "L", // Default size, could be selectable later
    });
    
    Alert.alert(
      "Berhasil! 🎉",
      "Produk telah ditambahkan ke keranjang.",
      [
        { text: "Lanjut Belanja", style: "cancel" },
        { text: "Lihat Keranjang", onPress: () => router.push("/cart") }
      ]
    );
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingArea}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={60} color="#94a3b8" />
        <Text style={styles.errorText}>Produk tidak ditemukan</Text>
        <TouchableOpacity style={styles.backBtnError} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerTransparent: true, 
          headerTitle: "",
          headerLeft: () => (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Image 
          source={{ 
            uri: product.gambar?.startsWith('http') 
              ? product.gambar 
              : `${API_URL}/uploads/${product.gambar}` 
          }} 
          style={styles.imageFull} 
        />

        <Animated.View entering={FadeInDown.delay(200)} style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category?.namaKategori || "Tanpa Kategori"}</Text>
          </View>
          
          <Text style={styles.title}>{product.namaProduk}</Text>
          <Text style={styles.price}>{formatRupiah(product.harga)}</Text>

          <View style={styles.stockContainer}>
            <Ionicons name="cube-outline" size={18} color="#94a3b8" />
            <Text style={styles.stockText}>Sisa Stok: <Text style={{color: product.stok > 0 ? "#10b981" : "#ef4444", fontFamily: "Poppins_700Bold"}}>{product.stok} Pcs</Text></Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.descTitle}>Deskripsi Produk</Text>
          <Text style={styles.descText}>{product.deskripsi || "Tidak ada deskripsi untuk produk ini."}</Text>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Bar dengan 2 Opsi: Keranjang & Checkout */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.cartButton, product.stok === 0 && styles.disabledButton]} 
          disabled={product.stok === 0}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={24} color="#38bdf8" />
          <Text style={styles.cartButtonText}>Keranjang</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.buyButton, product.stok === 0 && styles.disabledButton]} 
          disabled={product.stok === 0}
          onPress={() => router.push({ pathname: '/checkout', params: { productId: product.id } })}
        >
          <Text style={styles.buyButtonText}>{product.stok === 0 ? "Habis" : "Beli Sekarang"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  loadingArea: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },
  errorText: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 18, marginTop: 10 },
  backBtnError: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#38bdf8", borderRadius: 10 },
  backBtnText: { color: "#0f172a", fontFamily: "Poppins_700Bold" },
  
  backButton: { backgroundColor: "rgba(15, 23, 42, 0.6)", padding: 10, borderRadius: 100, marginLeft: 15, marginTop: 10 },
  
  imageFull: { width: "100%", height: width * 1.1, backgroundColor: "#1e293b", resizeMode: "cover" },
  
  content: { padding: 20, backgroundColor: "#0f172a", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  categoryBadge: { backgroundColor: "rgba(56, 189, 248, 0.15)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "rgba(56, 189, 248, 0.3)" },
  categoryText: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  title: { color: "#fff", fontFamily: "Poppins_800ExtraBold", fontSize: 26, lineHeight: 34 },
  price: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 24, marginTop: 5 },
  
  stockContainer: { flexDirection: "row", alignItems: "center", marginTop: 15, backgroundColor: "#1e293b", padding: 12, borderRadius: 12, alignSelf: "flex-start" },
  stockText: { color: "#94a3b8", fontFamily: "Poppins_500Medium", marginLeft: 8, fontSize: 13, marginTop: 1 },
  
  divider: { height: 1, backgroundColor: "#1e293b", marginVertical: 24 },
  descTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 18, marginBottom: 10 },
  descText: { color: "#cbd5e1", fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 24 },
  
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1e293b",
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 30, 
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  cartButton: { 
    flex: 1,
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "rgba(56, 189, 248, 0.1)", 
    borderWidth: 1, 
    borderColor: "#38bdf8",
    paddingVertical: 16, 
    borderRadius: 16,
    gap: 8,
  },
  cartButtonText: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 14 },
  buyButton: { 
    flex: 1.5,
    backgroundColor: "#38bdf8", 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buyButtonText: { color: "#0f172a", fontFamily: "Poppins_800ExtraBold", fontSize: 15 },
  disabledButton: { backgroundColor: "#334155", borderColor: "#475569", shadowOpacity: 0, elevation: 0 },
});