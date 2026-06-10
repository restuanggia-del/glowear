"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import Link from "next/link";
import { Store, Palette, Truck, Clock4, ChevronRight, Sparkles } from "lucide-react";

export default function BerandaPelangganPage() {
  const { user } = useAuth();
  const [banners, setBanners] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mengambil data Banner dan Portofolio secara bersamaan
        const [resBanners, resPortfolio] = await Promise.all([
          fetch("http://localhost:3001/banners"),
          fetch("http://localhost:3001/portfolio")
        ]);

        if (resBanners.ok) setBanners(await resBanners.json());
        if (resPortfolio.ok) setPortfolio(await resPortfolio.json());
      } catch (error) {
        console.error("Gagal mengambil data beranda");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="font-sans max-w-5xl mx-auto pb-20 space-y-10">
      
      {/* Header Greeting */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 mb-1">Selamat datang kembali,</p>
          <h1 className="text-2xl font-black text-gray-800">{user?.nama || "Pelanggan"} 👋</h1>
        </div>
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-md">
          {user?.nama?.charAt(0).toUpperCase() || "P"}
        </div>
      </div>

      {/* 1. Slider Banner Promo */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-lg bg-gray-100 aspect-[21/9] sm:aspect-[3/1]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : banners.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar h-full">
            {banners.map((banner) => (
              <div key={banner.id} className="min-w-full h-full snap-center relative group cursor-pointer">
                <img 
                  src={`http://localhost:3001/uploads/banners/${banner.gambar}`} 
                  alt={banner.judul}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/1200x400/10b981/ffffff?text=Promo+Glowear" }}
                />
                {/* Gradient overlay agar teks (jika ada) terbaca */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <h3 className="text-white font-bold text-lg">{banner.judul}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white p-8 text-center">
            <div>
              <Sparkles className="mx-auto mb-3 opacity-50" size={32} />
              <h2 className="text-2xl font-bold mb-1">Diskon Spesial Sablon 20%</h2>
              <p className="text-emerald-100 text-sm">Berlaku untuk pemesanan di atas 50 pcs bulan ini.</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Menu Cepat (Quick Actions) */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Menu Utama</h2>
        <div className="grid grid-cols-4 gap-4 sm:gap-6">
          <Link href="/dashboard/pelanggan/katalog" className="group flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
              <Store size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-600">Katalog</span>
          </Link>

          <Link href="/dashboard/pelanggan/pesan" className="group flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
              <Palette size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-600">Custom</span>
          </Link>

          <Link href="/dashboard/pelanggan/tagihan" className="group flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
              <Clock4 size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-600">Tagihan</span>
          </Link>

          <Link href="/dashboard/pelanggan/lacak" className="group flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
              <Truck size={24} />
            </div>
            <span className="text-xs font-semibold text-gray-600">Lacak</span>
          </Link>
        </div>
      </div>

      {/* 3. Galeri Portofolio / Inspirasi */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Inspirasi Sablon</h2>
            <p className="text-xs text-gray-500">Hasil pengerjaan terbaik dari Glowear</p>
          </div>
          <button className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline">
            Lihat Semua <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-100 aspect-square rounded-2xl animate-pulse"></div>)}
          </div>
        ) : portfolio.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {portfolio.slice(0, 8).map((item) => (
              <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img 
                    src={`http://localhost:3001/uploads/portfolio/${item.gambar}`} 
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400/f8fafc/94a3b8?text=Portofolio" }}
                  />
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                    {item.kategori}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{item.judul}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-10 rounded-3xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-500 text-sm">Belum ada portofolio yang diunggah.</p>
          </div>
        )}
      </div>

    </div>
  );
}