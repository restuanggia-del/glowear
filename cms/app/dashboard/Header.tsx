"use client";

import { Menu, Bell, Search, LogOut, ChevronRight, Clock, X, Settings, User, Star, ChevronDown } from "lucide-react";
import { useAuth } from "@/app/lib/auth-context";
import { api } from "@/app/services/api";
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
  { label: "Ulasan", path: "/dashboard/reviews", icon: <Star size={18} className="text-gray-500" /> },
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
  const [notifications, setNotifications] = useState<any[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

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

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    fetchNotifications();
    const notifTimer = setInterval(fetchNotifications, 10000); // Polling every 10s

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
      clearInterval(notifTimer);
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

  const formatNotifTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('id-ID')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
    if (pathname?.includes("/reviews")) return "Ulasan Pelanggan";
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

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleNotifRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const closeAll = () => {
    setIsProfileOpen(false);
    setIsNotifOpen(false);
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-4 transition-all duration-300">

        {/* LEFT: Burger + Breadcrumb */}
        <div className="flex items-center gap-3 md:gap-5 min-w-0 flex-shrink-0">
          <button
            onClick={onMenuClick}
            aria-label="Toggle Sidebar"
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden shadow-sm transition-all flex-shrink-0 active:scale-95"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:flex items-center gap-3 text-sm min-w-0 bg-slate-50/50 px-4 py-2 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex-shrink-0">
                ADMINISTRATION
              </span>
            </div>
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
            <span className="text-slate-900 font-black tracking-tight text-sm truncate">
              {getPageTitle()}
            </span>
          </div>

          {/* Mobile: Page title only */}
          <span className="md:hidden text-slate-900 font-black text-sm truncate max-w-[140px]">
            {getPageTitle()}
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">

          {/* Desktop Search */}
          <div className="hidden lg:flex relative w-72 xl:w-96 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              placeholder="Quick search... (Ctrl+K)"
              className="w-full bg-slate-100/50 border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl pl-11 pr-24 py-2.5 text-[13px] outline-none transition-all placeholder:text-slate-400 font-medium"
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60 pointer-events-none">
              <kbd className="bg-white border border-slate-200 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm font-sans">⌘</kbd>
              <kbd className="bg-white border border-slate-200 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm font-sans">K</kbd>
            </div>

            {/* Desktop Search Dropdown */}
            {isSearchOpen && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-0.5">
                  {filteredSuggestions.map((item) => (
                    <button
                      key={item.path}
                      onMouseDown={() => handleSearch(item.path)}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-blue-50 rounded-xl text-left transition-all group"
                    >
                      <div className="w-10 h-10 bg-slate-50 group-hover:bg-white rounded-xl flex items-center justify-center transition-colors border border-transparent group-hover:border-blue-100">
                        {item.icon}
                      </div>
                      <span className="text-[13px] font-bold text-slate-700 group-hover:text-blue-600">{item.label}</span>
                      <ChevronRight size={14} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
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
            className="lg:hidden p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm transition-all active:scale-95"
          >
            <Search size={20} />
          </button>

          {/* Notification Bell */}
          <div className="relative shrink-0">
            <button
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
              className="relative p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 shadow-sm transition-all group active:scale-95"
            >
              <Bell size={20} className="group-hover:animate-bounce transition-transform" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-[400px] bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Bell size={18} className="text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Notifikasi</h3>
                        <p className="text-[11px] text-slate-400 font-medium">Anda memiliki {unreadCount} pesan baru</p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[11px] bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                        Baca Semua
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                    {notifications.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                        <Bell size={40} className="opacity-20 mb-3" />
                        <p className="text-sm font-bold">Tidak ada aktivitas baru</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        let icon = "🔔";
                        let color = "bg-slate-100 text-slate-600";
                        if (notif.tipe === "ORDER") {
                          icon = "📦";
                          color = "bg-blue-50 text-blue-600";
                        } else if (notif.tipe === "PAYMENT") {
                          icon = "💰";
                          color = "bg-emerald-50 text-emerald-600";
                        } else if (notif.tipe === "DESIGN") {
                          icon = "✏️";
                          color = "bg-orange-50 text-orange-600";
                        }

                        return (
                          <button
                            key={notif.id}
                            onClick={() => handleNotifRead(notif.id)}
                            className={`w-full flex gap-4 p-4 text-left rounded-2xl transition-all duration-200 mb-1 ${!notif.dibaca ? "bg-slate-50/80 hover:bg-slate-100" : "hover:bg-slate-50 opacity-70"}`}
                          >
                            <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-xl shadow-sm`}>
                              {icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <p className={`text-[13px] line-clamp-1 ${!notif.dibaca ? "font-black text-slate-900" : "font-bold text-slate-700"}`}>
                                  {notif.judul}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">
                                  {formatNotifTime(notif.waktuDibuat).split(' ')[1]}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{notif.pesan}</p>
                            </div>
                            {!notif.dibaca && (
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2 ring-4 ring-blue-500/10 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="p-4 bg-slate-50/50">
                    <button
                      onClick={() => { setIsNotifOpen(false); router.push("/dashboard/orders"); }}
                      className="w-full bg-white border border-slate-200 text-slate-600 py-2.5 rounded-xl text-xs font-black hover:bg-slate-50 transition-all shadow-sm"
                    >
                      LIHAT SEMUA AKTIVITAS
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Section */}
          <div className="relative shrink-0">
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
              className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group"
            >
              <div className="relative w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[14px] flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition-transform overflow-hidden">
                {/* Subtle Glow behind Initial */}
                <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
                <span className="relative z-10 text-[15px] font-black text-white">
                  {user?.nama?.charAt(0)?.toUpperCase() || "A"}
                </span>
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[13px] font-black text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{user?.nama || "Admin"}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Super Admin</span>
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                  {/* User Profile Header in Dropdown */}
                  <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center shadow-inner">
                        <span className="text-xl font-black text-white">
                          {user?.nama?.charAt(0)?.toUpperCase() || "A"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-white text-base truncate leading-none">{user?.nama || "Admin Glowear"}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">{user?.role || "Administrator"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => { setIsProfileOpen(false); router.push("/dashboard/account"); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-slate-700 hover:bg-blue-50 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Settings size={16} className="text-slate-500 group-hover:text-blue-600" />
                        </div>
                        <span className="text-sm font-bold">Pengaturan Akun</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </button>

                    <div className="h-px bg-slate-50 my-1 mx-2"></div>

                    <button
                      onClick={() => { setIsProfileOpen(false); logout(); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-100/50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                          <LogOut size={16} />
                        </div>
                        <span className="text-sm font-black">Keluar Sistem</span>
                      </div>
                      <ChevronRight size={14} className="text-rose-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
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
