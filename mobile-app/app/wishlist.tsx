import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { API_URL } from "../constants/config";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Skeleton from "../components/Skeleton";
import { useWishlistStore } from "../store/wishlist-store";

export default function WishlistScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const { toggleWishlist, setWishlist } = useWishlistStore();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const userString = await AsyncStorage.getItem("userData");
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          const res = await api.get(`/wishlist/user/${userData.id}`);
          setProducts(res.data);
          setWishlist(res.data.map((p: any) => p.id));
        }
      } catch (error) {
        console.error("Gagal load wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  const handleRemove = async (productId: string) => {
    if (!user) return;
    await toggleWishlist(user.id, productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  if (loading) {
    return (
      <View style={s.container}>
        <Stack.Screen options={{ title: "Favorit Saya", headerStyle: { backgroundColor: "#ffffff" }, headerTintColor: "#1e293b", headerShadowVisible: false }} />
        <View style={{ padding: 20 }}>
          <Skeleton height={100} borderRadius={16} style={{ marginBottom: 15 }} />
          <Skeleton height={100} borderRadius={16} style={{ marginBottom: 15 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Stack.Screen options={{ 
        title: "Favorit Saya", 
        headerStyle: { backgroundColor: "#ffffff" }, 
        headerTintColor: "#1e293b", 
        headerTitleStyle: { fontFamily: "Poppins_700Bold" },
        headerShadowVisible: false 
      }} />

      {products.length === 0 ? (
        <View style={s.emptyContainer}>
          <View style={s.iconCircle}>
            <Ionicons name="heart-outline" size={60} color="#cbd5e1" />
          </View>
          <Text style={s.emptyTitle}>Belum Ada Favorit</Text>
          <Text style={s.emptyDesc}>Koleksi produk yang kamu suka dengan menekan ikon hati pada produk.</Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => router.push("/")}>
            <Text style={s.shopBtnText}>Jelajahi Katalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity 
                style={s.productCard} 
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
              >
                <Image 
                  source={{ uri: item.gambar?.startsWith('http') ? item.gambar : `${API_URL}/uploads/${item.gambar}` }} 
                  style={s.productImage} 
                />
                <View style={s.productInfo}>
                  <Text style={s.categoryText}>{item.category?.namaKategori}</Text>
                  <Text style={s.productName} numberOfLines={1}>{item.namaProduk}</Text>
                  <Text style={s.productPrice}>{formatRupiah(item.harga)}</Text>
                </View>
                <TouchableOpacity style={s.heartBtn} onPress={() => handleRemove(item.id)}>
                  <Ionicons name="heart" size={24} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center", marginBottom: 25 },
  emptyTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 18 },
  emptyDesc: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 22 },
  shopBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12, marginTop: 30 },
  shopBtnText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },

  productCard: { 
    flexDirection: "row", 
    backgroundColor: "#ffffff", 
    borderRadius: 16, 
    padding: 12, 
    marginBottom: 15, 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: "#f1f5f9" },
  productInfo: { flex: 1, marginLeft: 15 },
  categoryText: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 11, textTransform: "uppercase" },
  productName: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 15, marginTop: 2 },
  productPrice: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 14, marginTop: 4 },
  heartBtn: { padding: 8, backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: 10 },
});
