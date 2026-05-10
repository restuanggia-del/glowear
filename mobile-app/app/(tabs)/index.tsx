import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Dimensions, Modal, TextInput, TouchableOpacity, Alert, Platform, StatusBar} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/config";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function CatalogScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

          // Set nilai awal input jika sudah ada data di database
          if (currentUser.noTelepon) setNoTelepon(currentUser.noTelepon);
          if (currentUser.alamat) setAlamat(currentUser.alamat);

          // Munculkan modal jika salah satu masih kosong
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

  // 3. Fungsi Simpan Profil
  const handleSaveProfile = async () => {
    if (!noTelepon || !alamat) {
      return Alert.alert("Perhatian", "Nomor Telepon dan Alamat wajib diisi untuk keperluan pengiriman pesanan.");
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
        Alert.alert("Sukses", "Data diri berhasil diperbarui!");
      }
    } catch (error) {
      console.log("Error update profil:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan data diri.");
    } finally {
      setSavingProfile(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  // 4. FILTER + SEARCH logic (useMemo agar tidak re-kalkulasi tiap render)
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter berdasarkan kategori
    if (activeCategory !== "Semua") {
      result = result.filter((p) => p.category?.namaKategori === activeCategory);
    }

    // Filter berdasarkan pencarian
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
      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk, kategori..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>

      {/* BANNER CAROUSEL */}
      {banners.length > 0 && (
        <View style={styles.bannerSection}>
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
              </View>
            )}
          />
        </View>
      )}

      {/* FILTER KATEGORI */}
      <FlatList
        data={[{ id: "all", namaKategori: "Semua" }, ...categories]}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        style={styles.categoryList}
        renderItem={({ item }) => (
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
        )}
      />

      {/* JUDUL + JUMLAH HASIL */}
      <View style={styles.resultRow}>
        <Text style={styles.headerTitle}>
          {activeCategory === "Semua" && !searchQuery ? "Koleksi Terbaik" : "Hasil Pencarian"}
        </Text>
        <Text style={styles.resultCount}>{filteredProducts.length} produk</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader} 
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={52} color="#334155" />
            <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? `Tidak ada produk untuk "${searchQuery}"`
                : `Belum ada produk di kategori ${activeCategory}`}
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => { setSearchQuery(""); setActiveCategory("Semua"); }}
            >
              <Text style={styles.resetButtonText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <Image 
              source={{ 
                uri: item.gambar?.startsWith('http') 
                  ? item.gambar 
                  : `${API_URL}/uploads/${item.gambar}` 
              }} 
              style={styles.image} 
            />
            <View style={styles.info}>
              <Text style={styles.catName}>{item.category?.namaKategori}</Text>
              <Text style={styles.prodName} numberOfLines={1}>{item.namaProduk}</Text>
              <Text style={styles.price}>{formatRupiah(item.harga)}</Text>
              
              {/* TOMBOL EKSPLISIT */}
              <View style={{ backgroundColor: "#38bdf8", paddingVertical: 8, borderRadius: 8, marginTop: 12, alignItems: "center" }}>
                <Text style={{ color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 11 }}>Lihat Detail</Text>
              </View>

            </View>
          </TouchableOpacity>
        )}
      />

      {/* MODAL KELENGKAPAN DATA */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lengkapi Data Diri</Text>
            <Text style={styles.modalSubtitle}>Halo {userData?.nama}, yuk lengkapi nomor telepon dan alamatmu dulu agar pesanan bisa dikirim ke tempatmu!</Text>

            <Text style={styles.inputLabel}>Nomor Telepon / WhatsApp</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 08123456789"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
              value={noTelepon}
              onChangeText={setNoTelepon}
            />

            <Text style={styles.inputLabel}>Alamat Lengkap Pengiriman</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detail jalan, RT/RW, kelurahan, kota..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={alamat}
              onChangeText={setAlamat}
            />

            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.saveButtonText}>Simpan Data</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowProfileModal(false)}
              disabled={savingProfile}
            >
              <Text style={styles.cancelButtonText}>
                {userData?.noTelepon && userData?.alamat ? "Sudah Mengisi" : "Nanti Saja"}
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingHorizontal: 15, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  loadingArea: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },
  headerContainer: { paddingTop: 15 },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    paddingVertical: 10,
  },

  // Banner
  bannerSection: { marginBottom: 10 },
  bannerWrapper: { width: width - 30, marginRight: 10, borderRadius: 16, overflow: "hidden" },
  bannerImage: { width: "100%", height: (width - 30) * (9 / 16), resizeMode: "cover", backgroundColor: "#1e293b" },

  // Category Filter
  categoryList: { marginBottom: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  categoryChipActive: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderColor: "#38bdf8",
  },
  categoryChipText: {
    color: "#94a3b8",
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
  },
  categoryChipTextActive: {
    color: "#38bdf8",
    fontFamily: "Poppins_700Bold",
  },

  // Result row
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  headerTitle: { fontSize: 22, fontFamily: "Poppins_800ExtraBold", color: "#fff" },
  resultCount: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 12 },

  // Product Grid
  row: { justifyContent: "space-between" },
  card: { backgroundColor: "#1e293b", width: width * 0.44, borderRadius: 16, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "#334155" },
  image: { width: "100%", height: 160, backgroundColor: "#334155" },
  info: { padding: 12 },
  catName: { color: "#38bdf8", fontSize: 10, fontFamily: "Poppins_700Bold", textTransform: "uppercase", marginBottom: 2 },
  prodName: { color: "#fff", fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  price: { color: "#94a3b8", fontSize: 13, fontFamily: "Poppins_500Medium", marginTop: 4 },

  // Empty State
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { color: "#94a3b8", fontFamily: "Poppins_700Bold", fontSize: 16, marginTop: 16 },
  emptyDesc: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 13, marginTop: 6, textAlign: "center", paddingHorizontal: 30 },
  resetButton: { marginTop: 20, backgroundColor: "rgba(56,189,248,0.12)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: "#38bdf8" },
  resetButtonText: { color: "#38bdf8", fontFamily: "Poppins_600SemiBold", fontSize: 13 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.9)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#1e293b", width: "100%", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#334155", elevation: 10 },
  modalTitle: { fontSize: 22, fontFamily: "Poppins_800ExtraBold", color: "#fff", marginBottom: 8, textAlign: "center" },
  modalSubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#94a3b8", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  inputLabel: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#e2e8f0", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#334155", borderRadius: 12, color: "#fff", fontFamily: "Poppins_500Medium", paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  textArea: { height: 100, paddingTop: 14 },
  saveButton: { backgroundColor: "#38bdf8", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 15 },
  cancelButton: { paddingVertical: 14, alignItems: "center", marginTop: 5 },
  cancelButtonText: { color: "#94a3b8", fontFamily: "Poppins_600SemiBold", fontSize: 14 },
});