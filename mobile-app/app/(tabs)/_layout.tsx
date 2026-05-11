import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, View, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#38bdf8",
        tabBarInactiveTintColor: "#64748b",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: "Poppins_600SemiBold",
          fontSize: 9, // Diperkecil agar muat 6 tab
          marginTop: 4,
          marginBottom: Platform.OS === "android" ? 8 : 0,
        },
        tabBarStyle: {
          backgroundColor: "#1e293b",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={focused ? "home" : "home-outline"} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          tabBarLabel: "Studio",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={focused ? "color-palette" : "color-palette-outline"} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarLabel: "Keranjang",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={focused ? "cart" : "cart-outline"} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarLabel: "Pesanan",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={focused ? "receipt" : "receipt-outline"} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          tabBarLabel: "Galeri",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={focused ? "images" : "images-outline"} size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={focused ? "person" : "person-outline"} size={20} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50, // Diperkecil dari 60 agar muat 6 tab
    height: 30, // Diperkecil dari 32
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  activeIconContainer: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
});