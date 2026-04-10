import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Dimensions, Modal, TextInput, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function CatalogScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Kelengkapan Data
  const [userData, setUserData] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [noTelepon, setNoTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // 1. Ambil data produk
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Gagal ambil produk:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Cek kelengkapan profil pengguna
  const checkUserProfile = async () => {
    try {
      const dataString = await AsyncStorage.getItem("userData");
      if (dataString) {
        const user = JSON.parse(dataString);
        setUserData(user);
        
        // Jika data alamat ATAU no telepon kosong, tampilkan modal
        if (!user.alamat || !user.noTelepon) {
          setShowProfileModal(true);
        }
      }
    } catch (error) {
      console.error("Gagal membaca data user:", error);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
    checkUserProfile();
  }, []);

  // 3. Fungsi Simpan Profil yang Kurang
  const handleSaveProfile = async () => {
    if (!noTelepon || !alamat) {
      return Alert.alert("Perhatian", "Nomor Telepon dan Alamat wajib diisi untuk keperluan pengiriman pesanan.");
    }

    setSavingProfile(true);
    try {
      // ✅ PERBAIKAN URL DI SINI (Sesuaikan dengan controller backend Anda)
      const res = await api.put(`/auth/profile?userId=${userData.id}`, {
        noTelepon: noTelepon,
        alamat: alamat,
      });

      if (res.status === 200 || res.status === 201) {
        // Update data di penyimpanan lokal HP
        const updatedUser = { ...userData, noTelepon, alamat };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        
        // Tutup Modal
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

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Koleksi Terbaik</Text>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image 
              source={{ uri: item.gambar?.startsWith('http') ? item.gambar : `http://192.168.1.15:3001/uploads/${item.gambar}` }} 
              style={styles.image} 
            />
            <View style={styles.info}>
              <Text style={styles.catName}>{item.category?.namaKategori}</Text>
              <Text style={styles.prodName} numberOfLines={1}>{item.namaProduk}</Text>
              <Text style={styles.price}>{formatRupiah(item.harga)}</Text>
            </View>
          </View>
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
          </View>
        </View>
      </Modal>

    </View>
  );
}

// PERHATIKAN: Saya sudah menambahkan properti fontFamily 'Poppins_...' di style ini
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingHorizontal: 15 },
  headerTitle: { fontSize: 24, fontFamily: "Poppins_800ExtraBold", color: "#fff", marginVertical: 20 },
  loadingArea: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },
  row: { justifyContent: "space-between" },
  card: {
    backgroundColor: "#1e293b",
    width: width * 0.44,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155"
  },
  image: { width: "100%", height: 160, backgroundColor: "#334155" },
  info: { padding: 12 },
  catName: { color: "#38bdf8", fontSize: 10, fontFamily: "Poppins_700Bold", textTransform: "uppercase", marginBottom: 2 },
  prodName: { color: "#fff", fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  price: { color: "#94a3b8", fontSize: 13, fontFamily: "Poppins_500Medium", marginTop: 4 },

  // Style untuk Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.9)", // Backdrop gelap dengan opacity
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1e293b",
    width: "100%",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: 22, fontFamily: "Poppins_800ExtraBold", color: "#fff", marginBottom: 8, textAlign: "center" },
  modalSubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#94a3b8", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  inputLabel: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#e2e8f0", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    color: "#fff",
    fontFamily: "Poppins_500Medium",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  textArea: { height: 100, paddingTop: 14 },
  saveButton: {
    backgroundColor: "#38bdf8",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 15 },
});