"use client";

import { useState, useEffect } from "react";
import { Store, Phone, CreditCard, FileText, Save, Info, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("http://localhost:3001/settings");
        const data = await res.json();
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
      const res = await fetch("http://localhost:3001/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
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
    <div className="font-sans space-y-6 pb-10 relative">
      
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pengaturan Toko</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Informasi kontak, rekening, dan ketentuan yang Anda atur di sini akan tampil secara real-time di Aplikasi Pelanggan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* =========================================
              KOLOM KIRI: INFO UMUM & REKENING
          ========================================= */}
          <div className="space-y-8">
            
            {/* Bagian: Informasi Umum */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Store size={20} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Profil Bisnis</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nama Toko / Konveksi</label>
                  <input
                    type="text"
                    name="namaToko"
                    value={formData.namaToko}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    placeholder="Contoh: Glowear Sablon"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nomor WhatsApp CS</label>
                  <div className="relative group">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      name="whatsappCS"
                      value={formData.whatsappCS}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wider">Format: Mulai dari angka 0 atau 62.</p>
                </div>
              </div>
            </div>

            {/* Bagian: Rekening Bank */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard size={20} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Rekening Transfer</h2>
              </div>
              
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6 flex gap-3 text-blue-800 text-sm shadow-inner">
                <Info size={16} className="shrink-0 mt-0.5 text-blue-500" />
                <p className="font-medium leading-relaxed">Rekening tunggal ini akan menjadi tujuan pembayaran DP maupun Pelunasan oleh seluruh pelanggan.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nama Bank / E-Wallet</label>
                  <input
                    type="text"
                    name="namaBank"
                    value={formData.namaBank}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    placeholder="Contoh: BCA / Mandiri / DANA"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nomor Rekening</label>
                    <input
                      type="text"
                      name="nomorRekening"
                      value={formData.nomorRekening}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono placeholder:font-sans placeholder:font-medium placeholder:text-slate-400"
                      placeholder="8473xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Atas Nama</label>
                    <input
                      type="text"
                      name="atasNamaBank"
                      value={formData.atasNamaBank}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
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
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <FileText size={20} className="stroke-[2.5px]" />
                </div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Syarat & Ketentuan</h2>
              </div>
              
              <div className="flex-1 flex flex-col">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Kebijakan Order (Muncul di Aplikasi Pelanggan)
                </label>
                <textarea
                  name="syaratKetentuan"
                  value={formData.syaratKetentuan}
                  onChange={handleChange}
                  required
                  className="w-full flex-1 min-h-[300px] border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 bg-slate-50 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none leading-relaxed custom-scrollbar placeholder:text-slate-400"
                  placeholder="1. Pengerjaan memakan waktu 7-14 hari kerja.&#10;2. DP minimal 50% untuk mulai produksi.&#10;3. Kesalahan ukuran dari pihak pelanggan di luar tanggung jawab kami."
                />
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-slate-900/20 active:scale-95"
              >
                {saving ? (
                  <><Loader2 size={20} className="animate-spin" /> Menyimpan Sistem...</>
                ) : (
                  <><Save size={20} /> Simpan Pengaturan</>
                )}
              </button>
            </div>

          </div>
        </div>
      </form>

      {/* =========================================
          CUSTOM DIALOG SYSTEM
      ========================================= */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => dialog.type !== 'confirm' && closeDialog()}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className={`mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-5 shadow-inner
              ${dialog.type === 'success' ? 'bg-emerald-100 text-emerald-500' : 
                dialog.type === 'error' ? 'bg-rose-100 text-rose-500' : 
                dialog.type === 'confirm' ? 'bg-amber-100 text-amber-500' : 
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
                <button onClick={dialog.onConfirm} className="flex-1 py-3 rounded-full font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 transition-all active:scale-95">
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
      )}

    </div>
  );
}