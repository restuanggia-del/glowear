import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);

  // useFocusEffect akan dijalankan SETIAP KALI tab Profil ini dibuka.
  // Jadi datanya selalu fresh, tidak nyangkut.
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
            // Hapus token dan data dari memori HP
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            
            // Lempar kembali ke halaman Login
            router.replace("/login");
          } 
        }
      ]
    );
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff", fontFamily: "Poppins_400Regular" }}>Memuat profil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header Profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userData.nama.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{userData.nama}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
        
        {/* Badge Role */}
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{userData.role === 'ADMIN' ? 'Administrator' : 'Pelanggan Setia'}</Text>
        </View>
      </View>

      {/* Kartu Informasi Pengiriman */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={20} color="#38bdf8" />
          <Text style={styles.cardTitle}>Informasi Pengiriman</Text>
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
            * Silakan kembali ke halaman Home untuk melengkapi data Anda.
          </Text>
        )}
      </View>

      {/* Kartu Status Pesanan (Menu Dummy untuk UX) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cart" size={20} color="#38bdf8" />
          <Text style={styles.cardTitle}>Pesanan Saya</Text>
        </View>
        
        <View style={styles.orderMenuContainer}>
          <TouchableOpacity style={styles.orderMenuItem} onPress={() => alert("Fitur Pesanan Segera Hadir!")}>
            <Ionicons name="wallet-outline" size={28} color="#94a3b8" />
            <Text style={styles.orderMenuText}>Belum Bayar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderMenuItem} onPress={() => alert("Fitur Pesanan Segera Hadir!")}>
            <Ionicons name="cog-outline" size={28} color="#94a3b8" />
            <Text style={styles.orderMenuText}>Diproses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderMenuItem} onPress={() => alert("Fitur Pesanan Segera Hadir!")}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  
  // Header Style
  header: { alignItems: "center", paddingVertical: 40, borderBottomWidth: 1, borderColor: "#1e293b", backgroundColor: "#0f172a" },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#38bdf8", justifyContent: "center", alignItems: "center", marginBottom: 15, shadowColor: "#38bdf8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  avatarText: { fontSize: 36, fontFamily: "Poppins_800ExtraBold", color: "#0f172a", marginTop: 4 },
  userName: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#fff" },
  userEmail: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#94a3b8" },
  roleBadge: { marginTop: 10, backgroundColor: "rgba(56, 189, 248, 0.15)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { color: "#38bdf8", fontFamily: "Poppins_600SemiBold", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },

  // Card Style
  card: { backgroundColor: "#1e293b", marginHorizontal: 20, marginTop: 20, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#334155" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: "#334155" },
  cardTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16, marginLeft: 10 },
  
  infoRow: { marginBottom: 12 },
  infoLabel: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 11, textTransform: "uppercase" },
  infoValue: { color: "#e2e8f0", fontFamily: "Poppins_600SemiBold", fontSize: 14, marginTop: 2 },
  warningText: { color: "#f59e0b", fontFamily: "Poppins_400Regular", fontSize: 12, marginTop: 10, fontStyle: "italic" },

  // Order Menu Style
  orderMenuContainer: { flexDirection: "row", justifyContent: "space-between", paddingTop: 5 },
  orderMenuItem: { alignItems: "center", flex: 1 },
  orderMenuText: { color: "#cbd5e1", fontFamily: "Poppins_500Medium", fontSize: 11, marginTop: 8 },

  // Logout Button
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(239, 68, 68, 0.1)", marginHorizontal: 20, marginTop: 30, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.3)" },
  logoutText: { color: "#ef4444", fontFamily: "Poppins_700Bold", fontSize: 16, marginLeft: 8 },

  versionText: { textAlign: "center", color: "#475569", fontFamily: "Poppins_500Medium", fontSize: 12, marginTop: 30, marginBottom: 40 },
});