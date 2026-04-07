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
  Users
} from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context'; 
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  
  // State untuk mengontrol buka/tutup dropdown Katalog
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);

  // Cek apakah URL saat ini ada di dalam sub-menu katalog
  const isCatalogActive = pathname.includes('/dashboard/products') || pathname.includes('/dashboard/categories');

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-xl transition-all duration-300">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wider">
          GLOWEAR<span className="text-blue-500">.</span>
        </h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {/* Menu Dashboard Utama */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            pathname === '/dashboard' ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </Link>

        <Link
          href="/dashboard/custom-designs"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            pathname === '/dashboard/custom-designs' ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Shirt size={20} />
          <span className="font-medium">Custom Design</span>
        </Link>

        <Link
          href="/dashboard/orders"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            pathname === '/dashboard/orders' ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"
          }`}
        >
          <BanknoteArrowUp size={20} />
          <span className="font-medium">Pesanan</span>
        </Link>

        {/* Dropdown Menu Katalog */}
        <div>
          <button
            onClick={() => setIsCatalogOpen(!isCatalogOpen)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isCatalogActive && !isCatalogOpen ? "text-blue-400" : "hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <FolderTree size={20} className={isCatalogActive ? "text-blue-500" : ""} />
              <span className="font-medium">Katalog</span>
            </div>
            {isCatalogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Isi Dropdown */}
          <div className={`overflow-hidden transition-all duration-300 ${isCatalogOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
            <div className="pl-11 pr-2 space-y-1">
              <Link
                href="/dashboard/categories"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/categories') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Layers size={18} />
                Kategori
              </Link>
              <Link
                href="/dashboard/products"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  pathname.includes('/dashboard/products') ? "bg-slate-800 text-white font-medium" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Package size={18} />
                Produk
              </Link>
            </div>
          </div>
        </div>

        {/* Menu Pesanan (Persiapan untuk nanti) */}
        <Link
          href="/dashboard/users"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            pathname.includes('/dashboard/users') ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Users size={20} />
          <span className="font-medium">Pengguna</span>
        </Link>
      </nav>

      {/* Tombol Logout */}
      <div className="p-4 border-t border-slate-800 mt-auto">
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