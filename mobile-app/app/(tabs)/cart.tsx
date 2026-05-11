import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function CartScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keranjang Belanja</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="cart-outline" size={80} color="#38bdf8" />
          </View>
          <Text style={styles.emptyTitle}>Keranjangmu Masih Kosong</Text>
          <Text style={styles.emptyDesc}>
            Sepertinya kamu belum menambahkan produk apa pun. Yuk, mulai belanja sekarang!
          </Text>
          
          <TouchableOpacity 
            style={styles.shopBtn} 
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.shopBtnText}>Mulai Belanja</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Kenapa Belanja di Glowear?</Text>
          <View style={styles.infoGrid}>
             <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={24} color="#38bdf8" />
                <Text style={styles.infoText}>Produk Berkualitas</Text>
             </View>
             <View style={styles.infoItem}>
                <Ionicons name="flash" size={24} color="#38bdf8" />
                <Text style={styles.infoText}>Proses Cepat</Text>
             </View>
             <View style={styles.infoItem}>
                <Ionicons name="headset" size={24} color="#38bdf8" />
                <Text style={styles.infoText}>CS Responsif</Text>
             </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    backgroundColor: "#1e293b",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 22 },
  scrollContent: { padding: 20, alignItems: "center", justifyContent: "center", flexGrow: 1 },
  emptyContainer: { alignItems: "center", width: "100%", paddingVertical: 40 },
  iconCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(56, 189, 248, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 30 },
  emptyTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 20, textAlign: "center" },
  emptyDesc: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", marginTop: 10, paddingHorizontal: 30, lineHeight: 22 },
  shopBtn: { backgroundColor: "#38bdf8", paddingHorizontal: 40, paddingVertical: 16, borderRadius: 20, marginTop: 40, shadowColor: "#38bdf8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  shopBtnText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 16 },
  
  infoSection: { width: "100%", marginTop: 60, paddingHorizontal: 10 },
  infoTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16, marginBottom: 20, textAlign: "center" },
  infoGrid: { flexDirection: "row", justifyContent: "space-between" },
  infoItem: { alignItems: "center", flex: 1 },
  infoText: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 11, marginTop: 8, textAlign: "center" },
});
