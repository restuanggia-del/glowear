'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, LogOut, Layers, ChevronDown, ChevronUp, 
  ShoppingBag, FolderTree, Shirt, BanknoteArrowUp, Users, HandCoins, 
  Settings, Flag, MonitorSmartphone, ChartCandlestick, SquareLibrary,
  Smartphone, Store, Palette, Clock4, Truck, UserCircle, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context'; 
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  const [isMinimized, setIsMinimized] = useState(false);
  
  const isOrderActive = pathname.includes('/dashboard/orders') || pathname.includes('/dashboard/payments') || pathname.includes('/dashboard/custom-designs') || pathname.includes('/dashboard/reports');
  const isCatalogActive = pathname.includes('/dashboard/products') || pathname.includes('/dashboard/categories');
  const isSystemActive = pathname.includes('/dashboard/users') || pathname.includes('/dashboard/settings') || pathname.includes('/dashboard/banners') || pathname.includes('/dashboard/portfolio');
  const isPelangganActive = pathname.includes('/dashboard/pelanggan');

  const [isOrderOpen, setIsOrderOpen] = useState(isOrderActive);
  const [isCatalogOpen, setIsCatalogOpen] = useState(isCatalogActive);
  const [isSystemOpen, setIsSystemOpen] = useState(isSystemActive);

  useEffect(() => {
    if (isOrderActive) setIsOrderOpen(true);
    if (isCatalogActive) setIsCatalogOpen(true);
    if (isSystemActive) setIsSystemOpen(true);
  }, [pathname]);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const handleDropdownClick = (setState: (val: boolean) => void, currentState: boolean) => {
    if (isMinimized) {
      setIsMinimized(false);
      setState(true);
    } else {
      setState(!currentState);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#0B1120] text-slate-300 flex flex-col shadow-2xl transition-all duration-300 ease-in-out border-r border-slate-800
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isMinimized ? "w-24" : "w-72"} 
      `}>
        
        {/* Tombol Minimize (Tepat di garis batas) */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="hidden lg:flex absolute -right-3.5 top-8 bg-slate-800 border-2 border-slate-900 text-slate-300 hover:text-white rounded-full p-1 z-50 shadow-md transition-all hover:scale-110"
        >
          {isMinimized ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Header Logo Glomed & Glowear */}
        <div className={`flex items-center h-20 bg-[#0B1120] shrink-0 relative transition-all duration-300 border-b border-slate-800 ${isMinimized ? 'justify-center px-0' : 'px-5'}`}>
          
          {!isMinimized && (
            <div className="flex items-center justify-between w-full pr-8 lg:pr-0">
              <div className="flex flex-col">
                <h1 className="text-[22px] font-black text-white tracking-widest flex items-center gap-1">
                  GLO<span className="text-blue-500">WEAR.</span>
                </h1>
                <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
                  By Glomed Konveksi
                </p>
              </div>
              {/* Logo Glomed */}
              <div className="relative w-8 h-8 shrink-0">
                <Image src="/logoglomed.png" alt="Glomed Logo" fill className="object-contain" priority />
              </div>
            </div>
          )}

          {isMinimized && (
            <div className="relative w-10 h-10 shrink-0 animate-fade-in">
              <Image src="/logoglomed.png" alt="Glomed Logo" fill className="object-contain" priority />
            </div>
          )}

          {/* Tombol Tutup Mobile */}
          <button onClick={() => setIsOpen(false)} className="p-2.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white lg:hidden absolute right-3">
            <X size={20} />
          </button>
        </div>

        {/* ================= AREA MENU (Sama seperti sebelumnya) ================= */}
        <nav className={`flex-1 py-6 space-y-6 overflow-y-auto custom-scrollbar ${isMinimized ? 'px-3' : 'px-4'}`}>
          {/* ... BLOK 1: AREA ADMIN ... */}
          <div className="space-y-4">
            {isMinimized ? <div className="w-full flex justify-center mb-4"><div className="w-6 h-px bg-slate-700"></div></div> : <p className="px-4 text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">🛠️ Area Admin</p>}
            <Link href="/dashboard" onClick={handleLinkClick} title="Dashboard" className={`flex items-center ${isMinimized ? 'justify-center p-3.5' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-200 ${pathname === '/dashboard' ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" : "hover:bg-slate-800 hover:text-white"}`}>
              <LayoutDashboard size={20} /> {!isMinimized && <span className="font-medium whitespace-nowrap">Dashboard</span>}
            </Link>

            {/* Transaksi */}
            <div>
              {!isMinimized && <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Pemesanan</p>}
              <button title="Pemesanan" onClick={() => handleDropdownClick(setIsOrderOpen, isOrderOpen)} className={`w-full flex items-center ${isMinimized ? 'justify-center p-3.5' : 'justify-between gap-3 px-4 py-3'} rounded-xl transition-all duration-200 ${isOrderActive && !isOrderOpen ? "text-blue-400 font-medium" : "hover:bg-slate-800 hover:text-white"}`}>
                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'}`}><ShoppingBag size={20} className={isOrderActive ? "text-blue-500" : ""} />{!isMinimized && <span className="font-medium whitespace-nowrap">Transaksi</span>}</div>
                {!isMinimized && (isOrderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${!isMinimized && isOrderOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
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
              {!isMinimized && <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Master Data</p>}
              <button title="Katalog" onClick={() => handleDropdownClick(setIsCatalogOpen, isCatalogOpen)} className={`w-full flex items-center ${isMinimized ? 'justify-center p-3.5' : 'justify-between gap-3 px-4 py-3'} rounded-xl transition-all duration-200 ${isCatalogActive && !isCatalogOpen ? "text-blue-400 font-medium" : "hover:bg-slate-800 hover:text-white"}`}>
                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'}`}><FolderTree size={20} className={isCatalogActive ? "text-blue-500" : ""} />{!isMinimized && <span className="font-medium whitespace-nowrap">Katalog</span>}</div>
                {!isMinimized && (isCatalogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${!isMinimized && isCatalogOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="pl-11 pr-2 space-y-1">
                  <Link href="/dashboard/categories" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/categories') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Layers size={18} /> Kategori</Link>
                  <Link href="/dashboard/products" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/products') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Package size={18} /> Produk</Link>
                </div>
              </div>
            </div>

            {/* Sistem Web */}
            <div>
              {!isMinimized && <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Pengaturan</p>}
              <button title="Sistem Web" onClick={() => handleDropdownClick(setIsSystemOpen, isSystemOpen)} className={`w-full flex items-center ${isMinimized ? 'justify-center p-3.5' : 'justify-between gap-3 px-4 py-3'} rounded-xl transition-all duration-200 ${isSystemActive && !isSystemOpen ? "text-blue-400 font-medium" : "hover:bg-slate-800 hover:text-white"}`}>
                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'}`}><MonitorSmartphone size={20} className={isSystemActive ? "text-blue-500" : ""} />{!isMinimized && <span className="font-medium whitespace-nowrap">Sistem Web</span>}</div>
                {!isMinimized && (isSystemOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${!isMinimized && isSystemOpen ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                <div className="pl-11 pr-2 space-y-1">
                  <Link href="/dashboard/users" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/users') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Users size={18} /> Pengguna</Link>
                  <Link href="/dashboard/settings" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${pathname.includes('/dashboard/settings') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"}`}><Settings size={18} /> Toko & Kontak</Link>
                </div>
              </div>
            </div>
          </div>

          {/* BLOK 2: SIMULASI PELANGGAN */}
          <div className="pt-6 border-t border-slate-700/50 mt-8">
            {isMinimized ? (
              <div className="w-full flex justify-center mb-4"><div className="w-6 h-px bg-slate-700"></div></div>
            ) : (
              <p className="px-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2 whitespace-nowrap">📱 Simulasi Mobile App</p>
            )}
            
            <div className={`bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-1 ${isMinimized ? 'p-1.5' : 'p-2'}`}>
              <Link href="/dashboard/pelanggan/beranda" title="Beranda App" onClick={handleLinkClick} className={`flex items-center ${isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/beranda' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}>
                <Smartphone size={isMinimized ? 20 : 18} /> {!isMinimized && <span className="whitespace-nowrap">Beranda App</span>}
              </Link>
              <Link href="/dashboard/pelanggan/katalog" title="Katalog App" onClick={handleLinkClick} className={`flex items-center ${isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/katalog' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}>
                <Store size={isMinimized ? 20 : 18} /> {!isMinimized && <span className="whitespace-nowrap">Pilih Baju Polos</span>}
              </Link>
              <Link href="/dashboard/pelanggan/pesan" title="Studio Custom" onClick={handleLinkClick} className={`flex items-center ${isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/pesan' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}>
                <Palette size={isMinimized ? 20 : 18} /> {!isMinimized && <span className="whitespace-nowrap">Studio Custom</span>}
              </Link>
              <Link href="/dashboard/pelanggan/tagihan" title="Tagihan" onClick={handleLinkClick} className={`flex items-center ${isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/tagihan' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}>
                <Clock4 size={isMinimized ? 20 : 18} /> {!isMinimized && <span className="whitespace-nowrap">Tagihan & Struk</span>}
              </Link>
              <Link href="/dashboard/pelanggan/lacak" title="Lacak Pesanan" onClick={handleLinkClick} className={`flex items-center ${isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 ${pathname === '/dashboard/pelanggan/lacak' ? "bg-emerald-600/20 text-emerald-400 font-bold" : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"}`}>
                <Truck size={isMinimized ? 20 : 18} /> {!isMinimized && <span className="whitespace-nowrap">Lacak Pesanan</span>}
              </Link>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}