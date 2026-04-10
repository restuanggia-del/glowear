import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { API_URL } from "@/constants/config";

const { width } = Dimensions.get("window");

export default function CatalogScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Gagal ambil produk:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  if (loading) {
    return (
      <View style={styles.loadingArea}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Koleksi Terbaik</Text>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2} // Tampilan Grid Profesional
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image 
                source={{ 
                    uri: item.gambar?.startsWith('http') 
                    ? item.gambar 
                    : `${API_URL}/uploads/${item.gambar}` // Ganti IP ke IP Laptop Anda
                }} 
                style={{ width: '100%', height: 150 }} // WAJIB ada width & height
                />
            <View style={styles.info}>
              <Text style={styles.catName}>{item.category?.namaKategori}</Text>
              <Text style={styles.prodName} numberOfLines={1}>{item.namaProduk}</Text>
              <Text style={styles.price}>{formatRupiah(item.harga)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingHorizontal: 15 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff", marginVertical: 20 },
  loadingArea: { flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" },
  row: { justifyContent: "space-between" },
  card: {
    backgroundColor: "#1e293b",
    width: width * 0.44,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
  },
  image: { width: "100%", height: 150, backgroundColor: "#334155" },
  info: { padding: 12 },
  catName: { color: "#38bdf8", fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  prodName: { color: "#fff", fontSize: 14, fontWeight: "bold", marginTop: 4 },
  price: { color: "#94a3b8", fontSize: 13, marginTop: 4 },
});