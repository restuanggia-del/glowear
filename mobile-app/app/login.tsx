import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { api } from "../app/services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        kataSandi,
      });

      console.log(res.data);
      alert("Login berhasil");
    } catch (err: any) {
      alert("Login gagal");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Login Glowear</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={kataSandi}
        onChangeText={setKataSandi}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}