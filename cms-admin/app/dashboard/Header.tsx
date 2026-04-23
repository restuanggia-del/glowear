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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi,";
    else if (hour < 15) return "Selamat siang,";
    else if (hour < 18) return "Selamat sore,";
    else return "Selamat malam,";
  };

  useEffect(() => {
    setGreeting(getGreeting());

    // Set Jam Real-time
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Event Listener untuk Shortcut Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus(); 
      }
      // ESC to close menus
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
    if (pathname === '/dashboard') return 'Dashboard Utama';
    if (pathname?.includes('/orders')) return 'Pesanan Masuk';
    if (pathname?.includes('/products')) return 'Katalog Produk';
    if (pathname?.includes('/users')) return 'Manajemen Pengguna';
    return 'Dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200 h-20 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* Left: Burger & Breadcrumbs */}
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

      {/* Right: Search, Time, Notifications, Profile */}
      <div className="flex flex-1 items-center justify-end gap-4 lg:gap-6 ml-4">
        
        {/* Search Bar */}
        <div className="hidden lg:flex relative w-full max-w-md group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Cari orders, produk, users (Ctrl+K)..." 
            className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400"
            onChange={(e) => {
              if (e.target.value === 'orders') window.location.href = '/dashboard/orders';
              if (e.target.value === 'products') window.location.href = '/dashboard/products';
              if (e.target.value === 'users') window.location.href = '/dashboard/users';
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 cursor-default pointer-events-none">
            <kbd className="bg-white border border-slate-200 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">Ctrl</kbd>
            <kbd className="bg-white border border-slate-200 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">K</kbd>
          </div>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 cursor-default shrink-0 shadow-sm">
          <Clock size={18} className="text-blue-500 animate-pulse" />
          <div className="flex flex-col text-center leading-none">
            <span className="text-sm font-black font-mono tracking-widest text-slate-700">
              {currentTime ? formatTimeStr(currentTime) : "--:--:--"}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">WIB</span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-slate-200 hidden sm:block shrink-0"></div>

        {/* Notification Bell */}
        <div className="relative shrink-0">
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="relative p-2.5 rounded-xl border bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm transition-all group"
            title="Notifikasi (3 baru)"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-96 overflow-auto z-50 animate-in fade-in zoom-in-95">
                <div className="px-5 py-3 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Bell size={18} className="text-blue-500" />
                    Notifikasi
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">3 aktivitas baru</p>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="p-4 hover:bg-slate-50 group/item">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover/item:bg-blue-200 transition-colors">
                        <span className="text-lg font-bold">📦</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">Pesanan #1234 baru masuk</p>
                        <p className="text-xs text-slate-500 mt-0.5">2 menit yang lalu</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 group/item">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover/item:bg-emerald-200 transition-colors">
                        <span className="text-lg font-bold">💰</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">Pembayaran #5678 dikonfirmasi</p>
                        <p className="text-xs text-slate-500 mt-0.5">5 menit yang lalu</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 group/item">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover/item:bg-orange-200 transition-colors">
                        <span className="text-lg font-bold">✏️</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">Custom design #9012 perlu review</p>
                        <p className="text-xs text-slate-500 mt-0.5">1 jam yang lalu</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative shrink-0">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-3 p-2 rounded-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 group hover:scale-[1.02]"
          >
            <div className="hidden sm:flex flex-col text-right items-end">
              <span className="text-[10px] font-bold text-slate-500 leading-tight">{greeting}</span>
              <span className="text-sm font-black text-slate-900 leading-tight">{user?.nama || "Admin"}</span>
            </div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-105 transition-all">
              <span className="text-lg font-black text-white drop-shadow-sm">
                {user?.nama?.charAt(0)?.toUpperCase() || "A"}
              </span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-3 border-white rounded-full shadow-md animate-pulse"></div>
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
                      <span className="text-xl font-black text-white">{user?.nama?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{user?.nama || "Admin Glowear"}</p>
                      <p className="text-xs text-slate-500 font-medium">{user?.role || "Administrator"}</p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <a href="/dashboard/account" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Pengaturan Akun
                  </a>
                  <button 
                    onClick={() => { setIsProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                  >
                    <LogOut size={20} />
                    Keluar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
