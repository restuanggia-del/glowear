import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Dimensions, Alert, FlatList, Modal } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { API_URL } from "../../constants/config";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../../store/cart-store";
import { useWishlistStore } from "../../store/wishlist-store";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Skeleton from "../../components/Skeleton";
import { useAlert } from "../../components/CustomAlert";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const { showAlert } = useAlert();
  const addItem = useCartStore((state) => state.addItem);
  
  const { toggleWishlist, wishlistIds } = useWishlistStore();
  
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [user, setUser] = useState<any>(null);

  // State untuk bottom sheet pilihan ukuran
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("L");
  const [addMode, setAddMode] = useState<"cart" | "checkout">("cart");

  useEffect(() => {
    const fetchUserAndProduct = async () => {
      try {
        const userString = await AsyncStorage.getItem("userData");
        if (userString) setUser(JSON.parse(userString));

        const [resProduct, resReviews] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`)
        ]);
        setProduct(resProduct.data);
        setReviews(resReviews.data);
      } catch (error) {
        console.error("Gagal mengambil detail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndProduct();
  }, [id]);

  const openSizeModal = (mode: "cart" | "checkout") => {
    setAddMode(mode);
    setShowSizeModal(true);
  };

  const confirmSize = () => {
    setShowSizeModal(false);
    if (addMode === "cart") {
      if (!product) return;
      addItem({
        id: Math.random().toString(36).substring(7),
        productId: product.id,
        namaProduk: product.namaProduk,
        harga: product.harga,
        gambar: product.gambar,
        jumlah: 1,
        ukuran: selectedSize,
      });
      showAlert({
        title: "Berhasil! 🎉",
        message: `${product.namaProduk} (Ukuran ${selectedSize}) ditambahkan ke keranjang!`,
        type: "success"
      });
    } else {
      router.push({ pathname: '/checkout', params: { productId: product.id } });
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  const getPhotoArray = (fotoString: string) => {
    if (!fotoString) return [];
    try {
      const parsed = JSON.parse(fotoString);
      return Array.isArray(parsed) ? parsed : [fotoString];
    } catch (e) {
      return [fotoString];
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: 80 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Skeleton height={400} borderRadius={0} />
        <View style={{ padding: 20, marginTop: -30 }}>
          <Skeleton width={100} height={28} borderRadius={8} style={{ marginBottom: 12 }} />
          <Skeleton width="90%" height={30} borderRadius={8} style={{ marginBottom: 8 }} />
          <Skeleton width="60%" height={28} borderRadius={8} style={{ marginBottom: 20 }} />
          <Skeleton height={48} borderRadius={12} style={{ marginBottom: 24 }} />
          <Skeleton height={1} borderRadius={1} style={{ marginBottom: 24 }} />
          <Skeleton width={180} height={22} borderRadius={8} style={{ marginBottom: 12 }} />
          <Skeleton height={80} borderRadius={8} />
        </View>
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
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={[styles.backButton, { marginRight: 15 }]} 
              onPress={() => {
                if (!user) return Alert.alert("Oops", "Silakan login untuk menyimpan produk ke favorit.");
                if (product) toggleWishlist(user.id, product.id);
              }}
            >
              <Ionicons 
                name={product && wishlistIds.includes(product.id) ? "heart" : "heart-outline"} 
                size={24} 
                color={product && wishlistIds.includes(product.id) ? "#ef4444" : "#1e293b"} 
              />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View>
          <FlatList 
            data={getPhotoArray(product.gambar)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveIndex(Math.round(x / width));
            }}
            renderItem={({ item }) => (
              <Image 
                source={{ 
                  uri: item?.startsWith('http') 
                    ? item 
                    : `${API_URL}/uploads/${item}` 
                }} 
                style={styles.imageFull} 
              />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          {getPhotoArray(product.gambar).length > 1 && (
            <View style={styles.pagination}>
              {getPhotoArray(product.gambar).map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.dot, 
                    { backgroundColor: i === activeIndex ? "#3b82f6" : "#cbd5e1", width: i === activeIndex ? 20 : 8 }
                  ]} 
                />
              ))}
            </View>
          )}
        </View>

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

          <View style={styles.divider} />

          <View style={styles.reviewHeader}>
            <Text style={styles.descTitle}>Ulasan Pembeli ({reviews.length})</Text>
            {reviews.length > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.ratingBadgeText}>
                  {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5.0
                </Text>
              </View>
            )}
          </View>
          
          {reviews.length === 0 ? (
            <Text style={styles.noReviewText}>Belum ada ulasan untuk produk ini.</Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewUserRow}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{rev.pengguna?.nama?.charAt(0) || "U"}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.reviewUserName}>{rev.pengguna?.nama || "Pelanggan"}</Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Ionicons key={s} name={s <= rev.rating ? "star" : "star-outline"} size={12} color="#f59e0b" />
                      ))}
                    </View>
                  </View>
                </View>
                {rev.komentar && <Text style={styles.reviewText}>{rev.komentar}</Text>}
                {rev.foto && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                    {getPhotoArray(rev.foto).map((f: string, i: number) => (
                      <Image key={i} source={{ uri: `${API_URL}/uploads/${f}` }} style={styles.reviewImage} />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>

      {/* Floating Action Bar dengan 2 Opsi: Keranjang & Checkout */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.cartButton, product.stok === 0 && styles.disabledButton]} 
          disabled={product.stok === 0}
          onPress={() => openSizeModal("cart")}
        >
          <Ionicons name="cart-outline" size={24} color="#38bdf8" />
          <Text style={styles.cartButtonText}>Keranjang</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.buyButton, product.stok === 0 && styles.disabledButton]} 
          disabled={product.stok === 0}
          onPress={() => openSizeModal("checkout")}
        >
          <Text style={styles.buyButtonText}>{product.stok === 0 ? "Habis" : "Beli Sekarang"}</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL PILIHAN UKURAN */}
      <Modal visible={showSizeModal} transparent animationType="slide" onRequestClose={() => setShowSizeModal(false)}>
        <View style={styles.sizeModalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowSizeModal(false)} />
          <View style={styles.sizeModalContent}>
            <View style={styles.sizeModalHandle} />
            <Text style={styles.sizeModalTitle}>Pilih Ukuran</Text>
            <Text style={styles.sizeModalSub}>Pilih ukuran yang sesuai sebelum memesan</Text>
            <View style={styles.sizeGrid}>
              {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sizeChip, selectedSize === s && styles.sizeChipActive]}
                  onPress={() => setSelectedSize(s)}
                >
                  <Text style={[styles.sizeChipText, selectedSize === s && styles.sizeChipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.sizeConfirmBtn} onPress={confirmSize}>
              <Text style={styles.sizeConfirmText}>
                {addMode === "cart" ? `Tambah ke Keranjang (${selectedSize})` : `Beli Sekarang (${selectedSize})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  // Size Modal
  sizeModalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.45)", justifyContent: "flex-end" },
  sizeModalContent: { backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingTop: 12 },
  sizeModalHandle: { width: 40, height: 5, backgroundColor: "#e2e8f0", borderRadius: 10, alignSelf: "center", marginBottom: 24 },
  sizeModalTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 20, marginBottom: 6 },
  sizeModalSub: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 13, marginBottom: 20 },
  sizeGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  sizeChip: { flex: 1, paddingVertical: 14, backgroundColor: "#f8fafc", borderRadius: 14, borderWidth: 1.5, borderColor: "#e2e8f0", alignItems: "center" },
  sizeChipActive: { backgroundColor: "rgba(59,130,246,0.1)", borderColor: "#3b82f6" },
  sizeChipText: { color: "#94a3b8", fontFamily: "Poppins_700Bold", fontSize: 15 },
  sizeChipTextActive: { color: "#3b82f6" },
  sizeConfirmBtn: { backgroundColor: "#3b82f6", height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: 10 },
  sizeConfirmText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 15 },
  loadingArea: { flex: 1, backgroundColor: "#f8fafc", justifyContent: "center", alignItems: "center" },
  errorText: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 18, marginTop: 10 },
  backBtnError: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#3b82f6", borderRadius: 10 },
  backBtnText: { color: "#fff", fontFamily: "Poppins_700Bold" },
  
  backButton: { backgroundColor: "rgba(255, 255, 255, 0.9)", padding: 10, borderRadius: 100, marginLeft: 15, marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  
  imageFull: { width: width, height: 400, backgroundColor: "#f1f5f9" },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  
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

  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ratingBadgeText: { color: '#f59e0b', fontFamily: 'Poppins_700Bold', fontSize: 13, marginLeft: 6 },
  noReviewText: { color: '#94a3b8', fontFamily: 'Poppins_400Regular', fontSize: 13, fontStyle: 'italic' },
  reviewCard: { backgroundColor: '#ffffff', padding: 15, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  reviewUserRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  reviewAvatarText: { color: '#64748b', fontFamily: 'Poppins_700Bold', fontSize: 14 },
  reviewUserName: { color: '#1e293b', fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  reviewStars: { flexDirection: 'row', marginTop: 2 },
  reviewText: { color: '#475569', fontFamily: 'Poppins_400Regular', fontSize: 13, lineHeight: 20 },
  reviewImage: { width: 70, height: 70, borderRadius: 8, marginRight: 10, backgroundColor: '#f1f5f9' },
  
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