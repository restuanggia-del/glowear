'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  LogOut, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag,
  FolderTree,
  Shirt,
  BanknoteArrowUp,
  Users,
  HandCoins,
  Settings,
  Flag,
  MonitorSmartphone
} from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context'; 
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  // Deteksi URL aktif untuk masing-masing grup
  const isOrderActive = pathname.includes('/dashboard/orders') || pathname.includes('/dashboard/payments') || pathname.includes('/dashboard/custom-designs');
  const isCatalogActive = pathname.includes('/dashboard/products') || pathname.includes('/dashboard/categories');
  const isSystemActive = pathname.includes('/dashboard/users') || pathname.includes('/dashboard/settings') || pathname.includes('/dashboard/banners');

  // State Dropdown (Otomatis terbuka jika salah satu sub-menunya sedang aktif)
  const [isOrderOpen, setIsOrderOpen] = useState(isOrderActive);
  const [isCatalogOpen, setIsCatalogOpen] = useState(isCatalogActive);
  const [isSystemOpen, setIsSystemOpen] = useState(isSystemActive);

  // Efek untuk membuka dropdown otomatis jika URL berubah dari luar
  useEffect(() => {
    if (isOrderActive) setIsOrderOpen(true);
    if (isCatalogActive) setIsCatalogOpen(true);
    if (isSystemActive) setIsSystemOpen(true);
  }, [pathname]);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-xl transition-all duration-300">
      {/* Header Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
        <h1 className="text-xl font-bold text-white tracking-wider">
          GLOWEAR<span className="text-blue-500">.</span>
        </h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar">
        
        {/* ================= BAGIAN 1: UTAMA ================= */}
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              pathname === '/dashboard' ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
        </div>

        {/* ================= BAGIAN 2: TRANSAKSI ================= */}
        <div>
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pemesanan</p>
          <button
            onClick={() => setIsOrderOpen(!isOrderOpen)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isOrderActive && !isOrderOpen ? "text-blue-400 font-medium" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className={isOrderActive ? "text-blue-500" : ""} />
              <span className="font-medium">Transaksi</span>
            </div>
            {isOrderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${isOrderOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
            <div className="pl-11 pr-2 space-y-1">
              <Link
                href="/dashboard/orders"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/orders') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <BanknoteArrowUp size={18} /> Pesanan Masuk
              </Link>
              <Link
                href="/dashboard/payments"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/payments') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <HandCoins size={18} /> Verifikasi Bayar
              </Link>
              <Link
                href="/dashboard/custom-designs"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/custom-designs') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Shirt size={18} /> Custom Design
              </Link>
            </div>
          </div>
        </div>

        {/* ================= BAGIAN 3: KATALOG ================= */}
        <div>
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Master Data</p>
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isCatalogActive && !isCatalogOpen ? "text-blue-400 font-medium" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderTree size={20} className={isCatalogActive ? "text-blue-500" : ""} />
              <span className="font-medium">Katalog</span>
            </div>
            {isCatalogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${isCatalogOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
            <div className="pl-11 pr-2 space-y-1">
              <Link
                href="/dashboard/categories"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/categories') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Layers size={18} /> Kategori
              </Link>
              <Link
                href="/dashboard/products"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/products') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Package size={18} /> Produk
              </Link>
            </div>
          </div>
        </div>

        {/* ================= BAGIAN 4: SISTEM & WEB ================= */}
        <div>
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pengaturan</p>
          <button
            onClick={() => setIsSystemOpen(!isSystemOpen)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isSystemActive && !isSystemOpen ? "text-blue-400 font-medium" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <MonitorSmartphone size={20} className={isSystemActive ? "text-blue-500" : ""} />
              <span className="font-medium">Sistem Web</span>
            </div>
            {isSystemOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${isSystemOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
            <div className="pl-11 pr-2 space-y-1">
              <Link
                href="/dashboard/users"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/users') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Users size={18} /> Pengguna
              </Link>
              <Link
                href="/dashboard/banners"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/banners') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Flag size={18} /> Banner Promo
              </Link>
              <Link
                href="/dashboard/settings"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/settings') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Settings size={18} /> Toko & Kontak
              </Link>
            </div>
          </div>
        </div>

      </nav>

      {/* ================= TOMBOL LOGOUT ================= */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}