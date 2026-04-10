"use client";

import { Menu, Bell, Search, User, ShieldCheck, LogOut, ChevronRight, Package, Receipt } from "lucide-react";
import { useAuth } from "@/app/lib/auth-context";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Fungsi cerdas untuk menerjemahkan URL menjadi judul halaman (Breadcrumbs)
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
    <header className="bg-white border-b border-gray-200 h-20 px-4 md:px-8 flex items-center justify-between shrink-0 z-20 relative">
      
      {/* KIRI: Tombol Mobile & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        
        {/* Breadcrumbs (Hanya tampil di layar agak besar) */}
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium">
          <span className="text-gray-400">Glowear</span>
          <ChevronRight size={16} className="text-gray-300" />
          <span className="text-blue-600 font-bold">{getPageTitle()}</span>
        </div>
      </div>

      {/* TENGAH: Search Bar (Hanya tampil di Desktop) */}
      <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-80 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all shadow-inner">
        <Search size={18} className="text-gray-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Cari ID Pesanan (Cth: ORD-123)..." 
          className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
        />
      </div>

      {/* KANAN: Notifikasi & Profil */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Dropdown Notifikasi */}
        <div className="relative">
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className={`relative p-2.5 rounded-full transition-colors ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
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
                  {/* Item Notifikasi 1 */}
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 flex gap-3 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Receipt size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Bukti Transfer Diunggah</p>
                      <p className="text-xs text-gray-500 mt-0.5">Pelanggan telah mengunggah struk untuk ORD-A1B2. Segera verifikasi.</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">5 menit yang lalu</p>
                    </div>
                  </div>

                  {/* Item Notifikasi 2 */}
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Pesanan Sablon Baru</p>
                      <p className="text-xs text-gray-500 mt-0.5">Ada pesanan custom 24 pcs Hoodie. Menunggu konfirmasi Anda.</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">1 jam yang lalu</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/dashboard/orders" onClick={() => setIsNotifOpen(false)} className="block text-center text-xs font-bold text-blue-600 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  Lihat Semua Aktivitas
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* Dropdown Profil */}
        <div className="relative">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-3 text-left focus:outline-none hover:opacity-80 transition-opacity"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-gray-700 leading-tight">{user?.nama || "Admin"}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md border-2 border-white relative">
              {user?.nama?.charAt(0).toUpperCase() || "A"}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
          </button>

          {/* Menu Dropdown Profil */}
          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                <div className="px-4 py-3 border-b border-gray-50 mb-2">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Login Sebagai</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{user?.email}</p>
                </div>
                
                <Link 
                  href="/dashboard/account" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <User size={18} /> Pengaturan Akun
                </Link>
                
                <button 
                  onClick={() => { setIsProfileOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                >
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