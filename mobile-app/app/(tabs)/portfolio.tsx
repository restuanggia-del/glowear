import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Dimensions, TouchableOpacity, Modal, Platform, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { API_URL } from "../../constants/config";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const COLUMN_GAP = 8;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - 30 - COLUMN_GAP) / NUM_COLUMNS;

export default function PortfolioScreen() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [categories, setCategories] = useState<string[]>([]);

  // Modal zoom gambar
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get("/portfolio");
        setPortfolios(res.data);

        // Ekstrak kategori unik dari data
        const cats = [...new Set(res.data.map((item: any) => item.kategori))] as string[];
        setCategories(["Semua", ...cats]);
      } catch (error) {
        console.error("Gagal mengambil portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const getImageUrl = (gambar: string) => {
    if (!gambar) return "https://via.placeholder.com/300";
    if (gambar.startsWith("http")) return gambar;
    return `${API_URL}/uploads/portfolio/${gambar}`;
  };

  const filteredData = activeFilter === "Semua"
    ? portfolios
    : portfolios.filter((item) => item.kategori === activeFilter);

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* FILTER TABS */}
      <View style={styles.filterContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === item && styles.filterTabActive]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* GRID PORTFOLIO */}
      {filteredData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={64} color="#334155" />
          <Text style={styles.emptyText}>Belum ada portfolio di kategori ini.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 30, paddingTop: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => setSelectedImage(item)}
            >
              <Image
                source={{ uri: getImageUrl(item.gambar) }}
                style={styles.cardImage}
              />
              <View style={styles.cardOverlay}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.kategori}</Text>
                </View>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.judul}</Text>
                {item.deskripsi && (
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.deskripsi}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* MODAL ZOOM GAMBAR */}
      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: getImageUrl(selectedImage.gambar) }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <View style={styles.modalInfo}>
                <View style={[styles.categoryBadge, { marginBottom: 8 }]}>
                  <Text style={styles.categoryText}>{selectedImage.kategori}</Text>
                </View>
                <Text style={styles.modalTitle}>{selectedImage.judul}</Text>
                {selectedImage.deskripsi && (
                  <Text style={styles.modalDesc}>{selectedImage.deskripsi}</Text>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingArea: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },

  // Filter Tabs
  filterContainer: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#1e293b" },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  filterTabActive: { backgroundColor: "rgba(56, 189, 248, 0.15)", borderColor: "#38bdf8" },
  filterText: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 13 },
  filterTextActive: { color: "#38bdf8", fontFamily: "Poppins_700Bold" },

  // Grid
  row: { justifyContent: "space-between", gap: COLUMN_GAP },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardImage: { width: "100%", height: ITEM_WIDTH * 1.1, backgroundColor: "#334155" },
  cardOverlay: { position: "absolute", top: 8, left: 8 },
  categoryBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: { color: "#38bdf8", fontFamily: "Poppins_600SemiBold", fontSize: 10, textTransform: "uppercase" },
  cardInfo: { padding: 10 },
  cardTitle: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  cardDesc: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 3, lineHeight: 16 },

  // Empty
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 50 },
  emptyText: { color: "#64748b", fontFamily: "Poppins_500Medium", marginTop: 15, fontSize: 14 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalClose: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  modalContent: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#1e293b",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalImage: { width: "100%", height: width * 0.85, backgroundColor: "#0f172a" },
  modalInfo: { padding: 20 },
  modalTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 18, marginBottom: 6 },
  modalDesc: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
});
