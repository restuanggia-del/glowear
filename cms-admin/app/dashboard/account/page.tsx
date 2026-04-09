"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { User, Mail, Lock, Save, ShieldCheck } from "lucide-react";

export default function AdminAccountPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    email: "",
    kataSandi: "", // Dikosongkan, hanya diisi jika ingin ganti password
  });

  // Isi form dengan data admin yang sedang login
  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || "",
        username: user.username || "",
        email: user.email || "",
        kataSandi: "", 
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Siapkan data yang akan dikirim (Jika password kosong, jangan dikirim)
    const updateData: any = {
      nama: formData.nama,
      username: formData.username,
      email: formData.email,
    };
    if (formData.kataSandi.trim() !== "") {
      updateData.kataSandi = formData.kataSandi;
    }

    try {
      const res = await fetch(`http://localhost:3001/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        alert("Profil Admin berhasil diperbarui! Perubahan akan terlihat penuh setelah Anda login ulang.");
        setFormData({ ...formData, kataSandi: "" }); // Kosongkan field password lagi
      } else {
        const error = await res.json();
        alert(`Gagal: ${error.message || "Terjadi kesalahan"}`);
      }
    } catch (error) {
      alert("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Akun Admin</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola data pribadi dan kredensial login Anda di sini.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10">
          
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-lg shadow-blue-600/20">
              {formData.nama.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {formData.nama || "Administrator"} <ShieldCheck size={20} className="text-blue-500" />
              </h2>
              <p className="text-sm text-gray-500">Super Admin Akses</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Nama */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nama Tampilan</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" name="nama" value={formData.nama} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username Login</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                  <input 
                    type="text" name="username" value={formData.username} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                <Lock size={16} className="text-gray-500" /> Ganti Kata Sandi (Opsional)
              </label>
              <input 
                type="password" name="kataSandi" value={formData.kataSandi} onChange={handleChange}
                placeholder="Biarkan kosong jika tidak ingin mengubah password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white transition-colors"
              />
              <p className="text-[10px] text-gray-400 mt-2">
                Jika Anda mengisi kolom ini, kata sandi lama Anda akan tertimpa dengan yang baru.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <Save size={20} /> {loading ? "Menyimpan..." : "Simpan Profil Admin"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}