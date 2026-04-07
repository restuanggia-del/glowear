import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { api } from "./services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password: kataSandi,
      });

      console.log(res.data);
      alert("Login berhasil");
    } catch (err: any) {
      console.log(err.response?.data);
      alert("Login gagal");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Glowear</Text>
      <Text style={styles.subtitle}>Masuk ke akun kamu</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={kataSandi}
          onChangeText={setKataSandi}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Belum punya akun? <Text style={styles.link}>Daftar</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 30,
  },
  form: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 16,
  },
  input: {
    backgroundColor: "#334155",
    color: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#38bdf8",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 20,
  },
  link: {
    color: "#38bdf8",
    fontWeight: "bold",
  },
});
