import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { api } from "../app/services/api";

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
        kataSandi,
      });

      alert("Register berhasil");
    } catch {
      alert("Register gagal");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Register Glowear</Text>

      <TextInput placeholder="Nama" onChangeText={setNama} />
      <TextInput placeholder="Username" onChangeText={setUsername} />
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setKataSandi}
      />

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}