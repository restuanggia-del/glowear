import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { api } from "./services/api";
import { router } from "expo-router";

export default function Register() {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nama || !username || !email || !kataSandi) {
      return Alert.alert("Error", "Semua kolom wajib diisi!");
    }

    setLoading(true);
    try {
      // PERBAIKAN: Cocokkan nama field dengan backend (kataSandi)
      await api.post("/auth/register", {
        nama,
        username,
        email,
        kataSandi: kataSandi, 
      });

      Alert.alert("Sukses", "Akun berhasil dibuat! Silakan login.", [
        { text: "OK", onPress: () => router.replace("/login") }
      ]);
    } catch (err: any) {
      console.log(err.response?.data);
      Alert.alert("Register gagal", err.response?.data?.message || "Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Glowear<Text style={{color: "#38bdf8"}}>.</Text></Text>
      <Text style={styles.subtitle}>Buat akun baru</Text>

      <View style={styles.form}>
        <TextInput placeholder="Nama Lengkap" value={nama} onChangeText={setNama} style={styles.input} placeholderTextColor="#999" />
        <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} placeholderTextColor="#999" autoCapitalize="none" />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Password" secureTextEntry value={kataSandi} onChangeText={setKataSandi} style={styles.input} placeholderTextColor="#999" />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Sudah punya akun?{" "}
        <Text style={styles.link} onPress={() => router.push("/login")}>
          Login
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 16, color: "#94a3b8", textAlign: "center", marginBottom: 30 },
  form: { backgroundColor: "#1e293b", padding: 20, borderRadius: 16 },
  input: { backgroundColor: "#334155", color: "#fff", padding: 14, borderRadius: 10, marginBottom: 12 },
  button: { backgroundColor: "#38bdf8", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#0f172a", fontWeight: "bold", fontSize: 16 },
  footer: { color: "#94a3b8", textAlign: "center", marginTop: 20 },
  link: { color: "#38bdf8", fontWeight: "bold" },
});