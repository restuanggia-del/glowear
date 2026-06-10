import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import Animated, { FadeInDown, FadeOutRight } from "react-native-reanimated";
import { useCartStore } from "../../store/cart-store";
import { API_URL } from "../../constants/config";
import { useAlert } from "../../components/CustomAlert";

export default function CartScreen() {
  const { showAlert } = useAlert();
  const { items, removeItem, updateQuantity, totalHarga, totalItems } = useCartStore();

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const handleRemove = (id: string) => {
    showAlert({ title: "Hapus Produk", message: "Yakin ingin menghapus produk ini?", showCancel: true, confirmText: "Hapus", cancelText: "Batal", type: "warning", onConfirm: () => removeItem(id) });
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    showAlert({
      title: "Lanjut ke Pembayaran?",
      message: "Anda akan melakukan pemesanan untuk " + items.length + " jenis produk.",
      showCancel: true, confirmText: "Ya, Checkout", cancelText: "Batal",
      onConfirm: () => {
        if (items.length === 1) {
          router.push({ pathname: '/checkout', params: { productId: items[0].productId } });
        } else {
          showAlert({ title: "Info", message: "Fitur checkout banyak produk sedang dalam integrasi. Silakan pesan satu per satu.", type: "info" });
        }
      }
    });
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)} exiting={FadeOutRight} style={s.cartItem}>
      <Image source={{ uri: item.gambar?.startsWith('http') ? item.gambar : `${API_URL}/uploads/${item.gambar}` }} style={s.itemImage} />
      <View style={s.itemInfo}>
        <Text style={s.itemName} numberOfLines={1}>{item.namaProduk}</Text>
        <Text style={s.itemPrice}>{formatRupiah(item.harga)}</Text>
        <View style={s.qtyRow}>
          <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.id, item.jumlah - 1)}><Ionicons name="remove" size={16} color="#64748b" /></TouchableOpacity>
          <Text style={s.qtyText}>{item.jumlah}</Text>
          <TouchableOpacity style={s.qtyBtn} onPress={() => updateQuantity(item.id, item.jumlah + 1)}><Ionicons name="add" size={16} color="#64748b" /></TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={s.removeBtn} onPress={() => handleRemove(item.id)}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={s.container}>
      <Stack.Screen options={{ headerShown: true, title: "Keranjang Belanja", headerStyle: { backgroundColor: "#ffffff" }, headerTintColor: "#1e293b", headerTitleStyle: { fontFamily: "Poppins_700Bold" }, headerShadowVisible: false }} />
      {items.length === 0 ? (
        <View style={s.emptyContainer}>
          <View style={s.iconCircle}><Ionicons name="cart-outline" size={80} color="#cbd5e1" /></View>
          <Text style={s.emptyTitle}>Keranjangmu Kosong</Text>
          <Text style={s.emptyDesc}>Sepertinya kamu belum memilih produk. Yuk cari produk keren di katalog!</Text>
          <TouchableOpacity style={s.shopBtn} onPress={() => router.push("/")}><Text style={s.shopBtnText}>Cari Produk</Text></TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList data={items} keyExtractor={(i) => i.id} renderItem={renderItem} contentContainerStyle={{ padding: 20, paddingBottom: 150 }} showsVerticalScrollIndicator={false} />
          <View style={s.bottomBar}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total ({totalItems()} Produk)</Text>
              <Text style={s.totalPrice}>{formatRupiah(totalHarga())}</Text>
            </View>
            <TouchableOpacity style={s.checkoutBtn} onPress={handleCheckout}>
              <Text style={s.checkoutBtnText}>Checkout Sekarang</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  iconCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center", marginBottom: 30 },
  emptyTitle: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 20 },
  emptyDesc: { color: "#94a3b8", fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", marginTop: 10, lineHeight: 22 },
  shopBtn: { backgroundColor: "#3b82f6", paddingHorizontal: 35, paddingVertical: 14, borderRadius: 15, marginTop: 35 },
  shopBtnText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 15 },
  cartItem: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 20, padding: 15, marginBottom: 15, alignItems: "center", borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: "#f1f5f9" },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { color: "#1e293b", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  itemPrice: { color: "#3b82f6", fontFamily: "Poppins_700Bold", fontSize: 14, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12 },
  qtyBtn: { backgroundColor: "#f1f5f9", width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  qtyText: { color: "#1e293b", fontFamily: "Poppins_700Bold", fontSize: 14 },
  removeBtn: { padding: 5 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", padding: 20, paddingBottom: 35, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: "#94a3b8", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 15 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  totalLabel: { color: "#64748b", fontFamily: "Poppins_500Medium", fontSize: 13 },
  totalPrice: { color: "#3b82f6", fontFamily: "Poppins_800ExtraBold", fontSize: 20 },
  checkoutBtn: { backgroundColor: "#3b82f6", height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", shadowColor: "#3b82f6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  checkoutBtnText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 16 },
});
