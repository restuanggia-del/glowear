import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { api } from "./services/api"; // Pastikan path ini benar
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !kataSandi) {
      return Alert.alert("Error", "Email dan password wajib diisi");
    }

    setLoading(true);
    try {
      // PERBAIKAN: Gunakan key "kataSandi" sesuai database backend Anda
      const res = await api.post("/auth/login", {
        email: email,
        password: kataSandi, 
      });

      // Simpan Token dan Data User ke memori HP
      await AsyncStorage.setItem("userToken", res.data.access_token);
      await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));
      
      Alert.alert("Sukses", "Login berhasil!");
      
      // Gunakan replace agar user tidak bisa 'back' ke halaman login
      router.replace("/home"); 
    } catch (err: any) {
      console.log(err.response?.data);
      Alert.alert("Login gagal", err.response?.data?.message || "Periksa kembali email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Glowear<Text style={{color: "#38bdf8"}}>.</Text></Text>
      <Text style={styles.subtitle}>Masuk ke akun kamu</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={kataSandi}
          onChangeText={setKataSandi}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Belum punya akun?{" "}
        <Text style={styles.link} onPress={() => router.push("/register")}>
          Daftar
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