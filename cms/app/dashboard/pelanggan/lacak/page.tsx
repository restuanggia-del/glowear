"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { Package, Truck, CheckCircle2, ClipboardList, Scissors, MapPin } from "lucide-react";
import Link from "next/link";

export default function LacakPesananPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch("http://localhost:3001/orders");
      const allOrders = await res.json();
      
      // Ambil pesanan milik user ini yang SUDAH DIBAYAR (minimal DP)
      const activeOrders = allOrders.filter(
        (o: any) => o.userId === user?.id && o.statusPembayaran !== "BELUM_BAYAR"
      );
      
      // Urutkan dari yang terbaru
      activeOrders.sort((a: any, b: any) => new Date(b.waktuDibuat).getTime() - new Date(a.waktuDibuat).getTime());
      
      setOrders(activeOrders);
    } catch (error) {
      console.error("Gagal mengambil data pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyOrders();
  }, [user]);

  // Fungsi untuk menentukan level progress bar (1 - 4)
  const getProgressLevel = (status: string) => {
    switch (status) {
      case "PENDING": return 1;
      case "DIPROSES": return 2;
      case "DIKIRIM": return 3;
      case "SELESAI": return 4;
      default: return 1;
    }
  };

  return (
    <div className="font-sans max-w-4xl mx-auto pb-20 space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-2">Lacak Pesanan</h1>
        <p className="text-emerald-50 opacity-90 text-sm">
          Pantau proses produksi sablon Anda secara real-time dari dapur konveksi kami.
        </p>
        <Package size={100} className="absolute -bottom-4 -right-4 text-white opacity-20 transform -rotate-12" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Memuat data pesanan...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center">
          <Package size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">Belum Ada Pesanan Aktif</h3>
          <p className="text-gray-500 text-sm mb-6">Anda belum memiliki pesanan yang sedang diproses.</p>
          <Link href="/dashboard/pelanggan/katalog" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20">
            Mulai Pesan Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const level = getProgressLevel(order.status);
            
            return (
              <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Header Pesanan */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      Pesanan <span className="text-emerald-600">#ORD-{order.id.substring(0,6).toUpperCase()}</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Dibuat pada {new Date(order.waktuDibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-500" />
                    Tujuan: <span className="font-bold truncate max-w-[150px]">{order.alamatPengiriman}</span>
                  </div>
                </div>

                {/* Timeline Progress */}
                <div className="p-6 md:p-10 relative">
                  {/* Garis Latar Belakang */}
                  <div className="absolute top-1/2 left-10 right-10 md:left-20 md:right-20 h-1.5 bg-gray-100 rounded-full -translate-y-1/2 z-0 hidden md:block"></div>
                  
                  {/* Garis Hijau Progress */}
                  <div 
                    className="absolute top-1/2 left-20 h-1.5 bg-emerald-500 rounded-full -translate-y-1/2 z-0 hidden md:block transition-all duration-1000 ease-in-out"
                    style={{ width: `${(level - 1) * 33.33}%` }}
                  ></div>

                  <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                    
                    {/* Step 1: Menunggu */}
                    <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-center w-full md:w-32">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${level >= 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 text-gray-400'}`}>
                        <ClipboardList size={20} />
                      </div>
                      <div className="text-left md:text-center">
                        <p className={`font-bold text-sm ${level >= 1 ? 'text-gray-800' : 'text-gray-400'}`}>Dikonfirmasi</p>
                        <p className="text-[10px] text-gray-500">Desain disetujui</p>
                      </div>
                    </div>

                    {/* Step 2: Produksi */}
                    <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-center w-full md:w-32">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${level >= 2 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 text-gray-400'}`}>
                        <Scissors size={20} />
                      </div>
                      <div className="text-left md:text-center">
                        <p className={`font-bold text-sm ${level >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>Diproduksi</p>
                        <p className="text-[10px] text-gray-500">Proses sablon & jahit</p>
                      </div>
                    </div>

                    {/* Step 3: Pengiriman */}
                    <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-center w-full md:w-32">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${level >= 3 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 text-gray-400'}`}>
                        <Truck size={20} />
                      </div>
                      <div className="text-left md:text-center">
                        <p className={`font-bold text-sm ${level >= 3 ? 'text-gray-800' : 'text-gray-400'}`}>Dikirim</p>
                        <p className="text-[10px] text-gray-500">Dalam perjalanan</p>
                      </div>
                    </div>

                    {/* Step 4: Selesai */}
                    <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3 text-center w-full md:w-32">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${level >= 4 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="text-left md:text-center">
                        <p className={`font-bold text-sm ${level >= 4 ? 'text-gray-800' : 'text-gray-400'}`}>Selesai</p>
                        <p className="text-[10px] text-gray-500">Pesanan Diterima</p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}