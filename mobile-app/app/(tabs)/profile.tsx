import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, ActivityIndicator, Linking, Image } from "react-native";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { api } from "../../services/api";
import { API_URL } from "../../constants/config";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({ nama: "", noTelepon: "", alamat: "" });

  useFocusEffect(useCallback(() => {
    const loadProfileData = async () => {
      try {
        const dataString = await AsyncStorage.getItem("userData");
        if (dataString) setUserData(JSON.parse(dataString));
      } catch (error) { console.error("Gagal memuat profil:", error); }
    };
    loadProfileData();
  }, []));

  const handleLogout = () => {
    Alert.alert("Keluar Akun", "Apakah Anda yakin ingin keluar dari aplikasi?", [
      { text: "Batal", style: "cancel" },
      { text: "Ya, Keluar", style: "destructive", onPress: async () => { await AsyncStorage.removeItem("userToken"); await AsyncStorage.removeItem("userData"); router.replace("/login"); } }
    ]);
  };

  const openEditModal = () => {
    setForm({ nama: userData?.nama || "", noTelepon: userData?.noTelepon || "", alamat: userData?.alamat || "" });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!form.nama) return Alert.alert("Peringatan", "Nama tidak boleh kosong.");
    setSaving(true);
    try {
      await api.patch(`/users/${userData.id}`, { nama: form.nama, noTelp: form.noTelepon, alamat: form.alamat });
      const updatedUser = { ...userData, ...form };
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      setUserData(updatedUser);
      Alert.alert("Berhasil", "Profil Anda berhasil diperbarui!");
      setIsEditing(false);
    } catch (error) { Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan profil."); }
    finally { setSaving(false); }
  };

  const handlePickPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) { Alert.alert("Izin Ditolak", "Anda harus memberikan izin akses galeri."); return; }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!pickerResult.canceled && pickerResult.assets?.length > 0) {
        const imageUri = pickerResult.assets[0].uri;
        setUploadingPhoto(true);
        const formData = new FormData();
        const fileExt = imageUri.split('.').pop() || 'jpg';
        formData.append('foto', { uri: imageUri, name: `profile-${userData.id}.${fileExt}`, type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}` } as any);
        const response = await api.post(`/users/${userData.id}/upload-photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        const newFotoProfil = response.data.fotoProfil;
        const updatedUser = { ...userData, fotoProfil: newFotoProfil };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
        setUserData(updatedUser);
      }
    } catch (error) { Alert.alert("Gagal", "Terjadi kesalahan saat mengunggah foto profil."); }
    finally { setUploadingPhoto(false); }
  };

  const getProfilePhotoUrl = () => userData?.fotoProfil ? `${API_URL}/uploads/profiles/${userData.fotoProfil}` : null;

  if (!userData) {
    return (<View style={s.container}><Text style={{ color: "#64748b", fontFamily: "Poppins_400Regular", marginTop: 50, textAlign: "center" }}>Memuat profil...</Text></View>);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity style={s.avatarContainer} onPress={handlePickPhoto} disabled={uploadingPhoto}>
            {uploadingPhoto ? (<ActivityIndicator size="large" color="#fff" />) : getProfilePhotoUrl() ? (
              <View style={{ width: '100%', height: '100%', borderRadius: 50, overflow: 'hidden' }}><Image source={{ uri: getProfilePhotoUrl()! }} style={{ width: '100%', height: '100%' }} /></View>
            ) : (<Text style={s.avatarText}>{userData.nama?.charAt(0).toUpperCase() || "U"}</Text>)}
            <View style={s.editAvatarBadge}><Ionicons name="camera" size={12} color="#fff" /></View>
          </TouchableOpacity>
          <Text style={s.userName}>{userData.nama}</Text>
          <Text style={s.userEmail}>{userData.email}</Text>
          <View style={s.roleBadge}><Text style={s.roleText}>{userData.role === 'ADMIN' ? 'Administrator' : 'Pelanggan Setia'}</Text></View>
        </View>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}><Ionicons name="location" size={20} color="#3b82f6" /><Text style={s.cardTitle}>Informasi Pengiriman</Text></View>
            <TouchableOpacity onPress={openEditModal} style={s.editBtn}><Ionicons name="pencil" size={14} color="#3b82f6" /><Text style={s.editBtnText}>Edit</Text></TouchableOpacity>
          </View>
          <View style={s.infoRow}><Text style={s.infoLabel}>No. WhatsApp</Text><Text style={s.infoValue}>{userData.noTelepon || "Belum diisi"}</Text></View>
          <View style={s.infoRow}><Text style={s.infoLabel}>Alamat Lengkap</Text><Text style={s.infoValue}>{userData.alamat || "Belum diisi"}</Text></View>
          {(!userData.noTelepon || !userData.alamat) && (<Text style={s.warningText}>* Silakan klik tombol Edit untuk melengkapi data pengiriman Anda.</Text>)}
        </View>

        <TouchableOpacity 
          style={[s.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 }]}
          onPress={() => router.push('/wishlist')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 10, borderRadius: 12, marginRight: 15 }}>
              <Ionicons name="heart" size={24} color="#ef4444" />
            </View>
            <View>
              <Text style={{ fontFamily: 'Poppins_700Bold', color: '#1e293b', fontSize: 15 }}>Favorit Saya</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#94a3b8', fontSize: 12 }}>Lihat produk yang kamu sukai</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <View style={{ gap: 10, marginTop: 10 }}>
          <TouchableOpacity style={[s.logoutButton, { backgroundColor: "rgba(59, 130, 246, 0.08)", borderColor: "#3b82f6", borderWidth: 1 }]}
            onPress={async () => {
              try {
                const { data } = await api.get("/settings");
                if (data?.whatsappCS) {
                  const phone = data.whatsappCS.startsWith('0') ? '62' + data.whatsappCS.slice(1) : data.whatsappCS;
                  const url = `whatsapp://send?phone=${phone}&text=Halo Glowear, saya ingin bertanya tentang pesanan saya.`;
                  const supported = await Linking.canOpenURL(url);
                  if (supported) await Linking.openURL(url);
                  else Alert.alert("Error", "WhatsApp tidak terinstal.");
                } else Alert.alert("Informasi", "Nomor WhatsApp CS belum diatur.");
              } catch (err) { Alert.alert("Gagal", "Gagal menghubungi server."); }
            }}>
            <Ionicons name="logo-whatsapp" size={20} color="#3b82f6" />
            <Text style={[s.logoutText, { color: "#3b82f6" }]}>Hubungi Customer Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.logoutButton} onPress={handleLogout}><Ionicons name="log-out-outline" size={20} color="#ef4444" /><Text style={s.logoutText}>Keluar Akun</Text></TouchableOpacity>
        </View>
        <Text style={s.versionText}>Glowear App v1.0.0</Text>
      </ScrollView>

      <Modal visible={isEditing} transparent={true} animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}><Text style={s.modalTitle}>Edit Profil</Text><TouchableOpacity onPress={() => setIsEditing(false)}><Ionicons name="close" size={24} color="#94a3b8" /></TouchableOpacity></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={s.inputLabel}>Nama Lengkap</Text>
              <TextInput style={s.input} value={form.nama} onChangeText={(t) => setForm({ ...form, nama: t })} placeholder="Masukkan nama lengkap" placeholderTextColor="#94a3b8" />
              <Text style={s.inputLabel}>Nomor WhatsApp</Text>
              <TextInput style={s.input} value={form.noTelepon} onChangeText={(t) => setForm({ ...form, noTelepon: t })} placeholder="08123456789" placeholderTextColor="#94a3b8" keyboardType="phone-pad" />
              <Text style={s.inputLabel}>Alamat Lengkap Pengiriman</Text>
              <TextInput style={[s.input, { height: 80, textAlignVertical: "top" }]} value={form.alamat} onChangeText={(t) => setForm({ ...form, alamat: t })} placeholder="Jl. Raya, RT/RW, Kecamatan, Kota..." placeholderTextColor="#94a3b8" multiline />
              <TouchableOpacity style={s.saveButton} onPress={handleSaveProfile} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveButtonText}>Simpan Perubahan</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { alignItems: "center", paddingVertical: 40, borderBottomWidth: 1, borderColor: "#f1f5f9", backgroundColor: "#ffffff" },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center", marginBottom: 15, shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  editAvatarBadge: { position: "absolute", bottom: 0, right: 5, backgroundColor: "#1e293b", padding: 6, borderRadius: 15, borderWidth: 2, borderColor: "#ffffff" },
  avatarText: { fontSize: 40, fontFamily: "Poppins_800ExtraBold", color: "#fff", marginTop: 4 },
  userName: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#1e293b", textAlign: "center", paddingHorizontal: 20 },
  userEmail: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#94a3b8" },
  roleBadge: { marginTop: 10, backgroundColor: "rgba(59, 130, 246, 0.1)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { color: "#3b82f6", fontFamily: "Poppins_600SemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  card: { backgroundColor: "#ffffff", marginHorizontal: 20, marginTop: 20, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: "#f1f5f9" },
  cardTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 16, marginLeft: 10 },
  editBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(59, 130, 246, 0.08)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: "rgba(59, 130, 246, 0.2)" },
  editBtnText: { color: "#3b82f6", fontFamily: "Poppins_600SemiBold", fontSize: 12, marginLeft: 4 },
  infoRow: { marginBottom: 12 },
  infoLabel: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 11, textTransform: "uppercase" },
  infoValue: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 14, marginTop: 2 },
  warningText: { color: "#f59e0b", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 10, fontStyle: "italic", lineHeight: 18 },
  orderMenuContainer: { flexDirection: "row", justifyContent: "space-between", paddingTop: 5 },
  orderMenuItem: { alignItems: "center", flex: 1 },
  orderMenuText: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 11, marginTop: 8 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239, 68, 68, 0.06)", marginHorizontal: 20, marginTop: 30, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.2)" },
  logoutText: { color: "#ef4444", fontFamily: "Poppins_700Bold", fontSize: 16, marginLeft: 8 },
  versionText: { textAlign: "center", color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 12, marginTop: 30, marginBottom: 40 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, minHeight: "50%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  modalTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 18 },
  inputLabel: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, color: "#1e293b", fontFamily: "Poppins_400Regular", paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20 },
  saveButton: { backgroundColor: "#3b82f6", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginTop: 10, marginBottom: 20 },
  saveButtonText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 15 },
});