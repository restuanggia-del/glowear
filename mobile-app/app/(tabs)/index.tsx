import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Dimensions, Modal, TextInput, TouchableOpacity, Alert, Platform, StatusBar } from "react-native";
import { useEffect, useState, useMemo } from "react";
import { useAlert } from "../../components/CustomAlert";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/config";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Skeleton from "../../components/Skeleton";
import Animated, { FadeInDown, FadeInRight, BounceIn } from "react-native-reanimated";
import { useCartStore } from "../../store/cart-store";
import { useSearchHistoryStore } from "../../store/search-history-store";
import { useWishlistStore } from "../../store/wishlist-store";

const { width, height } = Dimensions.get("window");

export default function CatalogScreen() {
  const { showAlert } = useAlert();
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { addItem, totalItems } = useCartStore();
  const cartItemsCount = totalItems();
  
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistoryStore();
  const { toggleWishlist, wishlistIds } = useWishlistStore();

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  // State untuk Modal Kelengkapan Data
  const [userData, setUserData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [noTelepon, setNoTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // 1. Ambil data produk, Banner, & Kategori sekaligus
  const fetchData = async () => {
    try {
      const [resProducts, resBanners, resCategories] = await Promise.all([
        api.get("/products"),
        api.get("/banners"),
        api.get("/categories"),
      ]);
      setProducts(resProducts.data);
      setBanners(resBanners.data);
      setCategories(resCategories.data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Cek kelengkapan profil pengguna dengan data TERBARU dari server
  const checkUserProfile = async () => {
    try {
      const dataString = await AsyncStorage.getItem("userData");
      if (dataString) {
        const localUser = JSON.parse(dataString);

        try {
          const response = await api.get(`/auth/profile?userId=${localUser.id}`);
          const currentUser = response.data;

          setUserData(currentUser);
          await AsyncStorage.setItem("userData", JSON.stringify(currentUser));

          if (currentUser.noTelepon) setNoTelepon(currentUser.noTelepon);
          if (currentUser.alamat) setAlamat(currentUser.alamat);

          if (!currentUser.alamat || !currentUser.noTelepon) {
            setShowProfileModal(true);
          }
        } catch (apiError) {
          console.error("Gagal menarik profil terbaru:", apiError);
          setUserData(localUser);
          if (!localUser.alamat || !localUser.noTelepon) {
            setShowProfileModal(true);
          }
        }
      }
    } catch (error) {
      console.error("Gagal membaca data user lokal:", error);
    }
  };

  useEffect(() => {
    fetchData();
    checkUserProfile();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  const handleSaveProfile = async () => {
    if (!noTelepon || !alamat) {
      return showAlert({
        title: "Perhatian",
        message: "Nomor Telepon dan Alamat wajib diisi untuk keperluan pengiriman pesanan.",
        type: "warning"
      });
    }

    setSavingProfile(true);
    try {
      const res = await api.put(`/auth/profile?userId=${userData.id}`, {
        noTelp: noTelepon,
        alamat: alamat,
      });

      if (res.status === 200 || res.status === 201) {
        const updatedUser = { ...userData, noTelepon, alamat };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
        setUserData(updatedUser);

        setShowProfileModal(false);
        showAlert({
          title: "Sukses",
          message: "Data diri berhasil diperbarui!",
          type: "success"
        });
      }
    } catch (error) {
      console.log("Error update profil:", error);
      showAlert({
        title: "Gagal",
        message: "Terjadi kesalahan saat menyimpan data diri.",
        type: "error"
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleQuickAdd = (product: any) => {
    addItem({
      id: Math.random().toString(36).substring(7),
      productId: product.id,
      namaProduk: product.namaProduk,
      harga: product.harga,
      gambar: product.gambar,
      jumlah: 1,
      ukuran: "L", // Default
    });
    showAlert({
      title: "Berhasil!",
      message: `${product.namaProduk} ditambahkan ke keranjang!`,
      type: "success"
    });
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== "Semua") {
      result = result.filter((p) => p.category?.namaKategori === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.namaProduk?.toLowerCase().includes(q) ||
          p.category?.namaKategori?.toLowerCase().includes(q) ||
          p.deskripsi?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Animated.View entering={FadeInRight.delay(200)} style={styles.greetingSection}>
        <View>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.userNameText}>{userData?.nama || "Pelanggan"} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/profile")} style={styles.avatarMini}>
          <Text style={styles.avatarMiniText}>{userData?.nama?.charAt(0).toUpperCase() || "U"}</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari kaos, jaket, bordir..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (searchQuery.trim()) {
              addSearch(searchQuery);
              api.post('/search/log', { keyword: searchQuery, userId: userData?.id }).catch(console.error);
            }
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {!searchQuery && history.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Pencarian Terakhir</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearHistoryText}>Hapus Semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyTags}>
            {history.map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.historyTag} onPress={() => setSearchQuery(item)}>
                <Ionicons name="time-outline" size={14} color="#64748b" style={{ marginRight: 4 }} />
                <Text style={styles.historyTagText}>{item}</Text>
                <TouchableOpacity onPress={() => removeSearch(item)} style={{ marginLeft: 6 }}>
                  <Ionicons name="close" size={14} color="#94a3b8" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {banners.length > 0 && !searchQuery && (
        <Animated.View entering={FadeInRight.delay(400)} style={styles.bannerSection}>
          <FlatList
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            snapToAlignment="center"
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={styles.bannerWrapper}>
                <Image
                  source={{
                    uri: item.gambar?.startsWith('http')
                      ? item.gambar
                      : `${API_URL}/uploads/banners/${item.gambar}`
                  }}
                  style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{item.judul || "Kualitas Terbaik"}</Text>
                  <Text style={styles.bannerSubtitle}>{item.deskripsi || "Hubungi admin untuk custom design"}</Text>
                </View>
              </View>
            )}
          />
        </Animated.View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategori</Text>
      </View>
      <FlatList
        data={[{ id: "all", namaKategori: "Semua" }, ...categories]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        style={styles.categoryList}
        contentContainerStyle={{ paddingRight: 20 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInRight.delay(index * 100)}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                activeCategory === item.namaKategori && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(item.namaKategori)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === item.namaKategori && styles.categoryChipTextActive,
                ]}
              >
                {item.namaKategori}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      <View style={styles.resultRow}>
        <Text style={styles.mainTitle}>
          {activeCategory === "Semua" && !searchQuery ? "Koleksi Pilihan" : "Hasil Pencarian"}
        </Text>
        <Text style={styles.resultCount}>{filteredProducts.length} Produk</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={{ padding: 20 }}>
          <Skeleton height={60} borderRadius={15} style={{ marginBottom: 20 }} />
          <Skeleton height={40} borderRadius={10} style={{ marginBottom: 20 }} />
          <Skeleton height={180} borderRadius={20} style={{ marginBottom: 20 }} />
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 25 }}>
            <Skeleton width={80} height={35} borderRadius={20} />
            <Skeleton width={80} height={35} borderRadius={20} />
            <Skeleton width={80} height={35} borderRadius={20} />
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Skeleton height={200} borderRadius={20} style={{ marginBottom: 12 }} />
              <Skeleton height={20} width="80%" style={{ marginBottom: 6 }} />
              <Skeleton height={20} width="50%" />
            </View>
            <View style={{ flex: 1 }}>
              <Skeleton height={200} borderRadius={20} style={{ marginBottom: 12 }} />
              <Skeleton height={20} width="80%" style={{ marginBottom: 6 }} />
              <Skeleton height={20} width="50%" />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shirt-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? `Maaf, produk "${searchQuery}" belum tersedia saat ini.`
                : `Belum ada produk untuk kategori ${activeCategory}`}
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => { setSearchQuery(""); setActiveCategory("Semua"); }}
            >
              <Text style={styles.resetButtonText}>Lihat Semua Produk</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 100)}
            style={styles.cardContainer}
          >
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/product/${item.id}`)}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: item.gambar?.startsWith('http')
                      ? item.gambar
                      : `${API_URL}/uploads/${item.gambar}`
                  }}
                  style={styles.image}
                />
                <TouchableOpacity 
                  style={styles.heartBtnCard}
                  onPress={() => userData ? toggleWishlist(userData.id, item.id) : showAlert({ title: "Oops", message: "Silakan login untuk menyimpan produk ke favorit." })}
                >
                  <Ionicons 
                    name={wishlistIds.includes(item.id) ? "heart" : "heart-outline"} 
                    size={20} 
                    color={wishlistIds.includes(item.id) ? "#ef4444" : "#94a3b8"} 
                  />
                </TouchableOpacity>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{formatRupiah(item.harga)}</Text>
                </View>
              </View>
              <View style={styles.info}>
                <Text style={styles.catName}>{item.category?.namaKategori || "Lainnya"}</Text>
                <Text style={styles.prodName} numberOfLines={2}>{item.namaProduk}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.ratingText}>4.9</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => handleQuickAdd(item)}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />

      {/* FLOATING CART BUBBLE */}
      <Animated.View entering={BounceIn.delay(800)} style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={() => router.push("/cart")}
        >
          <Ionicons name="cart" size={28} color="#fff" />
          {cartItemsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* MODAL KELENGKAPAN DATA */}
      <Modal visible={showProfileModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity activeOpacity={1} style={styles.modalDismissArea} onPress={() => setShowProfileModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}><Ionicons name="person-add" size={24} color="#3b82f6" /></View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.modalTitle}>Lengkapi Data Diri</Text>
                <Text style={styles.modalSubtitle}>Halo {userData?.nama}, yuk isi alamat & no. telp untuk pengiriman!</Text>
              </View>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="logo-whatsapp" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
                  <TextInput style={styles.input} placeholder="Contoh: 08123456789" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={noTelepon} onChangeText={setNoTelepon} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Alamat Pengiriman</Text>
                <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
                  <Ionicons name="location-outline" size={18} color="#94a3b8" style={{ marginRight: 10, marginTop: 2 }} />
                  <TextInput style={[styles.input, styles.textArea]} placeholder="Nama jalan, nomor rumah, RT/RW, kota..." placeholderTextColor="#94a3b8" multiline numberOfLines={3} textAlignVertical="top" value={alamat} onChangeText={setAlamat} />
                </View>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <ActivityIndicator color="#fff" /> : <><Text style={styles.saveButtonText}>Simpan & Lanjutkan</Text><Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} /></>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipButton} onPress={() => setShowProfileModal(false)} disabled={savingProfile}><Text style={styles.skipButtonText}>Nanti Saja</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: 15, paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10 },
  headerContainer: { paddingBottom: 15 },
  greetingSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 10 },
  greetingText: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 14 },
  userNameText: { color: "#1e293b", fontFamily: "Poppins_800ExtraBold", fontSize: 22, marginTop: -2 },
  avatarMini: { width: 45, height: 45, borderRadius: 15, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center", shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  avatarMiniText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 18 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 16, paddingHorizontal: 15, marginBottom: 20, borderWidth: 1, borderColor: "#e2e8f0", height: 52, shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  searchInput: { flex: 1, color: "#1e293b", fontFamily: "Poppins_500Medium", fontSize: 14 },
  bannerSection: { marginBottom: 25 },
  bannerWrapper: { width: width - 30, marginRight: 10, borderRadius: 24, overflow: "hidden", height: 180, position: 'relative' },
  bannerImage: { width: "100%", height: "100%", resizeMode: "cover", backgroundColor: "#e2e8f0" },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  bannerTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16 },
  bannerSubtitle: { color: "#e2e8f0", fontFamily: "Poppins_500Medium", fontSize: 11, marginTop: 2 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 16 },
  categoryList: { marginBottom: 20 },
  categoryChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, marginRight: 10, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0" },
  categoryChipActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6", shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 6 },
  categoryChipText: { color: "#64748b", fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  categoryChipTextActive: { color: "#fff" },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  mainTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#1e293b" },
  resultCount: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 12 },
  row: { justifyContent: "space-between", paddingHorizontal: 2 },
  cardContainer: { width: (width - 45) / 2 },
  card: { backgroundColor: "#ffffff", borderRadius: 24, marginBottom: 20, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  imageContainer: { height: 180, position: 'relative' },
  image: { width: "100%", height: "100%", backgroundColor: "#f1f5f9" },
  priceTag: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255, 255, 255, 0.95)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  priceText: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 11 },
  heartBtnCard: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,255,255,0.9)", padding: 6, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  historyContainer: { marginBottom: 20 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  historyTitle: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  clearHistoryText: { color: "#ef4444", fontFamily: "Poppins_500Medium", fontSize: 11 },
  historyTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  historyTag: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0" },
  historyTagText: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 12 },
  info: { padding: 12 },
  catName: { color: "#94a3b8", fontSize: 9, fontFamily: "Poppins_700Bold", textTransform: "uppercase", marginBottom: 4, letterSpacing: 1 },
  prodName: { color: "#1e293b", fontSize: 14, fontFamily: "Poppins_600SemiBold", height: 40, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: '#94a3b8', fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
  addBtn: { backgroundColor: '#3b82f6', width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 80, paddingHorizontal: 40 },
  emptyTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 18, marginTop: 20 },
  emptyDesc: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 20 },
  resetButton: { marginTop: 25, backgroundColor: "rgba(59,130,246,0.1)", paddingHorizontal: 25, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: "#3b82f6" },
  resetButtonText: { color: "#3b82f6", fontFamily: "Poppins_600SemiBold", fontSize: 14 },

  fabContainer: { position: 'absolute', bottom: 110, right: 20, zIndex: 99 },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center", shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 15, elevation: 12 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: "#ef4444", minWidth: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#f8fafc" },
  badgeText: { color: "#fff", fontSize: 10, fontFamily: "Poppins_700Bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.4)", justifyContent: "flex-end" },
  modalDismissArea: { flex: 1 },
  modalContent: { backgroundColor: "#ffffff", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingTop: 12, shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 20 },
  modalIndicator: { width: 40, height: 5, backgroundColor: "#e2e8f0", borderRadius: 10, alignSelf: "center", marginBottom: 25 },
  modalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  modalIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: "rgba(59,130,246,0.1)", justifyContent: "center", alignItems: "center" },
  modalTitle: { fontSize: 20, fontFamily: "Poppins_800ExtraBold", color: "#1e293b" },
  modalSubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#64748b", lineHeight: 18, marginTop: 2 },
  modalBody: { gap: 20 },
  inputGroup: { gap: 10 },
  inputLabel: { fontSize: 12, fontFamily: "Poppins_700Bold", color: "#1e293b", textTransform: "uppercase", letterSpacing: 1 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, paddingHorizontal: 15 },
  input: { flex: 1, color: "#1e293b", fontFamily: "Poppins_500Medium", paddingVertical: 14, fontSize: 14 },
  textArea: { height: 80 },
  saveButton: { backgroundColor: "#3b82f6", height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: "center", marginTop: 10, shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  saveButtonText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 15 },
  skipButton: { paddingVertical: 15, alignItems: "center" },
  skipButtonText: { color: "#94a3b8", fontFamily: "Poppins_600SemiBold", fontSize: 14 },
});