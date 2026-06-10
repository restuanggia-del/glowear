import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, ActivityIndicator, FlatList } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { API_URL } from "../../constants/config";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function StudioScreen() {
  const [baseProducts, setBaseProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBaseProducts = async () => {
      try {
        const res = await api.get("/products");
        // Filter produk yang sekiranya bisa dicustom (misal yang namanya ada 'Polos' atau masuk kategori tertentu)
        // Untuk demo ini kita ambil semua produk yang masuk kategori Kaos atau Jaket
        const filtered = res.data.filter((p: any) => 
            p.namaProduk.toLowerCase().includes('polos') || 
            p.category?.namaKategori?.toLowerCase().includes('kaos')
        );
        setBaseProducts(filtered.length > 0 ? filtered : res.data.slice(0, 4));
      } catch (error) {
        console.error("Gagal ambil produk studio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseProducts();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <Text style={styles.title}>Glowear Studio</Text>
          <Text style={styles.subtitle}>Wujudkan desain impianmu pada kaos berkualitas</Text>
        </Animated.View>

        {/* HERO SECTION */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.heroCard}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop" }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Bikin Kaos Sendiri!</Text>
            <Text style={styles.heroSubtitle}>Sablon satuan atau lusinan dengan harga terbaik</Text>
            <TouchableOpacity 
              style={styles.startBtn} 
              activeOpacity={0.8}
              onPress={() => router.push("/")}
            >
              <Text style={styles.startBtnText}>Lihat Katalog</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* PILIHAN LAYANAN */}
        <Text style={styles.sectionTitle}>Layanan Custom</Text>
        <View style={styles.grid}>
          <View style={styles.serviceCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="color-palette" size={32} color="#3b82f6" />
            </View>
            <Text style={styles.serviceName}>Sablon DTF</Text>
            <Text style={styles.serviceDesc}>Full color & detail</Text>
          </View>
          <View style={styles.serviceCard}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
              <MaterialCommunityIcons name="embroidery" size={32} color="#f59e0b" />
            </View>
            <Text style={styles.serviceName}>Bordir Komp.</Text>
            <Text style={styles.serviceDesc}>Hasil rapi & mewah</Text>
          </View>
        </View>

        {/* PRODUK PILIHAN UNTUK CUSTOM */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pilih Bahan Kaos</Text>
            <Text style={styles.sectionSubtitle}>Pilih kaos polos terbaik untuk desainmu</Text>
        </View>

        {loading ? (
            <ActivityIndicator color="#3b82f6" style={{ marginTop: 20 }} />
        ) : (
            <View style={styles.productList}>
                {baseProducts.map((item, index) => (
                    <Animated.View 
                        key={item.id} 
                        entering={FadeInRight.delay(index * 150)}
                    >
                        <TouchableOpacity 
                            style={styles.productItem}
                            onPress={() => router.push({ pathname: '/checkout', params: { productId: item.id } })}
                        >
                            <Image 
                                source={{ uri: item.gambar?.startsWith('http') ? item.gambar : `${API_URL}/uploads/${item.gambar}` }} 
                                style={styles.productImg} 
                            />
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={1}>{item.namaProduk}</Text>
                                <Text style={styles.productPrice}>{formatRupiah(item.harga)}</Text>
                                <View style={styles.badgeCustom}>
                                    <Text style={styles.badgeText}>Bisa Custom</Text>
                                </View>
                            </View>
                            <View style={styles.plusBtn}>
                                <Ionicons name="brush" size={18} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>
        )}

        <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
            <Text style={styles.infoText}>Klik pada produk untuk mulai mengunggah desain dan memilih jenis sablon.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 20 },
  header: { marginTop: 40, marginBottom: 25 },
  title: { color: "#1e293b", fontFamily: "Poppins_800ExtraBold", fontSize: 28 },
  subtitle: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 14, marginTop: 4 },
  
  heroCard: { 
    height: 200, 
    borderRadius: 24, 
    overflow: "hidden", 
    marginBottom: 30,
    elevation: 6,
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "rgba(15, 23, 42, 0.55)", 
    padding: 20, 
    justifyContent: "flex-end" 
  },
  heroTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 22 },
  heroSubtitle: { color: "#e2e8f0", fontFamily: "Poppins_400Regular", fontSize: 12, marginBottom: 15 },
  startBtn: { backgroundColor: "#3b82f6", alignSelf: "flex-start", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  startBtnText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 13 },

  sectionTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 18, marginBottom: 5 },
  sectionSubtitle: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, marginBottom: 15 },
  grid: { flexDirection: "row", justifyContent: "space-between", gap: 15, marginBottom: 30 },
  serviceCard: { 
    flex: 1,
    backgroundColor: "#ffffff", 
    borderRadius: 20, 
    padding: 15, 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  serviceName: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 13 },
  serviceDesc: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 10, marginTop: 2, textAlign: "center" },

  productList: { gap: 15 },
  productItem: { 
    flexDirection: "row", 
    backgroundColor: "#ffffff", 
    borderRadius: 20, 
    padding: 12, 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: "#f1f5f9" },
  productInfo: { flex: 1, marginLeft: 15 },
  productName: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  productPrice: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 14, marginTop: 2 },
  badgeCustom: { backgroundColor: "rgba(16, 185, 129, 0.1)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 5 },
  badgeText: { color: "#10b981", fontSize: 9, fontFamily: "Poppins_700Bold" },
  plusBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center" },

  infoBox: { 
    marginTop: 30, 
    backgroundColor: "rgba(59, 130, 246, 0.05)", 
    padding: 15, 
    borderRadius: 16, 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.15)"
  },
  infoText: { flex: 1, color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18 },
  sectionHeader: {},
});
