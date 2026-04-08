"use client";

import { useState, useEffect } from "react";
import { Store, Phone, CreditCard, FileText, Save, Info } from "lucide-react";

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
        console.error("Gagal mengambil data pengaturan", error);
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
        alert("Pengaturan Toko berhasil diperbarui!");
      } else {
        alert("Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Memuat pengaturan...</div>;

  return (
    <div className="font-sans space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Toko</h1>
        <p className="text-sm text-gray-500 mt-1">
          Informasi ini akan terhubung langsung dan tampil di Aplikasi Mobile pelanggan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Kolom Kiri */}
          <div className="space-y-6">
            {/* Bagian: Informasi Umum */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Store size={18} /> Profil Bisnis
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko / Konveksi</label>
                  <input
                    type="text"
                    name="namaToko"
                    value={formData.namaToko}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Contoh: Glowear Sablon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp CS</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
                      <Phone size={14} />
                    </span>
                    <input
                      type="text"
                      name="whatsappCS"
                      value={formData.whatsappCS}
                      onChange={handleChange}
                      className="flex-1 w-full border border-gray-200 rounded-r-lg p-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Contoh: 08123456789"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Gunakan format angka mulai dari 0 atau 62.</p>
                </div>
              </div>
            </div>

            {/* Bagian: Rekening Bank */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <CreditCard size={18} /> Rekening Tujuan Transfer
              </h2>
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4 flex gap-3 text-blue-800 text-sm">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>Rekening ini akan ditampilkan di halaman Pembayaran pada Aplikasi Mobile pelanggan.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank / E-Wallet</label>
                  <input
                    type="text"
                    name="namaBank"
                    value={formData.namaBank}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Contoh: BCA / Mandiri / DANA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      name="nomorRekening"
                      value={formData.nomorRekening}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                      placeholder="8473xxx"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Atas Nama</label>
                    <input
                      type="text"
                      name="atasNamaBank"
                      value={formData.atasNamaBank}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Ahmad Faiz"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-6">
            {/* Bagian: Syarat & Ketentuan */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <FileText size={18} /> Syarat & Ketentuan Pemesanan
              </h2>
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teks Ketentuan (Muncul saat pelanggan akan checkout)
                </label>
                <textarea
                  name="syaratKetentuan"
                  value={formData.syaratKetentuan}
                  onChange={handleChange}
                  rows={12}
                  className="w-full flex-1 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                  placeholder="1. Pengerjaan memakan waktu 7-14 hari kerja.&#10;2. DP yang sudah masuk tidak dapat dikembalikan.&#10;3. Kesalahan ukuran dari pihak pelanggan di luar tanggung jawab Glowear."
                />
              </div>
            </div>
          </div>

        </div>

        {/* Floating Action Bar (Bawah) */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            {saving ? "Menyimpan..." : <><Save size={20} /> Simpan Pengaturan</>}
          </button>
        </div>
      </form>
    </div>
  );
}