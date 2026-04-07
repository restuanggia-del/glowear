import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { api } from "./services/api";

export default function Register() {
  const [nama, setNama] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", {
        nama,
        username,
        email,
        password: kataSandi,
      });

      alert("Register berhasil");
    } catch (err: any) {
      console.log(err.response?.data);
      alert("Register gagal");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Glowear</Text>
      <Text style={styles.subtitle}>Buat akun baru</Text>

      <View style={styles.form}>
        <TextInput
          placeholder="Nama"
          value={nama}
          onChangeText={setNama}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          placeholderTextColor="#999"
        />

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

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Sudah punya akun? <Text style={styles.link}>Login</Text>
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
    backgroundColor: "#22c55e",
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
