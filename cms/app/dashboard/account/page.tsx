"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { User, Mail, Lock, Save, ShieldCheck, Loader2 } from "lucide-react";
import DialogModal, { DialogState, DEFAULT_DIALOG } from "@/app/components/ui/DialogModal";

export default function AdminAccountPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(DEFAULT_DIALOG);
  
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setDialog({
          isOpen: true,
          type: "success",
          title: "Profil Diperbarui!",
          message: "Data profil admin berhasil disimpan. Perubahan akan terlihat penuh setelah Anda login ulang."
        });
        setFormData({ ...formData, kataSandi: "" }); // Kosongkan field password lagi
      } else {
        const error = await res.json();
        setDialog({
          isOpen: true,
          type: "error",
          title: "Gagal Menyimpan",
          message: error.message || "Terjadi kesalahan saat menyimpan profil."
        });
      }
    } catch (error) {
      setDialog({
        isOpen: true,
        type: "error",
        title: "Kesalahan Sistem",
        message: "Gagal terhubung ke server."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Manajemen Akun Sistem</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Kelola data pribadi dan kredensial login admin Anda di sini.</p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 sm:p-8 md:p-10">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-100 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-blue-600/20 shrink-0">
              {formData.nama.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-2">
                {formData.nama || "Administrator"} <ShieldCheck size={18} className="text-blue-500" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Hak Akses Super Admin</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Nama */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nama Tampilan</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" name="nama" value={formData.nama} onChange={handleChange} required
                    className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Username Login</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                  <input 
                    type="text" name="username" value={formData.username} onChange={handleChange} required
                    className="w-full pl-9 pr-3.5 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                <Lock size={15} className="text-slate-500" /> Ganti Kata Sandi (Opsional)
              </label>
              <input 
                type="password" name="kataSandi" value={formData.kataSandi} onChange={handleChange}
                placeholder="Biarkan kosong jika tidak ingin mengubah password"
                className="w-full px-3.5 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-500 bg-white transition-all"
              />
              <p className="text-[10px] text-slate-400">
                Jika Anda mengisi kolom ini, kata sandi lama Anda akan tertimpa dengan yang baru.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit" disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {loading ? "Menyimpan..." : "Simpan Profil Admin"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Shared DialogModal */}
      <DialogModal dialog={dialog} onClose={() => setDialog(DEFAULT_DIALOG)} />
    </div>
  );
}