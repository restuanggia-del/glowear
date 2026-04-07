"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-context"; 
import { useRouter } from "next/navigation";
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user, validate } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.replace("/login");
        return;
      }
      try {
        const valid = await validate();
        if (!valid) {
          setAccessDenied(true);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setAccessDenied(true);
      }
    };

    checkAccess();
  }, [user, validate, router]);

  // Loading state yang lebih clean
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (accessDenied || user?.role !== "ADMIN") {
    router.replace("/unauthorized");
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Utama</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Selamat datang kembali, {user?.nama}! 👋
        </h2>
        <p className="text-gray-500">
          Ini adalah panel admin Glowear. Anda dapat mengelola produk, pesanan, dan pengguna dari sini.
        </p>
      </div>

      {/* Contoh Card Statistik Sederhana untuk mempercantik UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Produk", value: "120", icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Pesanan Baru", value: "15", icon: ShoppingCart, color: "text-green-600", bg: "bg-green-100" },
          { title: "Total Pelanggan", value: "840", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
          { title: "Pendapatan", value: "Rp 4.5M", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-100" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}