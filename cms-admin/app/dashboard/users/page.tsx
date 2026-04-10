"use client";

import { useState, useEffect } from "react";
import { Search, ShieldAlert, ShieldCheck, User, Loader2, Users, AlertCircle, CheckCircle2, X, Info, ChevronDown, ChevronUp } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk melipat (minimize) section Pelanggan
  const [isPelangganExpanded, setIsPelangganExpanded] = useState(true);

  // ==========================================
  // STATE CUSTOM DIALOG (Pengganti Alert)
  // ==========================================
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'info', title: '', message: '' });

  const showDialog = (type: 'success' | 'error' | 'info' | 'confirm', title: string, message: string, onConfirm?: () => void) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };

  const closeDialog = () => setDialog({ ...dialog, isOpen: false });
  // ==========================================

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      showDialog('error', 'Koneksi Gagal', 'Gagal mengambil data pengguna dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string, userName: string) => {
    const newRole = currentRole === "ADMIN" ? "PELANGGAN" : "ADMIN";
    const actionText = newRole === "ADMIN" ? "memberikan hak akses ADMIN penuh kepada" : "mencabut hak akses Admin dari";
    
    showDialog('confirm', 'Ubah Hak Akses', `Apakah Anda yakin ingin ${actionText} pengguna ${userName}?`, async () => {
      closeDialog();

      try {
        const res = await fetch(`http://localhost:3001/users/${userId}/role`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });

        if (res.ok) {
          showDialog('success', 'Akses Diperbarui!', `Hak akses untuk ${userName} berhasil diubah menjadi ${newRole}.`);
          fetchUsers();
        } else {
          showDialog('error', 'Update Gagal', 'Gagal mengubah hak akses pengguna ini.');
        }
      } catch (error) {
        showDialog('error', 'Kesalahan Sistem', 'Gagal terhubung ke server saat memperbarui data.');
      }
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "short", 
      year: "numeric" 
    });
  };

  // Pemfilteran Global
  const filteredUsers = users.filter((u) =>
    u.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pembagian Sesi Berdasarkan Role
  const adminUsers = filteredUsers.filter(u => u.role === 'ADMIN');
  const pelangganUsers = filteredUsers.filter(u => u.role !== 'ADMIN');

  return (
    <div className="font-sans space-y-6 pb-10 relative">
      
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pengguna</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Kelola daftar pelanggan terdaftar dan atur siapa saja yang memiliki hak akses Admin Glowear.</p>
      </div>

      {/* Global Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-3">
        <div className="relative w-full group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Cari nama atau email pengguna di semua sesi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 w-full border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white shadow-inner"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-20 flex flex-col items-center justify-center">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p className="text-slate-500 font-medium">Memuat data pengguna...</p>
        </div>
      ) : (
        <>
          {/* =========================================
              SECTION 1: ADMINISTRATOR SISTEM
          ========================================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-indigo-50/30 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                Administrator Sistem 
                <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{adminUsers.length} Orang</span>
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6 font-bold">Profil Admin</th>
                    <th className="py-4 px-6 font-bold">Terdaftar Pada</th>
                    <th className="py-4 px-6 font-bold text-center">Aksi Manajemen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {adminUsers.length === 0 ? (
                    <tr><td colSpan={3} className="py-10 text-center text-slate-500 font-medium">Tidak ada Administrator yang ditemukan.</td></tr>
                  ) : (
                    adminUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm border bg-indigo-50 text-indigo-600 border-indigo-100 relative">
                              {user.nama ? user.nama.charAt(0).toUpperCase() : <ShieldCheck size={20} />}
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Akses Penuh"></div>
                            </div>
                            <div>
                              <div className="font-black text-slate-800 text-sm mb-0.5">{user.nama || "Admin Utama"}</div>
                              <div className="text-xs font-medium text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{formatDate(user.waktuDibuat)}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => handleRoleChange(user.id, user.role, user.nama || user.email)}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto shadow-sm border bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-100 hover:border-rose-600"
                            title="Turunkan ke Pelanggan"
                          >
                            <ShieldAlert size={16} />
                            <span className="whitespace-nowrap">Cabut Admin</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================
              SECTION 2: PELANGGAN TERDAFTAR (MINIMIZABLE)
          ========================================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header / Toggle Button */}
            <button 
              onClick={() => setIsPelangganExpanded(!isPelangganExpanded)}
              className="w-full p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center hover:bg-slate-100/50 transition-colors focus:outline-none group"
            >
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Users size={20} />
                </div>
                Pelanggan Terdaftar 
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">{pelangganUsers.length} Orang</span>
              </h2>
              <div className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 shadow-sm transition-all">
                {isPelangganExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
            
            {/* Tabel Konten (Bisa Disembunyikan) */}
            {isPelangganExpanded && (
              <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-300">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                      <th className="py-4 px-6 font-bold">Profil Pelanggan</th>
                      <th className="py-4 px-6 font-bold">Terdaftar Pada</th>
                      <th className="py-4 px-6 font-bold text-center">Aksi Manajemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {pelangganUsers.length === 0 ? (
                      <tr><td colSpan={3} className="py-16 text-center flex flex-col items-center justify-center text-slate-500"><Users size={40} className="text-slate-300 mb-3" /><span className="font-medium">Tidak ada data pelanggan ditemukan.</span></td></tr>
                    ) : (
                      pelangganUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-sm border bg-slate-100 text-slate-500 border-slate-200">
                                {user.nama ? user.nama.charAt(0).toUpperCase() : <User size={20} />}
                              </div>
                              <div>
                                <div className="font-black text-slate-800 text-sm mb-0.5">{user.nama || "Pelanggan Anonim"}</div>
                                <div className="text-xs font-medium text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{formatDate(user.waktuDibuat)}</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button 
                              onClick={() => handleRoleChange(user.id, user.role, user.nama || user.email)}
                              className="px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto shadow-sm border bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-100 hover:border-blue-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                              title="Jadikan Admin"
                            >
                              <ShieldCheck size={16} />
                              <span className="whitespace-nowrap">Jadikan Admin</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* =========================================
          CUSTOM DIALOG SYSTEM (Pengganti Alert)
      ========================================= */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => dialog.type !== 'confirm' && closeDialog()}></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200 sm:my-8 border border-slate-100">
              
              <div className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-5 shadow-inner
                ${dialog.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 
                  dialog.type === 'error' ? 'bg-rose-100 text-rose-500' : 
                  dialog.type === 'confirm' ? 'bg-indigo-100 text-indigo-500' : 
                  'bg-blue-100 text-blue-500'}`}
              >
                {dialog.type === 'success' && <CheckCircle2 size={32} />}
                {dialog.type === 'error' && <X size={32} />}
                {dialog.type === 'confirm' && <AlertCircle size={32} />}
                {dialog.type === 'info' && <Info size={32} />}
              </div>

              <h3 className="text-xl font-black text-slate-800 mb-2">{dialog.title}</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">{dialog.message}</p>

              {dialog.type === 'confirm' ? (
                <div className="flex gap-3">
                  <button onClick={closeDialog} className="flex-1 py-3 rounded-full font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                    Batal
                  </button>
                  <button onClick={dialog.onConfirm} className="flex-1 py-3 rounded-full font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95">
                    Ya, Lanjutkan
                  </button>
                </div>
              ) : (
                <button onClick={closeDialog} className="w-full py-3 rounded-full font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 transition-all active:scale-95">
                  Mengerti
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}