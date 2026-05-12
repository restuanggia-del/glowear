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
        <ActivityIndicator size="large" color="#3b82f6" />
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
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
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
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loadingArea: { flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center" },
  errorText: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 18, marginTop: 10 },
  backBtnError: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#3b82f6", borderRadius: 10 },
  backBtnText: { color: "#fff", fontFamily: "Poppins_700Bold" },
  
  backButton: { backgroundColor: "rgba(255, 255, 255, 0.9)", padding: 10, borderRadius: 100, marginLeft: 15, marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  
  imageFull: { width: "100%", height: width * 1.1, backgroundColor: "#f1f5f9", resizeMode: "cover" },
  
  content: { padding: 20, backgroundColor: "#f8fafc", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  categoryBadge: { backgroundColor: "rgba(59, 130, 246, 0.1)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.2)" },
  categoryText: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  title: { color: "#1e293b", fontFamily: "Poppins_800ExtraBold", fontSize: 26, lineHeight: 34 },
  price: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 24, marginTop: 5 },
  
  stockContainer: { flexDirection: "row", alignItems: "center", marginTop: 15, backgroundColor: "#ffffff", padding: 12, borderRadius: 12, alignSelf: "flex-start", borderWidth: 1, borderColor: "#f1f5f9" },
  stockText: { color: "#64748b", fontFamily: "Poppins_500Medium", marginLeft: 8, fontSize: 13, marginTop: 1 },
  
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 24 },
  descTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 18, marginBottom: 10 },
  descText: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 24 },
  
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 30, 
    alignItems: "center",
    gap: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
  },
  cartButton: { 
    flex: 1,
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: "rgba(59, 130, 246, 0.08)", 
    borderWidth: 1, 
    borderColor: "#3b82f6",
    paddingVertical: 16, 
    borderRadius: 16,
    gap: 8,
  },
  cartButtonText: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 14 },
  buyButton: { 
    flex: 1.5,
    backgroundColor: "#3b82f6", 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buyButtonText: { color: "#fff", fontFamily: "Poppins_800ExtraBold", fontSize: 15 },
  disabledButton: { backgroundColor: "#e2e8f0", borderColor: "#cbd5e1", shadowOpacity: 0, elevation: 0 },
});