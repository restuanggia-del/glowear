'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, LogOut, Layers, ChevronDown, ChevronUp, 
  ShoppingBag, FolderTree, Shirt, BanknoteArrowUp, Users, HandCoins, 
  Settings, Flag, MonitorSmartphone, ChartCandlestick, SquareLibrary,
  Smartphone, Store, Palette, Clock4, Truck, UserCircle, X
} from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context'; 
import { useState, useEffect } from 'react';

// Tambahkan Props untuk menerima state dari Layout
export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const isOrderActive = pathname.includes('/dashboard/orders') || pathname.includes('/dashboard/payments') || pathname.includes('/dashboard/custom-designs') || pathname.includes('/dashboard/reports');
  const isCatalogActive = pathname.includes('/dashboard/products') || pathname.includes('/dashboard/categories');
  const isSystemActive = pathname.includes('/dashboard/users') || pathname.includes('/dashboard/settings') || pathname.includes('/dashboard/banners') || pathname.includes('/dashboard/portfolio');
  const isPelangganActive = pathname.includes('/dashboard/pelanggan');

  const [isOrderOpen, setIsOrderOpen] = useState(isOrderActive);
  const [isCatalogOpen, setIsCatalogOpen] = useState(isCatalogActive);
  const [isSystemOpen, setIsSystemOpen] = useState(isSystemActive);
  const [isPelangganOpen, setIsPelangganOpen] = useState(isPelangganActive || true);

  useEffect(() => {
    if (isOrderActive) setIsOrderOpen(true);
    if (isCatalogActive) setIsCatalogOpen(true);
    if (isSystemActive) setIsSystemOpen(true);
    if (isPelangganActive) setIsPelangganOpen(true);
  }, [pathname]);

  // Fungsi untuk menutup sidebar di mobile saat menu diklik
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      {/* Overlay Background Hitam untuk Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container Utama */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Header Logo Glomed Konveksi & Glowear */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800 bg-slate-950 shrink-0 relative overflow-hidden">
          {/* Aksen Warna */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl font-black text-white tracking-wider flex items-center gap-1">
              GLO<span className="text-blue-500">WEAR.</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
              By <span className="text-slate-200">Glomed Konveksi</span>
            </p>
          </div>

          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- SISA KODE MENU ANDA TETAP SAMA PERSIS DI BAWAH INI --- */}
        <nav className="flex-1 py-6 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* ================= BLOK 1: AREA ADMIN ================= */}
          <div className="space-y-6">
            <div>
              <p className="px-4 text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">🛠️ Area Admin</p>
              <Link href="/dashboard" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === '/dashboard' ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"}`}>
                <LayoutDashboard size={20} /> <span className="font-medium">Dashboard</span>
              </Link>
            </div>

            {/* Transaksi */}
            <div>
              <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pemesanan</p>
              <button onClick={() => setIsOrderOpen(!isOrderOpen)} className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isOrderActive && !isOrderOpen ? "text-blue-400 font-medium" : "hover:bg-slate-800 hover:text-white"}`}>
                <div className="flex items-center gap-3"><ShoppingBag size={20} className={isOrderActive ? "text-blue-500" : ""} /><span className="font-medium">Transaksi</span></div>
                {isOrderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isOrderOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="pl-11 pr-2 space-y-1">
                  <Link href="/dashboard/orders" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/orders') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><BanknoteArrowUp size={18} /> Pesanan Masuk</Link>
                  <Link href="/dashboard/payments" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/payments') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><HandCoins size={18} /> Verifikasi Bayar</Link>
                  <Link href="/dashboard/custom-designs" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/custom-designs') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Shirt size={18} /> Custom Design</Link>
                  <Link href="/dashboard/reports" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/reports') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><SquareLibrary size={18} /> Laporan</Link>
                </div>
              </div>
            </div>

            {/* Katalog */}
            <div>
              <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Master Data</p>
              <button onClick={() => setIsCatalogOpen(!isCatalogOpen)} className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isCatalogActive && !isCatalogOpen ? "text-blue-400 font-medium" : "hover:bg-slate-800 hover:text-white"}`}>
                <div className="flex items-center gap-3"><FolderTree size={20} className={isCatalogActive ? "text-blue-500" : ""} /><span className="font-medium">Katalog</span></div>
                {isCatalogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isCatalogOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="pl-11 pr-2 space-y-1">
                  <Link href="/dashboard/categories" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/categories') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Layers size={18} /> Kategori</Link>
                  <Link href="/dashboard/products" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/products') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Package size={18} /> Produk</Link>
                </div>
              </div>
            </div>

            {/* Sistem Web */}
            <div>
              <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pengaturan</p>
              <button onClick={() => setIsSystemOpen(!isSystemOpen)} className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isSystemActive && !isSystemOpen ? "text-blue-400 font-medium" : "hover:bg-slate-800 hover:text-white"}`}>
                <div className="flex items-center gap-3"><MonitorSmartphone size={20} className={isSystemActive ? "text-blue-500" : ""} /><span className="font-medium">Sistem Web</span></div>
                {isSystemOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${isSystemOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="pl-11 pr-2 space-y-1">
                  <Link href="/dashboard/users" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/users') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Users size={18} /> Pengguna</Link>
                  <Link href="/dashboard/banners" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/banners') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Flag size={18} /> Banner Promo</Link>
                  <Link href="/dashboard/portfolio" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/portfolio') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><ChartCandlestick size={18} /> Portofolio</Link>
                  <Link href="/dashboard/settings" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/settings') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Settings size={18} /> Toko & Kontak</Link>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BLOK 2: SIMULASI PELANGGAN ================= */}
          <div className="pt-6 border-t border-slate-700/50">
            <p className="px-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">📱 Simulasi Mobile App</p>
            <div className="bg-slate-800/30 rounded-xl p-2 border border-slate-700/50 space-y-1">
              <Link href="/dashboard/pelanggan/beranda" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/beranda' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}><Smartphone size={18} /> Beranda App</Link>
              <Link href="/dashboard/pelanggan/katalog" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/katalog' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}><Store size={18} /> Pilih Baju Polos</Link>
              <Link href="/dashboard/pelanggan/pesan" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/pesan' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}><Palette size={18} /> Studio Custom</Link>
              <Link href="/dashboard/pelanggan/tagihan" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/tagihan' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}><Clock4 size={18} /> Tagihan & Struk</Link>
              <Link href="/dashboard/pelanggan/lacak" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/lacak' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}><Truck size={18} /> Lacak Pesanan</Link>
              <Link href="/dashboard/pelanggan/profil" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/profil' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}><UserCircle size={18} /> Profil & Alamat</Link>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}