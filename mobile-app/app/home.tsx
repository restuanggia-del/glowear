import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function Home() {
  const [userData, setUserData] = useState<any>(null);

  // Ambil data user yang disimpan saat login tadi
  useEffect(() => {
    const loadData = async () => {
      const dataString = await AsyncStorage.getItem("userData");
      if (dataString) {
        setUserData(JSON.parse(dataString));
      }
    };
    loadData();
  }, []);

  // Fungsi untuk Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
    // Kembali ke halaman login
    router.replace("/login"); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat Datang!</Text>
      
      {userData ? (
        <Text style={styles.subtitle}>Halo, {userData.nama}</Text>
      ) : (
        <Text style={styles.subtitle}>Memuat data...</Text>
      )}

      <View style={styles.card}>
        <Text style={styles.cardText}>Ini adalah halaman utama (Home) aplikasi Glowear Anda.</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  subtitle: { fontSize: 18, color: "#38bdf8", marginBottom: 30 },
  card: { backgroundColor: "#1e293b", padding: 20, borderRadius: 16, marginBottom: 30, width: "100%" },
  cardText: { color: "#94a3b8", textAlign: "center", fontSize: 16 },
  logoutButton: { backgroundColor: "#ef4444", paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});