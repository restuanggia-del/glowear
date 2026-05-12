import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ImageBackground, Image, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from "react-native";
import { api } from "../services/api";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../services/notifications";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const BACKGROUND_IMAGES = [
  require("../assets/images/bg-1.jpeg"),
  require("../assets/images/bg-2.jpeg"),
  require("../assets/images/bg-3.jpeg"),
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);

  // Slideshow effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prevBg) => (prevBg + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = kataSandi.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("Error", "Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email: trimmedEmail,
        kataSandi: trimmedPassword,
      });

      if (res.data.access_token) {
        await AsyncStorage.setItem("userToken", res.data.access_token);
      }
      await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));
      
      const pushToken = await registerForPushNotificationsAsync();
      
      if (pushToken && res.data.user?.id) {
        try {
          await api.put(`/users/${res.data.user.id}`, { expoPushToken: pushToken });
          res.data.user.expoPushToken = pushToken;
          await AsyncStorage.setItem("userData", JSON.stringify(res.data.user));
        } catch (pushErr) {
          console.log("Failed to save push token to backend:", pushErr);
        }
      }

      Alert.alert("Sukses", "Login berhasil!");
      router.replace("./(tabs)");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Periksa kembali email dan password Anda.";
      Alert.alert("Login gagal", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={BACKGROUND_IMAGES[currentBg]}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image source={require("../assets/images/logoglomed.png")} style={styles.logo} resizeMode="contain" />
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>Selamat Datang</Text>
                <Text style={styles.subtitle}>Silakan masuk ke akun Anda</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    placeholder="admin@glowear.com"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="••••••••"
                      secureTextEntry={!showPassword}
                      value={kataSandi}
                      onChangeText={setKataSandi}
                      style={styles.passwordInput}
                      placeholderTextColor="#94a3b8"
                    />
                    <TouchableOpacity 
                      style={styles.eyeButton} 
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.rememberRow}>
                  <TouchableOpacity style={styles.checkboxContainer}>
                    <View style={styles.checkbox} />
                    <Text style={styles.rememberText}>Ingat Saya</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                    <Text style={styles.forgotText}>Lupa kata sandi?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Masuk</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Belum punya akun?</Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.linkText}> Buat Akun Baru</Text>
              </TouchableOpacity>
            </View>
            
          </ScrollView>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(30, 27, 75, 0.7)", // indigo-950/70
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  logo: {
    width: 140,
    height: 140,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 32,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins_800ExtraBold",
    color: "#1e293b", // slate-800
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#64748b", // slate-500
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    color: "#334155", // slate-700
  },
  input: {
    backgroundColor: "#f8fafc", // slate-50
    borderWidth: 1,
    borderColor: "#e2e8f0", // slate-200
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#1e293b",
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#1e293b",
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
  },
  eyeButton: {
    padding: 14,
  },
  rememberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1", // slate-300
    borderRadius: 4,
  },
  rememberText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "#64748b", // slate-500
  },
  forgotText: {
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    color: "#3b82f6", // blue-500
  },
  button: {
    backgroundColor: "#0f172a", // slate-900
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins_700Bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
  },
  linkText: {
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
  },
});