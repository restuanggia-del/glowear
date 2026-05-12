"use client";

import { useState, useEffect } from "react";
import { Search, ShieldAlert, ShieldCheck, User, Loader2, Users, AlertCircle, CheckCircle2, X, Info, ChevronDown, ChevronUp, Edit, Trash2, Mail, Phone, MapPin, Lock } from "lucide-react";
import Skeleton from "@/app/components/Skeleton";
import Image from "next/image";
import { api } from "@/app/services/api";

const API_BASE_URL = "http://localhost:3001";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk melipat (minimize) section Pelanggan
  const [isPelangganExpanded, setIsPelangganExpanded] = useState(true);

  // State untuk Modal Edit User
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    nama: "",
    email: "",
    password: "",
    noTelepon: "",
    alamat: "",
    role: "PELANGGAN"
  });

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
      const { data } = await api.get("/users");
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      showDialog('error', 'Koneksi Gagal', 'Gagal mengambil data pengguna dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Buka Modal Edit
  const openEditUserModal = (user: any) => {
    setSelectedUser(user);
    setUserForm({
      nama: user.nama || "",
      email: user.email || "",
      password: "", // Selalu kosongkan password untuk keamanan
      noTelepon: user.noTelp || user.noTelepon || "",
      alamat: user.alamat || "",
      role: user.role || "PELANGGAN"
    });
    setIsEditUserModalOpen(true);
  };

  // Submit Edit User
  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Siapkan data yang akan dikirim (Map to backend fields, abaikan password jika kosong)
    const payload: any = {
      nama: userForm.nama,
      email: userForm.email,
      noTelp: userForm.noTelepon,
      alamat: userForm.alamat,
      role: userForm.role
    };

    if (userForm.password.trim() !== "") {
      payload.kataSandi = userForm.password;
    }

    try {
      const { status } = await api.put(`/users/${selectedUser.id}`, payload);

      if (status === 200 || status === 201) {
        setIsEditUserModalOpen(false);
        fetchUsers();
        showDialog('success', 'Update Berhasil', 'Data profil pengguna telah berhasil diperbarui.');
      } else {
        showDialog('error', 'Update Gagal', 'Gagal menyimpan perubahan profil pengguna.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal terhubung ke server saat memperbarui data.');
    }
  };

  // Fungsi Hapus User
  const handleDeleteUser = async (userId: string, userName: string) => {
    showDialog('confirm', 'Hapus Pengguna', `Apakah Anda yakin ingin menghapus akun ${userName} secara permanen? Semua data yang terkait mungkin akan hilang.`, async () => {
      closeDialog();
      try {
        const { status } = await api.delete(`/users/${userId}`);

        if (status === 200 || status === 201 || status === 204) {
          fetchUsers();
          showDialog('success', 'Terhapus', `Akun ${userName} berhasil dihapus dari sistem.`);
        } else {
          showDialog('error', 'Gagal', 'Tidak dapat menghapus pengguna ini.');
        }
      } catch (error) {
        showDialog('error', 'Kesalahan Sistem', 'Terjadi kesalahan saat menghapus data pengguna.');
      }
    });
  };

  const handleRoleChange = async (userId: string, currentRole: string, userName: string) => {
    const newRole = currentRole === "ADMIN" ? "PELANGGAN" : "ADMIN";
    const actionText = newRole === "ADMIN" ? "memberikan hak akses ADMIN penuh kepada" : "mencabut hak akses Admin dari";
    
    showDialog('confirm', 'Ubah Hak Akses', `Apakah Anda yakin ingin ${actionText} pengguna ${userName}?`, async () => {
      closeDialog();
      try {
        const { status } = await api.patch(`/users/${userId}/role`, { role: newRole });

        if (status === 200 || status === 201) {
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
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.noTelepon?.includes(searchQuery)
  );

  // Pembagian Sesi Berdasarkan Role
  const adminUsers = filteredUsers.filter(u => u.role === 'ADMIN');
  const pelangganUsers = filteredUsers.filter(u => u.role !== 'ADMIN');

  return (
    <div className="font-sans space-y-6 pb-10 relative">
      
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Pengguna</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Kelola daftar pelanggan, edit data profil, dan atur siapa saja yang memiliki hak akses Admin Glowear.</p>
      </div>

      {/* Global Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-3">
        <div className="relative w-full group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Cari nama, email, atau nomor telepon pengguna di semua sesi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 w-full border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 bg-slate-50 focus:bg-white shadow-inner"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-indigo-50/30">
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div><Skeleton className="h-4 w-32 mb-2" /><Skeleton className="h-3 w-24" /></div>
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <Skeleton className="h-9 w-9 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <Skeleton className="h-8 w-48" />
            </div>
          </div>
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
                    <th className="py-4 px-6 font-bold">Kontak</th>
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
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bergabung: {formatDate(user.waktuDibuat)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-xs font-medium text-slate-600 space-y-1">
                            <p className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400"/> {user.email}</p>
                            <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400"/> {user.noTelepon || "-"}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => openEditUserModal(user)}
                              className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all bg-blue-50 border border-blue-100 shadow-sm"
                              title="Edit Detail Pengguna"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleRoleChange(user.id, user.role, user.nama || user.email)}
                              className="p-2 text-orange-500 hover:text-white hover:bg-orange-500 rounded-xl transition-all bg-orange-50 border border-orange-100 shadow-sm"
                              title="Turunkan ke Pelanggan"
                            >
                              <ShieldAlert size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id, user.nama || user.email)}
                              className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all bg-rose-50 border border-rose-100 shadow-sm"
                              title="Hapus Akun"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
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
                      <th className="py-4 px-6 font-bold">Kontak & Alamat</th>
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
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bergabung: {formatDate(user.waktuDibuat)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-xs font-medium text-slate-600 space-y-1.5 max-w-xs">
                              <p className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400 shrink-0"/> <span className="truncate">{user.email}</span></p>
                              <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400 shrink-0"/> {user.noTelepon || "-"}</p>
                              <p className="flex items-start gap-1.5 mt-1 pt-1 border-t border-slate-100"><MapPin size={12} className="text-rose-400 shrink-0 mt-0.5"/> <span className="truncate" title={user.alamat}>{user.alamat || "Alamat belum diatur"}</span></p>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openEditUserModal(user)}
                                className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all bg-blue-50 border border-blue-100 shadow-sm"
                                title="Edit Detail Pengguna"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleRoleChange(user.id, user.role, user.nama || user.email)}
                                className="p-2 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-xl transition-all bg-indigo-50 border border-indigo-100 shadow-sm"
                                title="Jadikan Admin"
                              >
                                <ShieldCheck size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id, user.nama || user.email)}
                                className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all bg-rose-50 border border-rose-100 shadow-sm"
                                title="Hapus Akun"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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
          MODAL EDIT PENGGUNA LENGKAP
      ========================================= */}
            {/* =========================================
          MODAL EDIT PENGGUNA (PREMIUM CENTERED)
      ========================================= */}
      {isEditUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsEditUserModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20 flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-8 pb-4 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                   <Edit size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">Edit Pengguna</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                    {userForm.role === 'ADMIN' ? <ShieldCheck size={14} className="text-indigo-500"/> : <User size={14} className="text-blue-500"/>} 
                    ROLE: {userForm.role}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEditUserModalOpen(false)} className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all border border-slate-100">
                <X size={20} />
              </button>
            </div>
            
            {/* Form Tengah (Bisa di-scroll) */}
            <div className="overflow-y-auto custom-scrollbar flex-1 px-8 py-4">
              <form id="editUserForm" onSubmit={handleEditUserSubmit} className="space-y-8">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        required 
                        value={userForm.nama} 
                        placeholder="Masukkan nama lengkap..." 
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                        onChange={(e) => setUserForm({...userForm, nama: e.target.value})} 
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Alamat Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="email" 
                        required 
                        value={userForm.email} 
                        placeholder="email@glowear.id" 
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                        onChange={(e) => setUserForm({...userForm, email: e.target.value})} 
                      />
                    </div>
                  </div>

                  {/* Nomor Telepon */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Nomor Telepon</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        value={userForm.noTelepon} 
                        placeholder="08xxxxxxxxxx" 
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all" 
                        onChange={(e) => setUserForm({...userForm, noTelepon: e.target.value})} 
                      />
                    </div>
                  </div>

                  {/* Alamat Lengkap */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Alamat Pengiriman</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-5 text-slate-300" size={18} />
                      <textarea 
                        value={userForm.alamat} 
                        placeholder="Detail jalan, kecamatan, kota..." 
                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-[1.5rem] text-sm font-medium text-slate-600 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all custom-scrollbar" 
                        rows={3} 
                        onChange={(e) => setUserForm({...userForm, alamat: e.target.value})}
                      ></textarea>
                    </div>
                  </div>

                  {/* Ganti Password */}
                  <div className="sm:col-span-2 p-6 bg-rose-50 rounded-3xl border border-rose-100">
                    <label className="block text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-3 px-1">Ubah Kata Sandi <span className="normal-case tracking-normal font-medium text-rose-400 ml-1">(Opsional)</span></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
                      <input 
                        type="password" 
                        value={userForm.password} 
                        placeholder="Masukkan password baru..." 
                        className="w-full pl-12 pr-4 py-4 border-2 border-rose-100 rounded-2xl text-sm font-bold text-slate-800 bg-white outline-none focus:border-rose-500 transition-all placeholder:text-rose-200" 
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})} 
                      />
                    </div>
                    {userForm.password && (
                      <p className="text-[10px] text-rose-500 mt-3 font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                        <AlertCircle size={14}/> Perhatian: Password akan langsung diperbarui!
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0">
              <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="flex-1 py-4 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">
                Batal
              </button>
              <button type="submit" form="editUserForm" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition-all active:scale-95">
                Simpan Profil
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =========================================
          DIALOG KONFIRMASI (PREMIUM ALERT)
      ========================================= */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={closeDialog}></div>
          
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20 p-8 text-center">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${dialog.type === 'confirm' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
              {dialog.type === 'confirm' ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">{dialog.title}</h3>
            <p className="text-slate-500 font-medium text-[13px] mb-8 leading-relaxed px-2">{dialog.message}</p>
            
            <div className="flex flex-col gap-3">
              {dialog.type === 'confirm' ? (
                <>
                  <button onClick={dialog.onConfirm} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-95">
                    Ya, Lanjutkan
                  </button>
                  <button onClick={closeDialog} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">
                    Batalkan
                  </button>
                </>
              ) : (
                <button onClick={closeDialog} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
                  Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}