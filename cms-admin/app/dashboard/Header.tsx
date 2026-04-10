"use client";

import { Menu, Bell, Search, User, LogOut, ChevronRight, Package, Receipt, Clock } from "lucide-react";
import { useAuth } from "@/app/lib/auth-context";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState("Selamat datang");
  
  // State untuk Jam Real-time
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Effect untuk Sapaan Otomatis & Detak Jam Real-time
  useEffect(() => {
    // 1. Set sapaan
    const hour = new Date().getHours();
    if (hour < 11) setGreeting("Selamat pagi");
    else if (hour < 15) setGreeting("Selamat siang");
    else if (hour < 18) setGreeting("Selamat sore");
    else setGreeting("Selamat malam");

    // 2. Set waktu pertama kali komponen dimuat (untuk mencegah error Hydration di Next.js)
    setCurrentTime(new Date());

    // 3. Buat interval yang berdetak setiap 1000ms (1 detik)
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Bersihkan interval saat komponen ditutup agar tidak membebani memori
    return () => clearInterval(timer);
  }, []);

  // Fungsi Pemformatan Jam
  const formatTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s} WIB`;
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard Utama';
    if (pathname.includes('/orders')) return 'Pesanan Masuk';
    if (pathname.includes('/payments')) return 'Verifikasi Pembayaran';
    if (pathname.includes('/custom-designs')) return 'Custom Design';
    if (pathname.includes('/reports')) return 'Laporan Keuangan';
    if (pathname.includes('/products')) return 'Katalog Produk';
    if (pathname.includes('/categories')) return 'Kategori Master';
    if (pathname.includes('/users')) return 'Manajemen Pengguna';
    if (pathname.includes('/account')) return 'Pengaturan Akun';
    if (pathname.includes('/pelanggan')) return 'Simulasi Mobile App';
    return 'Dashboard';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-20 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* ================= KIRI: Burger & Breadcrumbs ================= */}
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="relative z-50 p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 lg:hidden shadow-sm active:scale-95 transition-all"
        >
          <Menu size={22} />
        </button>
        
        <div className="hidden lg:flex items-center gap-2 text-sm">
          <span className="text-gray-500 font-bold px-2.5 py-1 bg-gray-100 rounded-md border border-gray-200 uppercase tracking-wider text-[10px]">
            Glomed
          </span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-slate-800 font-bold tracking-wide">{getPageTitle()}</span>
        </div>
      </div>

      {/* ================= TENGAH: Search Bar ================= */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari transaksi, produk, atau pelanggan..." 
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-10 pr-16 py-2.5 text-sm outline-none transition-all shadow-inner placeholder:text-gray-400"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60">
            <kbd className="hidden lg:inline-block bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">Ctrl</kbd>
            <kbd className="hidden lg:inline-block bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">K</kbd>
          </div>
        </div>
      </div>

      {/* ================= KANAN: Jam, Notif & Profil ================= */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* JAM DIGITAL REAL-TIME (Menggantikan Tombol Buat Pesanan) */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-inner text-slate-600 cursor-default">
          <Clock size={16} className="text-blue-500" />
          <span className="text-sm font-bold font-mono tracking-widest w-[100px] text-center">
            {currentTime ? formatTime(currentTime) : "--:--:-- WIB"}
          </span>
        </div>

        <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        {/* Notifikasi */}
        <div className="relative">
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className={`relative p-2.5 rounded-xl transition-all border ${isNotifOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 transform origin-top-right transition-all">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <p className="text-sm font-bold text-gray-800">Notifikasi</p>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">2 Baru</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 flex gap-3 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Receipt size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Struk Pembayaran</p>
                      <p className="text-xs text-gray-500 mt-0.5">Struk baru untuk ORD-A1B2 perlu dicek.</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">5 mnt lalu</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Package size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Pesanan Baru Masuk</p>
                      <p className="text-xs text-gray-500 mt-0.5">24 pcs Hoodie custom menunggu validasi.</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">1 jam lalu</p>
                    </div>
                  </div>
                </div>
                <Link href="/dashboard/orders" onClick={() => setIsNotifOpen(false)} className="block text-center text-xs font-bold text-blue-600 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">Lihat Semua Notifikasi</Link>
              </div>
            </>
          )}
        </div>

        {/* Profil Menu */}
        <div className="relative">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-3 pl-2 pr-1 py-1 bg-white border border-gray-200 rounded-full focus:outline-none hover:shadow-md hover:border-blue-200 transition-all active:scale-95"
          >
            <div className="hidden md:block text-right pl-2">
              <p className="text-[10px] font-bold text-gray-400">{greeting},</p>
              <p className="text-sm font-bold text-slate-800 leading-tight">{user?.nama || "Admin"}</p>
            </div>
            <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white relative shadow-sm">
              {user?.nama?.charAt(0).toUpperCase() || "A"}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                <div className="px-4 py-3 border-b border-gray-50 mb-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Akses Sistem</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.email}</p>
                </div>
                <Link href="/dashboard/account" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <User size={18} /> Pengaturan Akun
                </Link>
                <button onClick={() => { setIsProfileOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1">
                  <LogOut size={18} /> Keluar Aplikasi
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}