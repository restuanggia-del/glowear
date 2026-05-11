import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import Animated, { FadeInDown, FadeOutRight } from "react-native-reanimated";
import { useCartStore } from "../../store/cart-store";
import { API_URL } from "../../constants/config";
import { useAlert } from "../../components/CustomAlert";

export default function CartScreen() {
  const { showAlert } = useAlert();
  const { items, removeItem, updateQuantity, totalHarga, totalItems, clearCart } = useCartStore();

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);
  };

  const handleRemove = (id: string) => {
    showAlert({
      title: "Hapus Produk",
      message: "Yakin ingin menghapus produk ini dari keranjang?",
      showCancel: true,
      confirmText: "Hapus",
      cancelText: "Batal",
      type: "warning",
      onConfirm: () => removeItem(id)
    });
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    // Untuk saat ini, karena checkout.tsx didesain per-produk, 
    // kita arahkan ke checkout produk pertama atau beri info.
    // IDEALNYA: Buat halaman CheckoutCart.tsx yang menghandle banyak item.
    showAlert({
      title: "Lanjut ke Pembayaran?",
      message: "Anda akan melakukan pemesanan untuk " + items.length + " jenis produk.",
      showCancel: true,
      confirmText: "Ya, Checkout",
      cancelText: "Batal",
      onConfirm: () => {
        if (items.length === 1) {
            router.push({ pathname: '/checkout', params: { productId: items[0].productId } });
        } else {
            showAlert({
              title: "Info",
              message: "Fitur checkout banyak produk sekaligus sedang dalam integrasi. Silakan pesan satu per satu sementara ini.",
              type: "info"
            });
        }
      }
    });
  };

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100)} 
      exiting={FadeOutRight}
      style={styles.cartItem}
    >
      <Image 
        source={{ uri: item.gambar?.startsWith('http') ? item.gambar : `${API_URL}/uploads/${item.gambar}` }} 
        style={styles.itemImage} 
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.namaProduk}</Text>
        <Text style={styles.itemPrice}>{formatRupiah(item.harga)}</Text>
        <View style={styles.qtyRow}>
           <TouchableOpacity 
             style={styles.qtyBtn} 
             onPress={() => updateQuantity(item.id, item.jumlah - 1)}
           >
             <Ionicons name="remove" size={16} color="#fff" />
           </TouchableOpacity>
           <Text style={styles.qtyText}>{item.jumlah}</Text>
           <TouchableOpacity 
             style={styles.qtyBtn} 
             onPress={() => updateQuantity(item.id, item.jumlah + 1)}
           >
             <Ionicons name="add" size={16} color="#fff" />
           </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
         <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: "Keranjang Belanja",
        headerStyle: { backgroundColor: "#1e293b" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontFamily: "Poppins_700Bold" }
      }} />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="cart-outline" size={80} color="#334155" />
          </View>
          <Text style={styles.emptyTitle}>Keranjangmu Kosong</Text>
          <Text style={styles.emptyDesc}>
            Sepertinya kamu belum memilih produk. Yuk cari produk keren di katalog!
          </Text>
          <TouchableOpacity 
            style={styles.shopBtn} 
            onPress={() => router.push("/")}
          >
            <Text style={styles.shopBtnText}>Cari Produk</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.bottomBar}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({totalItems()} Produk)</Text>
              <Text style={styles.totalPrice}>{formatRupiah(totalHarga())}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutBtnText}>Checkout Sekarang</Text>
              <Ionicons name="arrow-forward" size={18} color="#0f172a" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  iconCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#1e293b", justifyContent: "center", alignItems: "center", marginBottom: 30 },
  emptyTitle: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 20 },
  emptyDesc: { color: "#64748b", fontFamily: "Poppins_400Regular", fontSize: 14, textAlign: "center", marginTop: 10, lineHeight: 22 },
  shopBtn: { backgroundColor: "#38bdf8", paddingHorizontal: 35, paddingVertical: 14, borderRadius: 15, marginTop: 35 },
  shopBtnText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 15 },
  
  cartItem: { 
    flexDirection: "row", 
    backgroundColor: "#1e293b", 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 15, 
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155"
  },
  itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: "#334155" },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { color: "#fff", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  itemPrice: { color: "#38bdf8", fontFamily: "Poppins_700Bold", fontSize: 14, marginTop: 2 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 12 },
  qtyBtn: { backgroundColor: "#334155", width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  qtyText: { color: "#fff", fontFamily: "Poppins_700Bold", fontSize: 14 },
  removeBtn: { padding: 5 },

  bottomBar: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: "#1e293b", 
    padding: 20, 
    paddingBottom: 35,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  totalLabel: { color: "#94a3b8", fontFamily: "Poppins_500Medium", fontSize: 13 },
  totalPrice: { color: "#38bdf8", fontFamily: "Poppins_800ExtraBold", fontSize: 20 },
  checkoutBtn: { backgroundColor: "#38bdf8", height: 56, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  checkoutBtnText: { color: "#0f172a", fontFamily: "Poppins_700Bold", fontSize: 16 },
});
