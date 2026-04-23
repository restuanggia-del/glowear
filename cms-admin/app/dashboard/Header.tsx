"use client";

import { Menu, Bell, Search, LogOut, ChevronRight, Clock } from "lucide-react";
import { useAuth } from "@/app/lib/auth-context";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [greeting, setGreeting] = useState("Selamat datang");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  
  // Referensi untuk input pencarian (Ctrl+K)
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set Sapaan
    const hour = new Date().getHours();
    if (hour < 11) setGreeting("Selamat pagi,");
    else if (hour < 15) setGreeting("Selamat siang,");
    else if (hour < 18) setGreeting("Selamat sore,");
    else setGreeting("Selamat malam,");

    // Set Jam Real-time
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Event Listener untuk Shortcut Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus(); 
      }
      // Tambahan: Tekan ESC untuk menutup menu
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatTimeStr = (date: Date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getPageTitle = () => {
    // Gunakan tanda tanya (?) untuk mencegah error saat pathname belum siap
    if (pathname === '/dashboard') return 'Dashboard Utama';
    if (pathname?.includes('/orders')) return 'Pesanan Masuk';
    if (pathname?.includes('/products')) return 'Katalog Produk';
    if (pathname?.includes('/users')) return 'Manajemen Pengguna';
    return 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-20 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* ================= KIRI: Burger & Breadcrumbs ================= */}
      <div className="flex items-center gap-3 md:gap-4">
        <button onClick={onMenuClick} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden shadow-sm transition-all">
          <Menu size={22} />
        </button>
        
        <div className="hidden md:flex items-center gap-3 text-sm">
          <span className="text-slate-600 font-bold px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 uppercase tracking-widest text-[10px]">
            GLOMED
          </span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-slate-800 font-black tracking-wide text-[15px]">{getPageTitle()}</span>
        </div>
      </div>

      {/* ================= TENGAH & KANAN ================= */}
      <div className="flex flex-1 items-center justify-end gap-4 lg:gap-6 ml-4">
        
        {/* Global Search - Functional */}
        <div className="hidden lg:flex relative w-full max-w-md group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
<input 
            ref={searchInputRef}
            type="text" 
            placeholder="Cari orders, produk, users (Ctrl+K)..." 
            className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 cursor-default">
            <kbd className="bg-white border border-slate-200 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">Ctrl</kbd>
            <kbd className="bg-white border border-slate-200 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">K</kbd>
          </div>

        </div>

        {/* Jam Digital */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 cursor-default shrink-0 shadow-sm">
          <Clock size={18} className="text-blue-500" />
          <div className="flex flex-col text-center">
            <span className="text-sm font-black font-mono tracking-widest leading-none text-slate-700">
              {currentTime ? formatTimeStr(currentTime) : "--:--:--"}
            </span>
            <span className="text-[10px] font-black text-slate-500 mt-1 leading-none uppercase">WIB</span>
          </div>
        </div>

        {/* Garis Pemisah */}
        <div className="h-8 w-px bg-slate-200 hidden sm:block shrink-0"></div>

        {/* Notifications - Real Data */}
        <div className="relative shrink-0">
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="relative p-2.5 rounded-xl border bg-white border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Bell size={20} />
<span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
              <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 max-h-96 overflow-auto z-50">
                <div className="px-4 py-3 border-b border-slate-100 sticky top-0 bg-white">
          <h3 className="text-sm font-bold text-slate-800">Notifikasi</h3>
                </div>
                <div className="p-8 text-center">
                  <Bell className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                  <p className="text-sm text-slate-500">Notifikasi akan muncul di sini (pending orders)</p>
                </div>
                  <h3 className="text-sm font-bold text-slate-800">Notifikasi ({notifications.length})</h3>
                </div>
<div className="p-8 text-center">
                    <Bell className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                    <p className="text-sm text-slate-500">Notifikasi akan muncul di sini</p>
                  </div>
              </div>
            </>
          )}
        </div>

        {/* Profil Wrapper */}
        <div className="relative shrink-0">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-3 pl-4 pr-1.5 py-1.5 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all active:scale-95"
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-500 leading-none">{greeting}</span>
              <span className="text-[13px] font-black text-slate-800 leading-none mt-1">{user?.nama || "admin"}</span>
            </div>
            <div className="w-9 h-9 bg-[#0f172a] text-white rounded-full flex items-center justify-center font-bold text-sm relative shadow-sm border-2 border-white">
              {user?.nama?.charAt(0).toUpperCase() || "A"}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
          </button>

          {/* Isi Dropdown Profil */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
              {/* Tambahkan top-full agar tidak menutupi tombol */}
              <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-50 mb-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Akses Sistem</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.email}</p>
                </div>
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