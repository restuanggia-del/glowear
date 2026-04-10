"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-context"; 
import { useRouter } from "next/navigation";
import { Users, Package, ShoppingCart, TrendingUp, Clock, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
// Import komponen chart dari Recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user, validate } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Fungsi untuk format Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);
  };

  useEffect(() => {
    const checkAccessAndFetchData = async () => {
      if (!user) {
        router.replace("/login");
        return;
      }
      try {
        const valid = await validate();
        if (!valid || user?.role !== "ADMIN") {
          setAccessDenied(true);
          return;
        }

        // FETCH DATA REALTIME DARI BACKEND
        try {
          const res = await fetch("http://localhost:3001/dashboard/stats");
          if (res.ok) {
            const data = await res.json();
            setDashboardData(data);
          } else {
            throw new Error("Backend belum siap");
          }
        } catch (fetchError) {
          // FALLBACK DUMMY DATA JIKA BACKEND BELUM DIBUAT (Agar UI tetap tampil cantik)
          console.log("Menggunakan data fallback karena endpoint backend belum tersedia.");
          setDashboardData({
            stats: { totalProduk: 45, pesananBaru: 12, totalPelanggan: 128, pendapatan: 15400000 },
            chartData: [
              { name: 'Jan', omzet: 4000000 }, { name: 'Feb', omzet: 3000000 },
              { name: 'Mar', omzet: 5500000 }, { name: 'Apr', omzet: 8500000 },
              { name: 'Mei', omzet: 6000000 }, { name: 'Jun', omzet: 15400000 }
            ],
            recentOrders: [
              { id: "ORD-9A8B7C", pelanggan: "Budi Santoso", tagihan: 1250000, status: "PENDING" },
              { id: "ORD-1D2E3F", pelanggan: "Komunitas React", tagihan: 4500000, status: "DIPROSES" },
              { id: "ORD-5X6Y7Z", pelanggan: "PT. Maju Jaya", tagihan: 8000000, status: "LUNAS" },
            ],
            bestSellers: [
              { nama: "Kaos Polos Cotton Combed 30s", terjual: 450 },
              { nama: "Hoodie Jumper Fleece", terjual: 320 },
              { nama: "Sablon DTF Custom A3", terjual: 215 },
            ]
          });
        }

        setLoading(false);
      } catch (error) {
        setAccessDenied(true);
      }
    };

    checkAccessAndFetchData();
  }, [user, validate, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (accessDenied) return null;

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Header Welcome Kelas Enterprise (Dengan Ilustrasi) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-lg border border-blue-500/20 mb-8">
        
        {/* Dekorasi Latar Belakang (Lingkaran Samar) */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-24 left-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 py-10 md:py-12 gap-8">
          
          {/* Sisi Kiri: Teks & Informasi */}
          <div className="flex-1 text-white max-w-xl">
            <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
              Kendalikan Konveksi Anda,<br/> {user?.nama || "Admin"}! 👋
            </h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed mb-6 font-medium max-w-md">
              Pantau arus kas, kelola pesanan masuk, dan pastikan target produksi Glowear tercapai tepat waktu hari ini.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Tombol Aksi Cepat (Opsional) */}
              <Link 
                href="/dashboard/orders" 
                className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                Cek Pesanan Masuk
              </Link>

              {/* Alert Cerdas (Sama seperti sebelumnya) */}
              {dashboardData?.stats?.pesananBaru > 0 && (
                <span className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  {dashboardData.stats.pesananBaru} Perlu Proses
                </span>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Ilustrasi Kustom (Menggunakan SVG Inline) */}
          <div className="hidden md:flex shrink-0 relative mr-4 lg:mr-12">
            {/* Bayangan di bawah ilustrasi */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/20 blur-md rounded-full"></div>
            
            {/* SVG Ilustrasi Bisnis/Dashboard */}
            <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl relative z-10">
              {/* Meja */}
              <rect x="20" y="150" width="200" height="6" rx="3" fill="#94A3B8"/>
              
              {/* Layar Monitor */}
              <rect x="50" y="40" width="140" height="90" rx="8" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="4"/>
              <rect x="54" y="44" width="132" height="82" rx="4" fill="#F8FAFC"/>
              
              {/* Kaki Monitor */}
              <path d="M110 130L100 150H140L130 130H110Z" fill="#CBD5E1"/>
              
              {/* Grafik di Monitor */}
              <rect x="65" y="80" width="15" height="30" rx="2" fill="#3B82F6"/>
              <rect x="85" y="60" width="15" height="50" rx="2" fill="#10B981"/>
              <rect x="105" y="90" width="15" height="20" rx="2" fill="#F59E0B"/>
              <rect x="125" y="50" width="15" height="60" rx="2" fill="#8B5CF6"/>
              <rect x="145" y="70" width="15" height="40" rx="2" fill="#EF4444"/>
              
              {/* Jendela Data Mini Kiri */}
              <rect x="10" y="20" width="60" height="40" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" className="animate-bounce" style={{animationDuration: '3s'}}/>
              <circle cx="25" cy="40" r="8" fill="#F59E0B" />
              <rect x="40" y="36" width="20" height="4" rx="2" fill="#CBD5E1"/>
              <rect x="40" y="44" width="15" height="4" rx="2" fill="#E2E8F0"/>

              {/* Jendela Data Mini Kanan */}
              <rect x="170" y="60" width="60" height="50" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" className="animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}/>
              <path d="M180 95L190 85L200 90L215 75" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="215" cy="75" r="3" fill="#10B981"/>
            </svg>

            {/* Aksen bintang/sparkle */}
            <svg className="absolute -top-6 -right-6 text-yellow-300 animate-pulse" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
            </svg>
          </div>

        </div>
      </div>

      {/* Baris Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Produk", value: dashboardData?.stats.totalProduk, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Pesanan Menunggu", value: dashboardData?.stats.pesananBaru, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
          { title: "Total Pelanggan", value: dashboardData?.stats.totalPelanggan, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
          { title: "Omzet Bulan Ini", value: formatRupiah(dashboardData?.stats.pendapatan), icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Area Chart & Tabel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Chart Interaktif (Porsi lebih besar) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Grafik Pendapatan</h2>
              <p className="text-xs text-gray-500">Statistik omzet 6 bulan terakhir</p>
            </div>
            <Link href="/dashboard/reports" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
              Lihat Detail <ArrowRight size={16} />
            </Link>
          </div>
          
          {/* Komponen Recharts */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData?.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(value) => `Rp ${value / 1000000}Jt`}
                />
                <Tooltip 
                  formatter={(value: number) => [formatRupiah(value), "Omzet"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="omzet" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kolom Kanan: Produk Terlaris */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Produk Terlaris</h2>
          <p className="text-xs text-gray-500 mb-6">Item paling banyak dipesan bulan ini</p>
          
          <div className="flex-1 flex flex-col justify-center space-y-5">
            {dashboardData?.bestSellers.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 font-bold border border-orange-100">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.nama}</h4>
                  <p className="text-xs text-gray-500">{item.terjual} Pcs Terjual</p>
                </div>
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Pesanan Terbaru */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Pesanan Masuk Terbaru</h2>
            <p className="text-xs text-gray-500">Butuh konfirmasi atau segera diproses</p>
          </div>
          <Link href="/dashboard/orders" className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">ID Pesanan</th>
                <th className="py-4 px-6 font-semibold">Pelanggan</th>
                <th className="py-4 px-6 font-semibold">Total Tagihan</th>
                <th className="py-4 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboardData?.recentOrders.map((order: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono text-sm font-bold text-gray-700">{order.id}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{order.pelanggan}</td>
                  <td className="py-4 px-6 text-sm font-bold text-blue-600">{formatRupiah(order.tagihan)}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'LUNAS' ? 'bg-green-100 text-green-700' : 
                      order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}