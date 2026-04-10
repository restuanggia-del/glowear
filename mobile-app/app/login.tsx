import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { api } from "../services/api"; // Pastikan path ini benar
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [loading, setLoading] = useState(false);

const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = kataSandi.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("Error", "Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting login for:", trimmedEmail);
      const res = await api.post("/auth/login", {
        email: trimmedEmail,
        kataSandi: trimmedPassword,
      });
      
      console.log("Login response:", res.data);

      // Store user data (backend doesn't return token)
      await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));
      
      Alert.alert("Sukses", "Login berhasil!");
      router.replace("./(tabs)");
    } catch (err: any) {
      console.log("Login error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || "Periksa kembali email dan password Anda.";
      Alert.alert("Login gagal", errorMessage);
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