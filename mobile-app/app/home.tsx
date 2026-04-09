import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Home() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Ambil data user dari penyimpanan lokal saat halaman dimuat
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setUserName(user.nama); // Ambil field 'nama' dari data user
        }
      } catch (error) {
        console.log("Gagal memuat data user", error);
      }
    };
    
    loadUserData();
  }, []);

  const handleLogout = async () => {
    // Hapus sesi login dan kembali ke halaman login
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat datang di Glowear 👋</Text>
      <Text style={styles.subtitle}>Halo, {userName || "Pelanggan"}!</Text>

      {/* Nanti di sini Anda bisa meletakkan daftar Katalog Baju */}
      
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Keluar Akun (Logout)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 40,
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  }
});