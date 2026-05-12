import { View, Text, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Modal, Platform, StatusBar } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { API_URL } from "../../constants/config";
import { Ionicons } from "@expo/vector-icons";
import Skeleton from "../../components/Skeleton";

const { width } = Dimensions.get("window");
const COLUMN_GAP = 8;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - 30 - COLUMN_GAP) / NUM_COLUMNS;

export default function PortfolioScreen() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get("/portfolio");
        setPortfolios(res.data);
        const cats = [...new Set(res.data.map((item: any) => item.kategori))] as string[];
        setCategories(["Semua", ...cats]);
      } catch (error) { console.error("Gagal mengambil portfolio:", error); }
      finally { setLoading(false); }
    };
    fetchPortfolio();
  }, []);

  const getImageUrl = (gambar: string) => {
    if (!gambar) return "https://via.placeholder.com/300";
    if (gambar.startsWith("http")) return gambar;
    return `${API_URL}/uploads/portfolio/${gambar}`;
  };

  const filteredData = activeFilter === "Semua" ? portfolios : portfolios.filter((item) => item.kategori === activeFilter);

  if (loading) {
    return (
      <View style={s.container}>
        <View style={{ padding: 15 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <Skeleton width={80} height={35} borderRadius={20} />
            <Skeleton width={80} height={35} borderRadius={20} />
            <Skeleton width={80} height={35} borderRadius={20} />
          </View>
          <View style={s.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Skeleton height={ITEM_WIDTH * 1.2} borderRadius={16} style={{ marginBottom: 8 }} />
              <Skeleton height={ITEM_WIDTH * 1.4} borderRadius={16} />
            </View>
            <View style={{ flex: 1 }}>
              <Skeleton height={ITEM_WIDTH * 1.4} borderRadius={16} style={{ marginBottom: 8 }} />
              <Skeleton height={ITEM_WIDTH * 1.2} borderRadius={16} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.filterContainer}>
        <FlatList data={categories} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => item} contentContainerStyle={{ paddingHorizontal: 15 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[s.filterTab, activeFilter === item && s.filterTabActive]} onPress={() => setActiveFilter(item)}>
              <Text style={[s.filterText, activeFilter === item && s.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {filteredData.length === 0 ? (
        <View style={s.emptyContainer}>
          <Ionicons name="images-outline" size={64} color="#cbd5e1" />
          <Text style={s.emptyText}>Belum ada portfolio di kategori ini.</Text>
        </View>
      ) : (
        <FlatList data={filteredData} keyExtractor={(item) => item.id} numColumns={NUM_COLUMNS} columnWrapperStyle={s.row}
          showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 100, paddingTop: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={() => setSelectedImage(item)}>
              <Image source={{ uri: getImageUrl(item.gambar) }} style={s.cardImage} />
              <View style={s.cardOverlay}>
                <View style={s.categoryBadge}><Text style={s.categoryText}>{item.kategori}</Text></View>
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.judul}</Text>
                {item.deskripsi && <Text style={s.cardDesc} numberOfLines={2}>{item.deskripsi}</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={s.modalClose} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <View style={s.modalContent}>
              <Image source={{ uri: getImageUrl(selectedImage.gambar) }} style={s.modalImage} resizeMode="contain" />
              <View style={s.modalInfo}>
                <View style={[s.categoryBadge, { marginBottom: 8 }]}><Text style={s.categoryText}>{selectedImage.kategori}</Text></View>
                <Text style={s.modalTitle}>{selectedImage.judul}</Text>
                {selectedImage.deskripsi && <Text style={s.modalDesc}>{selectedImage.deskripsi}</Text>}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  filterContainer: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#f1f5f9" },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0" },
  filterTabActive: { backgroundColor: "rgba(59, 130, 246, 0.1)", borderColor: "#3b82f6" },
  filterText: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 13 },
  filterTextActive: { color: "#3b82f6", fontFamily: "Poppins_700Bold" },
  row: { justifyContent: "space-between", gap: COLUMN_GAP },
  card: { width: ITEM_WIDTH, backgroundColor: "#ffffff", borderRadius: 14, marginBottom: 12, overflow: "hidden", borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardImage: { width: "100%", height: ITEM_WIDTH * 1.1, backgroundColor: "#f1f5f9" },
  cardOverlay: { position: "absolute", top: 8, left: 8 },
  categoryBadge: { backgroundColor: "rgba(59, 130, 246, 0.9)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryText: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 10, textTransform: "uppercase" },
  cardInfo: { padding: 10 },
  cardTitle: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 13 },
  cardDesc: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 3, lineHeight: 16 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 50 },
  emptyText: { color: "#94a3b8", fontFamily: "Poppins_500Medium", marginTop: 15, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.9)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalClose: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  modalContent: { width: "100%", maxHeight: "85%", backgroundColor: "#ffffff", borderRadius: 20, overflow: "hidden" },
  modalImage: { width: "100%", height: width * 0.85, backgroundColor: "#f1f5f9" },
  modalInfo: { padding: 20 },
  modalTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 18, marginBottom: 6 },
  modalDesc: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20 },
});
