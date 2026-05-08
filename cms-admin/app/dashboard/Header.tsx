"use client";

import { Menu, Bell, Search, LogOut, ChevronRight, Clock, X, Settings, User } from "lucide-react";
import { useAuth } from "@/app/lib/auth-context";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LuShoppingBag,
  LuPackage,
  LuUsers,
  LuCreditCard,
  LuLayoutGrid,
  LuImage,
  LuReceiptText,
  LuSettings,
} from "react-icons/lu";

const SEARCH_SUGGESTIONS = [
  { label: "Orders", path: "/dashboard/orders", icon: <LuPackage size={18} className="text-gray-500" /> },
  { label: "Products", path: "/dashboard/products", icon: <LuShoppingBag size={18} className="text-gray-500" /> },
  { label: "Users", path: "/dashboard/users", icon: <LuUsers size={18} className="text-gray-500" /> },
  { label: "Payments", path: "/dashboard/payments", icon: <LuCreditCard size={18} className="text-gray-500" /> },
  { label: "Categories", path: "/dashboard/categories", icon: <LuLayoutGrid size={18} className="text-gray-500" /> },
  { label: "Banners", path: "/dashboard/banners", icon: <LuImage size={18} className="text-gray-500" /> },
  { label: "Reports", path: "/dashboard/reports", icon: <LuReceiptText size={18} className="text-gray-500" /> },
  { label: "Settings", path: "/dashboard/settings", icon: <LuSettings size={18} className="text-gray-500" /> },
];

const NOTIFICATIONS = [
  { id: 1, icon: "📦", color: "bg-blue-100 hover:bg-blue-200", title: "Pesanan #1234 baru masuk", time: "2 menit lalu", read: false },
  { id: 2, icon: "💰", color: "bg-emerald-100 hover:bg-emerald-200", title: "Pembayaran #5678 dikonfirmasi", time: "5 menit lalu", read: false },
  { id: 3, icon: "✏️", color: "bg-orange-100 hover:bg-orange-200", title: "Custom design #9012 perlu review", time: "1 jam lalu", read: false },
];

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("Selamat datang");
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredSuggestions = searchQuery.length > 0
    ? SEARCH_SUGGESTIONS.filter((s) =>
      s.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : SEARCH_SUGGESTIONS;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi,";
    else if (hour < 15) return "Selamat siang,";
    else if (hour < 18) return "Selamat sore,";
    else return "Selamat malam,";
  };

  useEffect(() => {
    setGreeting(getGreeting());
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotifOpen(false);
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const formatTimeStr = (date: Date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard Utama";
    if (pathname?.includes("/orders")) return "Pesanan Masuk";
    if (pathname?.includes("/products")) return "Katalog Produk";
    if (pathname?.includes("/users")) return "Manajemen Pengguna";
    if (pathname?.includes("/payments")) return "Pembayaran";
    if (pathname?.includes("/categories")) return "Kategori";
    if (pathname?.includes("/banners")) return "Banners";
    if (pathname?.includes("/reports")) return "Laporan";
    if (pathname?.includes("/settings")) return "Pengaturan";
    if (pathname?.includes("/account")) return "Akun Saya";
    if (pathname?.includes("/pelanggan")) return "Pelanggan";
    if (pathname?.includes("/portfolio")) return "Portfolio";
    if (pathname?.includes("/custom-designs")) return "Custom Design";
    return "Dashboard";
  };

  const handleSearch = (path: string) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(path);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const closeAll = () => {
    setIsProfileOpen(false);
    setIsNotifOpen(false);
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-gray-200 h-16 md:h-20 px-3 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-2">

        {/* LEFT: Burger + Breadcrumb */}
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink-0">
          <button
            onClick={onMenuClick}
            aria-label="Toggle Sidebar"
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden shadow-sm transition-all flex-shrink-0"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:flex items-center gap-2 text-sm min-w-0">
            <span className="text-slate-600 font-bold px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 uppercase tracking-widest text-[10px] flex-shrink-0">
              GLOMED
            </span>
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-800 font-black tracking-wide text-sm truncate">
              {getPageTitle()}
            </span>
          </div>

          {/* Mobile: Page title only */}
          <span className="md:hidden text-slate-800 font-bold text-sm truncate max-w-[120px]">
            {getPageTitle()}
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1.5 md:gap-3 lg:gap-4 flex-shrink-0">

          {/* Desktop Search */}
          <div className="hidden lg:flex relative w-64 xl:w-80 group">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              placeholder="Cari halaman... (Ctrl+K)"
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-9 pr-20 py-2 text-sm outline-none transition-all placeholder:text-slate-400"
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
              <kbd className="bg-white border border-slate-200 text-slate-400 text-[9px] font-bold px-1 py-0.5 rounded shadow-sm">Ctrl</kbd>
              <kbd className="bg-white border border-slate-200 text-slate-400 text-[9px] font-bold px-1 py-0.5 rounded shadow-sm">K</kbd>
            </div>

            {/* Desktop Search Dropdown */}
            {isSearchOpen && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                <div className="py-1">
                  {filteredSuggestions.map((item) => (
                    <button
                      key={item.path}
                      onMouseDown={() => handleSearch(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors"
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle */}
          <button
            aria-label="Buka Pencarian"
            onClick={() => { setIsSearchOpen(true); closeAll(); }}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Search size={18} />
          </button>

          {/* Live Clock — hidden on small screens */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-600 cursor-default shrink-0 shadow-sm">
            <Clock size={16} className="text-blue-500 animate-pulse" />
            <div className="flex flex-col leading-none text-center">
              <span className="text-xs font-black font-mono tracking-widest text-slate-700">
                {currentTime ? formatTimeStr(currentTime) : "--:--:--"}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">WIB</span>
            </div>
          </div>

          {/* Separator */}
          <div className="h-7 w-px bg-slate-200 hidden sm:block shrink-0" />

          {/* Notification Bell */}
          <div className="relative shrink-0">
            <button
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
              aria-label={`Notifikasi, ${unreadCount} belum dibaca`}
              className="relative p-2 rounded-xl border bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm transition-all group"
            >
              <Bell size={18} className="group-hover:rotate-12 transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
              )}
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                  style={{ animation: "dropIn 0.15s ease-out" }}>
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-blue-500" />
                      <h3 className="text-sm font-bold text-slate-800">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[11px] text-blue-500 hover:text-blue-700 font-semibold transition-colors">
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotifRead(notif.id)}
                        className={`w-full flex gap-3 p-3.5 text-left hover:bg-slate-50 transition-colors ${!notif.read ? "bg-blue-50/30" : ""}`}
                      >
                        <div className={`flex-shrink-0 w-9 h-9 ${notif.color} rounded-xl flex items-center justify-center transition-colors`}>
                          <span className="text-base">{notif.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm line-clamp-1 ${!notif.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-100">
                    <button
                      onClick={() => { setIsNotifOpen(false); router.push("/dashboard/orders"); }}
                      className="w-full text-center text-xs font-semibold text-blue-500 hover:text-blue-700 py-1 transition-colors"
                    >
                      Lihat semua aktivitas →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile */}
          <div className="relative shrink-0">
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              aria-label="Menu Profil"
              className="flex items-center gap-2 p-1.5 rounded-full bg-white border-2 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div className="hidden sm:flex flex-col text-right items-end mr-0.5">
                <span className="text-[10px] font-semibold text-slate-400 leading-tight">{greeting}</span>
                <span className="text-xs font-black text-slate-900 leading-tight max-w-[80px] truncate">{user?.nama || "Admin"}</span>
              </div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-md border-2 border-white group-hover:scale-105 transition-transform">
                <span className="text-sm font-black text-white">
                  {user?.nama?.charAt(0)?.toUpperCase() || "A"}
                </span>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                  style={{ animation: "dropIn 0.15s ease-out" }}>
                  {/* User Info */}
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-base font-black text-white">
                          {user?.nama?.charAt(0)?.toUpperCase() || "A"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{user?.nama || "Admin Glowear"}</p>
                        <p className="text-xs text-slate-400 font-medium">{user?.role || "Administrator"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <a
                      href="/dashboard/account"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
                    >
                      <Settings size={16} className="text-slate-400" />
                      Pengaturan Akun
                    </a>
                    <button
                      onClick={() => { setIsProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Keluar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===== MOBILE SEARCH OVERLAY ===== */}
      {isSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex flex-col" style={{ animation: "fadeIn 0.15s ease-out" }}>
          <div className="bg-white px-4 py-3 shadow-xl">
            <div className="flex items-center gap-3">
              <Search size={18} className="text-blue-500 flex-shrink-0" />
              <input
                ref={mobileSearchRef}
                type="text"
                value={searchQuery}
                placeholder="Cari orders, products, users..."
                className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="bg-white mt-px shadow-md overflow-y-auto max-h-[60vh]">
            <p className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {searchQuery ? "Hasil Pencarian" : "Semua Halaman"}
            </p>
            {filteredSuggestions.map((item) => (
              <button
                key={item.path}
                onClick={() => handleSearch(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors border-b border-slate-50 last:border-0"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                <ChevronRight size={14} className="text-slate-300 ml-auto" />
              </button>
            ))}
            {filteredSuggestions.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
            )}
          </div>
          <div className="flex-1" onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} />
        </div>
      )}

      {/* ===== GLOBAL ANIMATIONS ===== */}
      <style jsx global>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
