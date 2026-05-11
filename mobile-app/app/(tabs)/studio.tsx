import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function StudioScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <Text style={styles.title}>Glowear Studio</Text>
          <Text style={styles.subtitle}>Custom desain kaos dan seragam sesukamu</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.heroCard}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop" }} 
            style={styles.heroImage} 
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Bikin Kaos Sendiri!</Text>
            <Text style={styles.heroSubtitle}>Sablon satuan atau lusinan dengan harga terbaik</Text>
            <TouchableOpacity style={styles.startBtn} activeOpacity={0.8}>
              <Text style={styles.startBtnText}>Mulai Desain</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Text style={styles.sectionTitle}>Pilih Layanan</Text>
        
        <View style={styles.grid}>
          <TouchableOpacity style={styles.serviceCard} activeOpacity={0.9}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
              <Ionicons name="color-palette" size={32} color="#38bdf8" />
            </View>
            <Text style={styles.serviceName}>Sablon DTF</Text>
            <Text style={styles.serviceDesc}>Full color & awet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard} activeOpacity={0.9}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
              <MaterialCommunityIcons name="embroidery" size={32} color="#fbbf24" />
            </View>
            <Text style={styles.serviceName}>Bordir Komputer</Text>
            <Text style={styles.serviceDesc}>Hasil rapi & mewah</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard} activeOpacity={0.9}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="shirt" size={32} color="#ef4444" />
            </View>
            <Text style={styles.serviceName}>Pola Custom</Text>
            <Text style={styles.serviceDesc}>Potongan khusus</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.serviceCard} activeOpacity={0.9}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <Ionicons name="people" size={32} color="#22c55e" />
            </View>
            <Text style={styles.serviceName}>Seragam Tim</Text>
            <Text style={styles.serviceDesc}>Diskon kuantitas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.comingSoonBox}>
          <Ionicons name="construct-outline" size={48} color="#64748b" />
          <Text style={styles.comingSoonTitle}>Fitur Studio Masih Dalam Pengembangan</Text>
          <Text style={styles.comingSoonDesc}>Hubungi admin via WhatsApp untuk konsultasi desain gratis saat ini!</Text>
          <TouchableOpacity 
             style={styles.waBtn} 
             activeOpacity={0.8}
             onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text style={styles.waBtnText}>Chat Admin Studio</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  scrollContent: { padding: 20 },
  header: { marginTop: 40, marginBottom: 25 },
  title: { color: "#fff", fontFamily: "Poppins_800ExtraBold", fontSize: 28 },
  subtitle: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 14, marginTop: 4 },
  
  heroCard: { 
    height: 220, 
    borderRadius: 24, 
    overflow: "hidden", 
    marginBottom: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  heroImage: { width: "100%", height: "100%" },
  heroOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: "rgba(15, 23, 42, 0.6)", 
    padding: 20, 
    justifyContent: "flex-end" 
  },
  heroTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 22 },
  heroSubtitle: { color: "#e2e8f0", fontFamily: "Poppins_400Regular", fontSize: 12, marginBottom: 15 },
  startBtn: { backgroundColor: "#38bdf8", alignSelf: "flex-start", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  startBtnText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 14 },

  sectionTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 18, marginBottom: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 15 },
  serviceCard: { 
    width: (width - 55) / 2, 
    backgroundColor: "#1e293b", 
    borderRadius: 20, 
    padding: 20, 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  iconBox: { width: 64, height: 64, borderRadius: 20, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  serviceName: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },
  serviceDesc: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 2 },

  comingSoonBox: { 
    marginTop: 40, 
    backgroundColor: "#111827", 
    borderRadius: 24, 
    padding: 30, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#334155",
    borderStyle: "dashed"
  },
  comingSoonTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 15, textAlign: "center", marginTop: 15 },
  comingSoonDesc: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 12, textAlign: "center", marginTop: 8, lineHeight: 18 },
  waBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#22c55e", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginTop: 20, gap: 8 },
  waBtnText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },
});
