'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, LogOut, Layers, ChevronDown, ChevronUp, 
  ShoppingBag, FolderTree, Shirt, BanknoteArrowUp, Users, HandCoins, 
  Settings, Flag, MonitorSmartphone, ChartCandlestick, SquareLibrary,
  Smartphone, Store, Palette, Clock4, Truck, UserCircle, X,
  ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context'; 
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  // State untuk Minimize Sidebar (Desktop)
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

  // Fungsi menutup di mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  // Fungsi cerdas: Jika klik dropdown saat minimize, otomatis buka sidebar
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
      {/* Overlay Background Hitam untuk Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container Utama */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#0f172a] text-slate-300 flex flex-col shadow-2xl transition-all duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isMinimized ? "w-24" : "w-[290px]"} 
      `}>
        
        {/* Tombol Minimize (Hanya Desktop) */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="hidden lg:flex absolute -right-3 top-7 bg-[#1e293b] border border-slate-700 text-slate-400 hover:text-white rounded-full p-1.5 z-50 shadow-lg transition-all hover:scale-110 active:scale-90"
        >
          {isMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Header Logo Area */}
        <div className={`flex items-center ${isMinimized ? 'justify-center px-0' : 'justify-between px-7'} h-24 shrink-0 relative overflow-hidden transition-all duration-300`}>
          {/* Aksen Gradasi Premium */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[80px] -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-[60px] -ml-5 -mb-5"></div>
          
          {isMinimized ? (
            <div className="relative z-10 w-11 h-11 flex items-center justify-center p-2 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
              <Image src="/logoglomed.png" alt="Glomed" width={40} height={40} className="object-contain" priority />
            </div>
          ) : (
            <div className="relative z-10 flex items-center justify-between w-full animate-in fade-in slide-in-from-left-2 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 relative bg-white/10 rounded-2xl p-2 border border-white/10 flex items-center justify-center">
                  <Image src="/logoglomed.png" alt="Glomed Logo" fill className="object-contain p-2" priority />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1 leading-none">
                    GLO<span className="text-blue-500">WEAR</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1">
                    ADMIN PANEL
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tombol Tutup Mobile */}
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white lg:hidden absolute right-4">
            <X size={20} />
          </button>
        </div>

        {/* ================= AREA MENU ================= */}
        <nav className={`flex-1 py-4 space-y-6 overflow-y-auto custom-scrollbar ${isMinimized ? 'px-3' : 'px-5'}`}>
          
          {/* BLOK 1: CORE NAVIGATION */}
          <div className="space-y-1.5">
            {!isMinimized && (
              <p className="px-4 mb-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Navigation</p>
            )}

            <Link 
              href="/dashboard" 
              onClick={handleLinkClick} 
              className={`flex items-center ${isMinimized ? 'justify-center p-3.5' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-300 group ${pathname === '/dashboard' ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "hover:bg-white/5 hover:text-white"}`}
            >
              <LayoutDashboard size={20} className={pathname === '/dashboard' ? "text-white" : "text-slate-400 group-hover:text-blue-400"} /> 
              {!isMinimized && <span className="font-semibold text-[14px]">Dashboard</span>}
            </Link>

            {/* Transaksi Section */}
            <div>
              <button 
                onClick={() => handleDropdownClick(setIsOrderOpen, isOrderOpen)} 
                className={`w-full flex items-center ${isMinimized ? 'justify-center p-3.5' : 'justify-between gap-3 px-4 py-3'} rounded-xl transition-all duration-300 group ${isOrderActive ? "text-white" : "hover:bg-white/5 hover:text-white"}`}
              >
                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'}`}>
                  <ShoppingBag size={20} className={isOrderActive ? "text-blue-500" : "text-slate-400 group-hover:text-blue-400"} />
                  {!isMinimized && <span className="font-semibold text-[14px]">Transaksi</span>}
                </div>
                {!isMinimized && (
                  <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isOrderOpen ? 'rotate-180' : ''}`} />
                )}
              </button>
              
              {!isMinimized && (
                <div className={`overflow-hidden transition-all duration-300 ${isOrderOpen ? "max-h-[300px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                  <div className="pl-4 space-y-1">
                    {[
                      { label: 'Pesanan Masuk', href: '/dashboard/orders', icon: BanknoteArrowUp },
                      { label: 'Verifikasi Bayar', href: '/dashboard/payments', icon: HandCoins },
                      { label: 'Custom Design', href: '/dashboard/custom-designs', icon: Shirt },
                      { label: 'Laporan Pendapatan', href: '/dashboard/reports', icon: SquareLibrary },
                    ].map((sub) => (
                      <Link 
                        key={sub.href}
                        href={sub.href} 
                        onClick={handleLinkClick} 
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] transition-all duration-200 group ${pathname.includes(sub.href) ? "text-blue-400 bg-blue-400/5 font-bold" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}`}
                      >
                        <sub.icon size={16} className={pathname.includes(sub.href) ? "text-blue-500" : "text-slate-600 group-hover:text-slate-400"} />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Katalog Section */}
            <div>
              <button 
                onClick={() => handleDropdownClick(setIsCatalogOpen, isCatalogOpen)} 
                className={`w-full flex items-center ${isMinimized ? 'justify-center p-3.5' : 'justify-between gap-3 px-4 py-3'} rounded-xl transition-all duration-300 group ${isCatalogActive ? "text-white" : "hover:bg-white/5 hover:text-white"}`}
              >
                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'}`}>
                  <FolderTree size={20} className={isCatalogActive ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-400"} />
                  {!isMinimized && <span className="font-semibold text-[14px]">Katalog</span>}
                </div>
                {!isMinimized && (
                  <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isCatalogOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {!isMinimized && (
                <div className={`overflow-hidden transition-all duration-300 ${isCatalogOpen ? "max-h-[300px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                  <div className="pl-4 space-y-1">
                    {[
                      { label: 'Semua Produk', href: '/dashboard/products', icon: Package },
                      { label: 'Kategori Produk', href: '/dashboard/categories', icon: Layers },
                      { label: 'Ulasan Pembeli', href: '/dashboard/reviews', icon: Star },
                    ].map((sub) => (
                      <Link 
                        key={sub.href}
                        href={sub.href} 
                        onClick={handleLinkClick} 
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] transition-all duration-200 group ${pathname.includes(sub.href) ? "text-emerald-400 bg-emerald-400/5 font-bold" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}`}
                      >
                        <sub.icon size={16} className={pathname.includes(sub.href) ? "text-emerald-500" : "text-slate-600 group-hover:text-slate-400"} />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sistem Web Section */}
            <div>
              <button 
                onClick={() => handleDropdownClick(setIsSystemOpen, isSystemOpen)} 
                className={`w-full flex items-center ${isMinimized ? 'justify-center p-3.5' : 'justify-between gap-3 px-4 py-3'} rounded-xl transition-all duration-300 group ${isSystemActive ? "text-white" : "hover:bg-white/5 hover:text-white"}`}
              >
                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'}`}>
                  <MonitorSmartphone size={20} className={isSystemActive ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-400"} />
                  {!isMinimized && <span className="font-semibold text-[14px]">Sistem App</span>}
                </div>
                {!isMinimized && (
                  <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isSystemOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {!isMinimized && (
                <div className={`overflow-hidden transition-all duration-300 ${isSystemOpen ? "max-h-[300px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                  <div className="pl-4 space-y-1">
                    {[
                      { label: 'Manajemen User', href: '/dashboard/users', icon: Users },
                      { label: 'Banner Beranda', href: '/dashboard/banners', icon: Flag },
                      { label: 'Katalog Portfolio', href: '/dashboard/portfolio', icon: ChartCandlestick },
                      { label: 'Konfigurasi Toko', href: '/dashboard/settings', icon: Settings },
                    ].map((sub) => (
                      <Link 
                        key={sub.href}
                        href={sub.href} 
                        onClick={handleLinkClick} 
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] transition-all duration-200 group ${pathname.includes(sub.href) ? "text-indigo-400 bg-indigo-400/5 font-bold" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"}`}
                      >
                        <sub.icon size={16} className={pathname.includes(sub.href) ? "text-indigo-500" : "text-slate-600 group-hover:text-slate-400"} />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BLOK 2: SIMULASI PELANGGAN (PREMIUM CARD STYLE) */}
          <div className="pt-4 border-t border-white/5 mt-4">
            {!isMinimized && (
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Development Tools</p>
            )}
            
            <div className={`bg-gradient-to-br from-white/[0.03] to-transparent rounded-2xl border border-white/5 overflow-hidden ${isMinimized ? 'p-1' : 'p-3'}`}>
              {!isMinimized && (
                <div className="flex items-center gap-2 px-2 mb-3">
                  <Smartphone size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold text-white tracking-wide">MOBILE SIMULATION</span>
                </div>
              )}
              <div className="space-y-1">
                {[
                  { label: 'Beranda App', href: '/dashboard/pelanggan/beranda', icon: LayoutDashboard },
                  { label: 'Studio Custom', href: '/dashboard/pelanggan/pesan', icon: Palette },
                  { label: 'Lacak Paket', href: '/dashboard/pelanggan/lacak', icon: Truck },
                ].map((app) => (
                  <Link 
                    key={app.href}
                    href={app.href} 
                    title={app.label}
                    onClick={handleLinkClick} 
                    className={`flex items-center ${isMinimized ? 'justify-center p-3' : 'gap-3 px-3 py-2'} rounded-xl text-[12px] transition-all duration-200 ${pathname === app.href ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                  >
                    <app.icon size={isMinimized ? 20 : 16} /> 
                    {!isMinimized && <span>{app.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Footer Area (User Quick Info) */}
        {!isMinimized && (
          <div className="p-5 border-t border-white/5 bg-black/20">
             <button 
               onClick={logout}
               className="w-full flex items-center justify-between px-4 py-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all duration-300 group border border-red-500/10"
             >
                <div className="flex items-center gap-3">
                   <LogOut size={18} />
                   <span className="font-bold text-[13px]">Keluar Akun</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
             </button>
          </div>
        )}
      </aside>
    </>
  );
}