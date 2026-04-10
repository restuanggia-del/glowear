"use client";

import { Menu, Bell, Search, User, ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "@/app/lib/auth-context";
import { useState } from "react";
import Link from "next/link";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-20 px-4 md:px-8 flex items-center justify-between shrink-0 z-10">
      
      {/* Kiri: Tombol Mobile & Search */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Cari pesanan, produk..." 
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700"
          />
        </div>
      </div>

      {/* Kanan: Notifikasi & Profil */}
      <div className="flex items-center gap-3 md:gap-5">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* Dropdown Profil */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-700">{user?.nama || "Admin"}</p>
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md border-2 border-white">
              {user?.nama?.charAt(0).toUpperCase() || "A"}
            </div>
          </button>

          {/* Menu Dropdown */}
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-right transition-all">
                <div className="px-4 py-3 border-b border-gray-50 mb-2">
                  <p className="text-sm font-bold text-gray-800">{user?.email}</p>
                </div>
                
                <Link 
                  href="/dashboard/account" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <User size={18} /> Pengaturan Akun
                </Link>
                
                <button 
                  onClick={() => { setIsDropdownOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1"
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