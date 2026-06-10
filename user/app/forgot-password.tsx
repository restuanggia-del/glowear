import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions, ScrollView, SafeAreaView } from "react-native";
import { api } from "../services/api";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Silakan masukkan email Anda");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() });
      Alert.alert("Sukses", res.data.message);
      // Di development, OTP dikembalikan di response untuk kemudahan
      if (res.data.otp) {
        setOtp(res.data.otp);
      }
      setStep(2);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Gagal mengirim OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("Error", "Silakan masukkan kode OTP");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email: email.trim(), otp: otp.trim() });
      setStep(3);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Kode OTP salah atau kadaluarsa");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        kataSandiBaru: newPassword,
      });
      Alert.alert("Sukses", "Password berhasil diubah. Silakan login kembali.", [
        { text: "OK", onPress: () => router.replace("/login") }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Gagal mereset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity style={s.backButton} onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>

          <View style={s.header}>
            <View style={s.iconCircle}>
              <Ionicons 
                name={step === 1 ? "mail-outline" : step === 2 ? "key-outline" : "lock-closed-outline"} 
                size={40} 
                color="#3b82f6" 
              />
            </View>
            <Text style={s.title}>
              {step === 1 ? "Lupa Password?" : step === 2 ? "Verifikasi OTP" : "Password Baru"}
            </Text>
            <Text style={s.subtitle}>
              {step === 1 
                ? "Jangan khawatir, masukkan email Anda untuk mendapatkan kode reset." 
                : step === 2 
                ? `Masukkan 6 digit kode yang telah dikirim ke ${email}` 
                : "Silakan buat password baru yang kuat untuk akun Anda."}
            </Text>
          </View>

          <View style={s.card}>
            {step === 1 && (
              <View style={s.inputGroup}>
                <Text style={s.label}>Email Terdaftar</Text>
                <View style={s.inputWrapper}>
                  <Ionicons name="at-outline" size={20} color="#94a3b8" style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="nama@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <TouchableOpacity style={s.button} onPress={handleRequestOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Kirim Kode OTP</Text>}
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View style={s.inputGroup}>
                <Text style={s.label}>Kode OTP</Text>
                <View style={s.inputWrapper}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#94a3b8" style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="123456"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <TouchableOpacity style={s.button} onPress={handleVerifyOtp} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Verifikasi</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={s.resendButton} onPress={handleRequestOtp} disabled={loading}>
                  <Text style={s.resendText}>Kirim ulang kode</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 3 && (
              <View style={s.inputGroup}>
                <Text style={s.label}>Password Baru</Text>
                <View style={s.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="••••••••"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#94a3b8"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <Text style={[s.label, { marginTop: 15 }]}>Konfirmasi Password</Text>
                <View style={s.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={s.inputIcon} />
                  <TextInput
                    style={s.input}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <TouchableOpacity style={s.button} onPress={handleResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Reset Password</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: "center" },
  backButton: { position: "absolute", top: 20, left: 24, zIndex: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  header: { alignItems: "center", marginBottom: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(59, 130, 246, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 26, fontFamily: "Poppins_700Bold", color: "#1e293b", textAlign: "center" },
  subtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#64748b", textAlign: "center", marginTop: 10, paddingHorizontal: 20 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#64748b", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  inputGroup: { width: "100%" },
  label: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#475569", marginBottom: 8 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: "#e2e8f0" },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#1e293b", fontFamily: "Poppins_500Medium", fontSize: 15 },
  button: { backgroundColor: "#1e293b", borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", marginTop: 30, shadowColor: "#1e293b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  buttonText: { color: "#fff", fontSize: 16, fontFamily: "Poppins_700Bold" },
  resendButton: { marginTop: 20, alignItems: "center" },
  resendText: { color: "#3b82f6", fontFamily: "Poppins_600SemiBold", fontSize: 14 },
});
