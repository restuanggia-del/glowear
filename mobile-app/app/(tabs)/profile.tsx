import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../services/api";
import { API_URL } from "../constants/config";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);

  // State untuk Fitur Edit Profil
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    noTelepon: "",
    alamat: ""
  });

  useFocusEffect(
    useCallback(() => {
      const loadProfileData = async () => {
        try {
          const dataString = await AsyncStorage.getItem("userData");
          if (dataString) {
            setUserData(JSON.parse(dataString));
          }
        } catch (error) {
          console.error("Gagal memuat profil:", error);
        }
      };
      loadProfileData();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Keluar Akun",
      "Apakah Anda yakin ingin keluar dari aplikasi?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Keluar", 
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            router.replace("/login");
          } 
        }
      ]
    );
  };

  // Fungsi membuka Modal Edit dan mengisi form dengan data saat ini
  const openEditModal = () => {
    setForm({
      nama: userData?.nama || "",
      noTelepon: userData?.noTelepon || "",
      alamat: userData?.alamat || ""
    });
    setIsEditing(true);
  };

  // Fungsi untuk menyimpan perubahan ke Backend & LocalStorage
  const handleSaveProfile = async () => {
    if (!form.nama) {
      return Alert.alert("Peringatan", "Nama tidak boleh kosong.");
    }

    setSaving(true);
    try {
      // 1. Tembak API untuk update data di Database/CMS
      await api.put(`/users/${userData.id}`, {
        nama: form.nama,
        noTelepon: form.noTelepon,
        alamat: form.alamat
      });

      // 2. Perbarui data di memori HP (AsyncStorage) agar tidak hilang saat direstart
      const updatedUser = { ...userData, ...form };
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      
      // 3. Perbarui state lokal agar UI langsung berubah
      setUserData(updatedUser);
      
      Alert.alert("Berhasil", "Profil Anda berhasil diperbarui!");
      setIsEditing(false); // Tutup Modal
    } catch (error) {
      console.log("Error update profile:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff", fontFamily: "Poppins_400Regular", marginTop: 50, textAlign: "center" }}>Memuat profil...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Profil */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userData.nama?.charAt(0).toUpperCase() || "U"}</Text>
          </View>
          <Text style={styles.userName}>{userData.nama}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{userData.role === 'ADMIN' ? 'Administrator' : 'Pelanggan Setia'}</Text>
          </View>
        </View>

        {/* Kartu Informasi Pengiriman */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location" size={20} color="#38bdf8" />
              <Text style={styles.cardTitle}>Informasi Pengiriman</Text>
            </View>
            {/* Tombol Edit Profil */}
            <TouchableOpacity onPress={openEditModal} style={styles.editBtn}>
              <Ionicons name="pencil" size={14} color="#38bdf8" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>No. WhatsApp</Text>
            <Text style={styles.infoValue}>{userData.noTelepon || "Belum diisi"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alamat Lengkap</Text>
            <Text style={styles.infoValue}>{userData.alamat || "Belum diisi"}</Text>
          </View>

          {(!userData.noTelepon || !userData.alamat) && (
            <Text style={styles.warningText}>
              * Silakan klik tombol Edit untuk melengkapi data pengiriman Anda agar pesanan tidak ditolak.
            </Text>
          )}
        </View>

        {/* Kartu Status Pesanan */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="cart" size={20} color="#38bdf8" />
              <Text style={styles.cardTitle}>Pesanan Saya</Text>
            </View>
          </View>
          
          <View style={styles.orderMenuContainer}>
            <TouchableOpacity 
              style={styles.orderMenuItem} 
              onPress={() => router.push({ pathname: '/my-orders', params: { initialStatus: 'PENDING' } })}
            >
              <Ionicons name="wallet-outline" size={28} color="#94a3b8" />
              <Text style={styles.orderMenuText}>Belum Bayar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.orderMenuItem} 
              onPress={() => router.push({ pathname: '/my-orders', params: { initialStatus: 'DIPROSES' } })}
            >
              <Ionicons name="cog-outline" size={28} color="#94a3b8" />
              <Text style={styles.orderMenuText}>Diproses</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.orderMenuItem} 
              onPress={() => router.push({ pathname: '/my-orders', params: { initialStatus: 'DIKIRIM' } })}
            >
              <Ionicons name="cube-outline" size={28} color="#94a3b8" />
              <Text style={styles.orderMenuText}>Dikirim</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tombol Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Keluar Akun</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Glowear App v1.0.0</Text>
      </ScrollView>

      {/* MODAL EDIT PROFIL */}
      <Modal visible={isEditing} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profil</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.input}
                value={form.nama}
                onChangeText={(text) => setForm({ ...form, nama: text })}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#64748b"
              />

              <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
              <TextInput
                style={styles.input}
                value={form.noTelepon}
                onChangeText={(text) => setForm({ ...form, noTelepon: text })}
                placeholder="Contoh: 08123456789"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Alamat Lengkap Pengiriman</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                value={form.alamat}
                onChangeText={(text) => setForm({ ...form, alamat: text })}
                placeholder="Jl. Raya, RT/RW, Kecamatan, Kota..."
                placeholderTextColor="#64748b"
                multiline
              />

              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#0f172a" />
                ) : (
                  <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { alignItems: "center", paddingVertical: 40, borderBottomWidth: 1, borderColor: "#1e293b", backgroundColor: "#0f172a" },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#38bdf8", justifyContent: "center", alignItems: "center", marginBottom: 15, elevation: 8 },
  avatarText: { fontSize: 36, fontFamily: "Poppins_800ExtraBold", color: "#0f172a", marginTop: 4 },
  userName: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#fff", textAlign: "center", paddingHorizontal: 20 },
  userEmail: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#94a3b8" },
  roleBadge: { marginTop: 10, backgroundColor: "rgba(56, 189, 248, 0.15)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { color: "#38bdf8", fontFamily: "Poppins_600SemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  
  card: { backgroundColor: "#1e293b", marginHorizontal: 20, marginTop: 20, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#334155" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: "#334155" },
  cardTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16, marginLeft: 10 },
  
  editBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(56, 189, 248, 0.1)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "rgba(56, 189, 248, 0.3)" },
  editBtnText: { color: "#38bdf8", fontFamily: "Poppins_600SemiBold", fontSize: 12, marginLeft: 4 },

  infoRow: { marginBottom: 12 },
  infoLabel: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 11, textTransform: "uppercase" },
  infoValue: { color: "#e2e8f0", fontFamily: "Poppins_600SemiBold", fontSize: 14, marginTop: 2 },
  warningText: { color: "#f59e0b", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 10, fontStyle: "italic", lineHeight: 18 },
  
  orderMenuContainer: { flexDirection: "row", justifyContent: "space-between", paddingTop: 5 },
  orderMenuItem: { alignItems: "center", flex: 1 },
  orderMenuText: { color: "#cbd5e1", fontFamily: "Poppins_500Medium", fontSize: 11, marginTop: 8 },
  
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239, 68, 68, 0.1)", marginHorizontal: 20, marginTop: 30, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)" },
  logoutText: { color: "#ef4444", fontFamily: "Poppins_700Bold", fontSize: 16, marginLeft: 8 },
  versionText: { textAlign: "center", color: "#475569", fontFamily: "Poppins_500Medium", fontSize: 12, marginTop: 30, marginBottom: 40 },

  // Styles untuk Modal Edit Profil
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#0f172a", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, minHeight: "50%", borderWidth: 1, borderColor: "#1e293b" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  modalTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 18 },
  
  inputLabel: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155", borderRadius: 12, color: "#fff", fontFamily: "Poppins_400Regular", paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20 },
  
  saveButton: { backgroundColor: "#38bdf8", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginTop: 10, marginBottom: 20 },
  saveButtonText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 15 }
});