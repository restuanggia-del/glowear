import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Dimensions, Modal, TextInput, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/config";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function CatalogScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Kelengkapan Data
  const [userData, setUserData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [noTelepon, setNoTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // 1. Ambil data produk & Banner sekaligus
  const fetchData = async () => {
    try {
      const [resProducts, resBanners] = await Promise.all([
        api.get("/products"),
        api.get("/banners")
      ]);
      setProducts(resProducts.data);
      setBanners(resBanners.data);
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

  // 3. Fungsi Simpan Profil yang Kurang
  const handleSaveProfile = async () => {
    if (!noTelepon || !alamat) {
      return Alert.alert("Perhatian", "Nomor Telepon dan Alamat wajib diisi untuk keperluan pengiriman pesanan.");
    }

    setSavingProfile(true);
    try {
      const res = await api.put(`/auth/profile?userId=${userData.id}`, {
        noTelepon: noTelepon,
        alamat: alamat,
      });

      if (res.status === 200 || res.status === 201) {
        const updatedUser = { ...userData, noTelepon, alamat };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        
        setShowProfileModal(false);
        Alert.alert("Sukses", "Data diri berhasil dilengkapi!");
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

  // ==========================================
  // KOMPONEN HEADER (SLIDER BANNER + JUDUL)
  // ==========================================
  const renderHeader = () => (
    <View style={styles.headerContainer}>
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
      
      <Text style={styles.headerTitle}>Koleksi Terbaik</Text>
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
      
      {/* FlatList Utama */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader} 
        contentContainerStyle={{ paddingBottom: 20 }}
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

            {/* Tombol Simpan */}
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

            {/* Tombol Nanti Saja (BARU) */}
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowProfileModal(false)}
              disabled={savingProfile}
            >
              <Text style={styles.cancelButtonText}>Nanti Saja</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingHorizontal: 15 },
  loadingArea: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },
  
  // Style Header & Banner
  headerContainer: { paddingTop: 15 },
  bannerSection: { marginBottom: 10 },
  bannerWrapper: { width: width - 30, marginRight: 10, borderRadius: 16, overflow: "hidden" },
  bannerImage: { width: "100%", height: (width - 30) * (9 / 16), resizeMode: "cover", backgroundColor: "#1e293b" },
  headerTitle: { fontSize: 24, fontFamily: "Poppins_800ExtraBold", color: "#fff", marginVertical: 15 },
  
  // Style Produk
  row: { justifyContent: "space-between" },
  card: { backgroundColor: "#1e293b", width: width * 0.44, borderRadius: 16, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "#334155" },
  image: { width: "100%", height: 160, backgroundColor: "#334155" },
  info: { padding: 12 },
  catName: { color: "#38bdf8", fontSize: 10, fontFamily: "Poppins_700Bold", textTransform: "uppercase", marginBottom: 2 },
  prodName: { color: "#fff", fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  price: { color: "#94a3b8", fontSize: 13, fontFamily: "Poppins_500Medium", marginTop: 4 },

  // Style untuk Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.9)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#1e293b", width: "100%", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#334155", elevation: 10 },
  modalTitle: { fontSize: 22, fontFamily: "Poppins_800ExtraBold", color: "#fff", marginBottom: 8, textAlign: "center" },
  modalSubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#94a3b8", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  inputLabel: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#e2e8f0", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: "#0f172a", borderWidth: 1, borderColor: "#334155", borderRadius: 12, color: "#fff", fontFamily: "Poppins_500Medium", paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20 },
  textArea: { height: 100, paddingTop: 14 },
  saveButton: { backgroundColor: "#38bdf8", paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 15 },
  
  // Style Baru untuk Tombol "Nanti Saja"
  cancelButton: { paddingVertical: 14, alignItems: "center", marginTop: 5 },
  cancelButtonText: { color: "#94a3b8", fontFamily: "Poppins_600SemiBold", fontSize: 14 },
});