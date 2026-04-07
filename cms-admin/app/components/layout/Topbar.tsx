'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, User as UserIcon, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context'; // Pastikan path ini sesuai dengan context Anda
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Topbar() {
  const { user, logout } = useAuth(); // Mengambil data user dari context yang Anda buat di awal
  const router = useRouter();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk menutup dropdown jika user klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mengambil jumlah pesanan berstatus PENDING secara berkala (contoh notifikasi)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:3001/orders");
        if (res.ok) {
          const data = await res.json();
          // Hitung berapa banyak order yang masih PENDING
          const unhandledOrders = data.filter((order: any) => order.status === 'PENDING').length;
          setPendingOrders(unhandledOrders);
        }
      } catch (error) {
        console.error("Gagal mengambil notifikasi", error);
      }
    };

    fetchNotifications();
    // Refresh notifikasi setiap 30 detik agar real-time tanpa membebani server
    const intervalId = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
      
      {/* Bagian Kiri: Tombol Menu Mobile & Pencarian Global (Opsional) */}
      <div className="flex items-center gap-4">
        {/* Tombol Hamburger (Biasanya dipakai untuk toggle sidebar di mobile) */}
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden transition-colors">
          <Menu size={20} />
        </button>
        
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-500">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Bagian Kanan: Notifikasi & Profil */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Tombol Notifikasi */}
        <button 
          onClick={() => router.push('/dashboard/orders')}
          className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          title="Lihat Pesanan Baru"
        >
          <Bell size={20} />
          {/* Badge Merah jika ada pesanan pending */}
          {pendingOrders > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {pendingOrders}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        {/* Dropdown Profil Pengguna */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.nama || 'Admin Glowear'}</p>
              <p className="text-xs text-gray-500 font-medium">{user?.role || 'Administrator'}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
          </button>

          {/* Isi Menu Dropdown */}
          <div className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 origin-top-right ${
            isProfileOpen ? "transform scale-100 opacity-100" : "transform scale-95 opacity-0 pointer-events-none"
          }`}>
            <div className="p-3 border-b border-gray-50">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.email || 'admin@glowear.com'}</p>
            </div>
            <div className="p-1">
              <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
                <Settings size={16} />
                Pengaturan Toko
              </Link>
            </div>
            <div className="p-1 border-t border-gray-50">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}