"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/auth-context"; 
import { useRouter } from "next/navigation";
import { Users, Package, ShoppingCart, TrendingUp, Clock, Star, ArrowRight, Search, Activity, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Lottie from "lottie-react";
import animationData from "@/app/assets/Product Offer.json";
import Skeleton from "@/app/components/Skeleton";

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
          const [resStats, resPopular] = await Promise.all([
            fetch("http://localhost:3001/dashboard/stats"),
            fetch("http://localhost:3001/search/popular")
          ]);
          
          if (resStats.ok) {
            const stats = await resStats.json();
            const popular = resPopular.ok ? await resPopular.json() : [];
            setDashboardData({ ...stats, popularSearches: popular });
          } else {
            throw new Error("Backend belum siap");
          }
        } catch (fetchError) {
          // FALLBACK DUMMY DATA JIKA BACKEND BELUM DIBUAT (Agar UI tetap tampil cantik)
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
            ],
            popularSearches: [
              { keyword: "Kaos Polo", count: 120 },
              { keyword: "Jersey Futsal", count: 85 },
              { keyword: "Bordir Komputer", count: 64 },
              { keyword: "Sablon DTF", count: 42 }
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
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Banner Skeleton */}
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        
        {/* Chart & Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-96 rounded-[2.5rem]" />
          <Skeleton className="h-96 rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (accessDenied) return null;

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5 group">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none group-hover:from-blue-600/30 transition-all duration-700"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-10 py-10 md:py-12 gap-10">
          <div className="flex-1 text-white z-20">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
               <Activity size={12} /> System Status: Optimal
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-[1.1] tracking-tight">
               Selamat Datang Kembali, <br/>
               <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                  {user?.nama || "Administrator"}
               </span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg font-medium">
               Aktivitas produksi hari ini berjalan lancar. Pantau performa bisnis dan kelola permintaan custom pelanggan dengan kendali penuh.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link 
                href="/dashboard/orders" 
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3.5 rounded-2xl text-sm font-black shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-wider"
              >
                Kelola Pesanan <ArrowRight size={18} />
              </Link>

              {dashboardData?.stats?.pesananBaru > 0 && (
                <div className="bg-white/5 border border-white/10 text-white px-5 py-3.5 rounded-2xl text-xs font-black backdrop-blur-md flex items-center gap-3">
                   <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping"></div>
                   <span className="uppercase tracking-widest">{dashboardData.stats.pesananBaru} PESANAN PERLU DIPROSES</span>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex shrink-0 relative w-80 h-80 z-10 items-center justify-center">
             <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
             <Lottie 
                animationData={animationData} 
                loop={true} 
                className="w-full h-full drop-shadow-[0_0_50px_rgba(37,99,235,0.2)]"
             />
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Katalog", value: dashboardData?.stats.totalProduk, icon: Package, color: "text-blue-500", bg: "bg-blue-50", trend: "+5% vs bln lalu" },
          { title: "Antrean Produksi", value: dashboardData?.stats.pesananBaru, icon: Clock, color: "text-orange-500", bg: "bg-orange-50", trend: "12 pesanan baru" },
          { title: "Total Pelanggan", value: dashboardData?.stats.totalPelanggan, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50", trend: "+18 hari ini" },
          { title: "Omzet Berjalan", value: formatRupiah(dashboardData?.stats.pendapatan), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", trend: "Target: 85%" },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group hover:-translate-y-1">
            <div className="flex justify-between items-start">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-inner transition-transform group-hover:scale-110 duration-300`}>
                 <stat.icon size={28} />
               </div>
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.trend}</span>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                 <Activity className="text-blue-500" size={20} /> Analisis Pendapatan
              </h2>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Laporan finansial 6 periode terakhir</p>
            </div>
            <Link href="/dashboard/reports" className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center gap-2 border border-slate-200">
              LAPORAN LENGKAP <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData?.chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="colorOmzet" x1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} dy={15} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                  tickFormatter={(value) => `Rp${value / 1000000}jt`}
                />
                <Tooltip 
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                          <p className="text-base font-black text-white">{formatRupiah(Number(payload[0].value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="omzet" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorOmzet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          {/* Best Sellers */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <Star size={20} fill="currentColor" />
               </div>
               <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Best Sellers</h2>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Favorit Pelanggan</p>
               </div>
            </div>
            
            <div className="space-y-6">
              {dashboardData?.bestSellers.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 font-black text-xs border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-100 transition-colors">
                    0{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors">{item.nama}</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.terjual} terjual</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Searches */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex items-center justify-between mb-8 relative z-10">
               <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Keyword Tren</h2>
               <Search size={16} className="text-blue-400" />
            </div>
            <div className="space-y-4 relative z-10">
              {dashboardData?.popularSearches.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-600">#{idx + 1}</span>
                    <span className="text-[13px] font-bold text-slate-300 group-hover:text-blue-400 transition-colors">{item.keyword}</span>
                  </div>
                  <span className="bg-white/5 px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-500 border border-white/5 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    {item.count}X
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
               <CreditCard className="text-blue-500" size={20} /> Transaksi Terbaru
            </h2>
            <p className="text-[13px] text-slate-500 font-medium mt-1">Pantau status pembayaran pelanggan secara real-time</p>
          </div>
          <Link href="/dashboard/orders" className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
            LIHAT SEMUA PESANAN
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="py-5 px-8">ID Pesanan</th>
                <th className="py-5 px-8">Nama Pelanggan</th>
                <th className="py-5 px-8">Nominal</th>
                <th className="py-5 px-8">Status Bayar</th>
                <th className="py-5 px-8 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dashboardData?.recentOrders.map((order: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 px-8">
                     <span className="font-mono text-[13px] font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {order.id}
                     </span>
                  </td>
                  <td className="py-5 px-8">
                     <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{order.pelanggan}</p>
                  </td>
                  <td className="py-5 px-8">
                     <p className="text-sm font-black text-slate-900">{formatRupiah(order.tagihan)}</p>
                  </td>
                  <td className="py-5 px-8">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                      order.status === 'LUNAS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      order.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        order.status === 'LUNAS' ? 'bg-emerald-500' : 
                        order.status === 'PENDING' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}></div>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right">
                     <Link href="/dashboard/orders" className="inline-flex p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <ArrowRight size={18} />
                     </Link>
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