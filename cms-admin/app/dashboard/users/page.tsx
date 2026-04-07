"use client";

import { useState, useEffect } from "react";
import { Search, ShieldAlert, ShieldCheck, User } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Mengambil data pengguna dari backend
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fungsi untuk mengubah Role
  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "PELANGGAN" : "ADMIN";
    
    if (!confirm(`Apakah Anda yakin ingin mengubah hak akses pengguna ini menjadi ${newRole}?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        alert("Hak akses berhasil diperbarui!");
        fetchUsers(); // Refresh tabel setelah berhasil
      } else {
        alert("Gagal mengubah hak akses");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    }
  };

  // Format tanggal pendaftaran
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", { 
      day: "numeric", 
      month: "long", 
      year: "numeric" 
    });
  };

  // Filter pencarian berdasarkan nama atau email
  const filteredUsers = users.filter((u) =>
    u.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data pelanggan dan hak akses admin Glowear.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black transition-all"
            />
          </div>
        </div>

        {/* Tabel Pengguna */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="py-3 px-6 font-semibold">Profil Pengguna</th>
                <th className="py-3 px-6 font-semibold">Terdaftar Pada</th>
                <th className="py-3 px-6 font-semibold">Hak Akses (Role)</th>
                <th className="py-3 px-6 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="py-10 text-center text-gray-500">Memuat data pengguna...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-gray-500">Tidak ada pengguna ditemukan.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    
                    {/* Kolom Profil */}
                    <td className="py-4 px-6 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        {user.nama ? user.nama.charAt(0).toUpperCase() : <User size={20} />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{user.nama || "Tanpa Nama"}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </td>

                    {/* Kolom Tanggal Daftar */}
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {formatDate(user.waktuDibuat)}
                    </td>

                    {/* Kolom Role */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 w-max ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {user.role === 'ADMIN' ? <ShieldCheck size={14} /> : <User size={14} />}
                        {user.role}
                      </span>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => handleRoleChange(user.id, user.role)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto ${
                          user.role === 'ADMIN' 
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                        }`}
                        title={user.role === 'ADMIN' ? "Turunkan ke Pelanggan" : "Jadikan Admin"}
                      >
                        {user.role === 'ADMIN' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                        {user.role === 'ADMIN' ? "Cabut Admin" : "Jadikan Admin"}
                      </button>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}