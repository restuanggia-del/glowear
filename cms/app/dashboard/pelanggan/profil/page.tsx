"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { UserCircle, MapPin, Phone, Mail, Save, ShieldCheck, LogOut } from "lucide-react";

export default function ProfilPelangganPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    noTelp: "",
    alamat: ""
  });

  // Saat komponen dimuat, ambil data user yang sedang login
  useEffect(() => {
    if (user) {
      // Idealnya ini fetch ke http://localhost:3001/users/me untuk data ter-update
      // Sementara kita pakai data dari context auth
      setFormData({
        nama: user.nama || "",
        email: user.email || "",
        noTelp: user.noTelp || "",
        alamat: user.alamat || ""
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mengirim data update ke backend
      const res = await fetch(`http://localhost:3001/users/${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: formData.nama,
          noTelp: formData.noTelp,
          alamat: formData.alamat
        }),
      });

      if (res.ok) {
        alert("Profil berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui profil.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans max-w-3xl mx-auto pb-20 space-y-8">
      
      {/* Header Profil */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-4 border-white/30 shrink-0">
          <UserCircle size={64} className="text-white opacity-90" />
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-bold">{formData.nama || "Pelanggan"}</h1>
            <ShieldCheck size={20} className="text-emerald-200" />
          </div>
          <p className="text-emerald-100 text-sm">{formData.email}</p>
          <span className="inline-block mt-3 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            Member Glowear
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informasi Pribadi */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Informasi Pribadi</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nama Lengkap</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="nama"
                  value={formData.nama} 
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email (Tidak bisa diubah)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={formData.email} 
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nomor WhatsApp Aktif</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  name="noTelp"
                  value={formData.noTelp} 
                  onChange={handleChange}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Nomor ini akan dihubungi kurir saat pesanan dikirim.</p>
            </div>
          </div>
        </div>

        {/* Alamat Pengiriman */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            Alamat Default
          </h2>
          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <textarea 
                name="alamat"
                value={formData.alamat} 
                onChange={handleChange}
                placeholder="Tuliskan alamat lengkap rumah atau komunitas Anda (Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos)..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors h-32 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Save size={20} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          
          <button 
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold transition-colors"
          >
            <LogOut size={20} /> Keluar Akun
          </button>
        </div>
      </form>

    </div>
  );
}