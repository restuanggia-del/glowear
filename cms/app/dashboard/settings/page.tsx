"use client";

import { useState, useEffect } from "react";
import { Store, Phone, CreditCard, FileText, Save, Info, Loader2 } from "lucide-react";
import { api } from "@/app/services/api";
import DialogModal, { DialogState, DEFAULT_DIALOG, DialogType } from "@/app/components/ui/DialogModal";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    namaToko: "",
    whatsappCS: "",
    namaBank: "",
    nomorRekening: "",
    atasNamaBank: "",
    syaratKetentuan: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // STATE CUSTOM DIALOG
  // ==========================================
  const [dialog, setDialog] = useState<DialogState>(DEFAULT_DIALOG);

  const showDialog = (type: DialogType, title: string, message: string, onConfirm?: () => void) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };

  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));
  // ==========================================

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        if (data) {
          setFormData({
            namaToko: data.namaToko || "",
            whatsappCS: data.whatsappCS || "",
            namaBank: data.namaBank || "",
            nomorRekening: data.nomorRekening || "",
            atasNamaBank: data.atasNamaBank || "",
            syaratKetentuan: data.syaratKetentuan || "",
          });
        }
      } catch (error) {
        showDialog('error', 'Koneksi Gagal', 'Gagal mengambil data pengaturan dari server.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/settings", formData);

      if (data) {
        showDialog('success', 'Berhasil Disimpan', 'Semua pengaturan toko telah diperbarui dan langsung terhubung ke Aplikasi Mobile.');
      } else {
        showDialog('error', 'Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan pengaturan ke database.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal menghubungi server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Memuat pengaturan sistem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Halaman */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Pengaturan Toko</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Informasi kontak, rekening, dan ketentuan yang Anda atur di sini akan tampil secara real-time di Aplikasi Pelanggan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* =========================================
              KOLOM KIRI: INFO UMUM & REKENING
          ========================================= */}
          <div className="space-y-6">
            
            {/* Bagian: Informasi Umum */}
            <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Store size={18} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">Profil Bisnis</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nama Toko / Konveksi</label>
                  <input
                    type="text"
                    name="namaToko"
                    value={formData.namaToko}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    placeholder="Contoh: Glowear Sablon"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nomor WhatsApp CS</label>
                  <div className="relative group">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="whatsappCS"
                      value={formData.whatsappCS}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-3.5 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider">Format: Mulai dari angka 0 atau 62.</p>
                </div>
              </div>
            </div>

            {/* Bagian: Rekening Bank */}
            <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard size={18} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">Rekening Transfer</h2>
              </div>
              
              <div className="bg-blue-50/60 p-3.5 sm:p-4 rounded-xl border border-blue-100 mb-5 flex gap-2.5 text-blue-900 text-xs sm:text-sm shadow-inner">
                <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
                <p className="font-medium leading-relaxed">Rekening tunggal ini akan menjadi tujuan transfer DP maupun Pelunasan oleh seluruh pelanggan.</p>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nama Bank / E-Wallet</label>
                  <input
                    type="text"
                    name="namaBank"
                    value={formData.namaBank}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    placeholder="Contoh: BCA / Mandiri / DANA"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Nomor Rekening</label>
                    <input
                      type="text"
                      name="nomorRekening"
                      value={formData.nomorRekening}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono placeholder:font-sans placeholder:font-medium placeholder:text-slate-400"
                      placeholder="8473xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Atas Nama</label>
                    <input
                      type="text"
                      name="atasNamaBank"
                      value={formData.atasNamaBank}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                      placeholder="Ahmad Faiz"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* =========================================
              KOLOM KANAN: SYARAT & KETENTUAN
          ========================================= */}
          <div className="space-y-6 flex flex-col h-full">
            
            <div className="bg-white p-5 sm:p-7 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <FileText size={18} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">Syarat & Ketentuan</h2>
              </div>
              
              <div className="flex-1 flex flex-col">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Kebijakan Order (Muncul di Aplikasi Pelanggan)
                </label>
                <textarea
                  name="syaratKetentuan"
                  value={formData.syaratKetentuan}
                  onChange={handleChange}
                  required
                  className="w-full flex-1 min-h-[220px] sm:min-h-[300px] border border-slate-200 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none leading-relaxed custom-scrollbar placeholder:text-slate-400"
                  placeholder="1. Pengerjaan memakan waktu 7-14 hari kerja.&#10;2. DP minimal 50% untuk mulai produksi.&#10;3. Kesalahan ukuran dari pihak pelanggan di luar tanggung jawab kami."
                />
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-slate-900/15 active:scale-95"
              >
                {saving ? (
                  <><Loader2 size={18} className="animate-spin" /> Menyimpan Sistem...</>
                ) : (
                  <><Save size={18} /> Simpan Pengaturan</>
                )}
              </button>
            </div>

          </div>
        </div>
      </form>

      {/* Shared DialogModal */}
      <DialogModal dialog={dialog} onClose={closeDialog} />

    </div>
  );
}
