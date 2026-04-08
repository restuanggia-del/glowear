"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, Plus, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [judul, setJudul] = useState("");
  const [link, setLink] = useState("");

  const fetchBanners = async () => {
    const res = await fetch("http://localhost:3001/banners");
    const data = await res.json();
    setBanners(data);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Pilih gambar terlebih dahulu");

    const formData = new FormData();
    formData.append("gambar", file);
    formData.append("judul", judul);
    formData.append("link", link);

    const res = await fetch("http://localhost:3001/banners", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setFile(null); setJudul(""); setLink("");
      fetchBanners();
      alert("Banner berhasil diunggah!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus banner ini?")) return;
    await fetch(`http://localhost:3001/banners/${id}`, { method: "DELETE" });
    fetchBanners();
  };

  return (
    <div className="font-sans space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Banner Promo</h1>
        <p className="text-sm text-gray-500 mt-1">Gambar ini akan tampil sebagai slider di halaman utama aplikasi mobile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Upload */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-sm font-bold text-gray-400 uppercase mb-5 flex items-center gap-2">
            <Plus size={18}/> Tambah Banner Baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Promo</label>
              <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} required className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" placeholder="Misal: Diskon Ramadhan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Tujuan (Opsional)</label>
              <div className="flex items-center border border-gray-200 rounded-lg px-3 bg-white focus-within:border-blue-500">
                <LinkIcon size={14} className="text-gray-400" />
                <input type="text" value={link} onChange={(e) => setLink(e.target.value)} className="w-full p-2.5 text-sm outline-none" placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File Gambar (Rekomendasi 16:9)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-10 w-10 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">Klik untuk upload</span>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                </div>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/*" />
              </div>
              {file && <p className="text-xs text-blue-600 mt-2 font-medium italic">Selected: {file.name}</p>}
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
              Unggah Banner
            </button>
          </form>
        </div>

        {/* List Banner */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
            <ImageIcon size={18}/> Banner Aktif
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <img src={`http://localhost:3001/uploads/banners/${b.gambar}`} alt={b.judul} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-sm">{b.judul}</h3>
                  <p className="text-xs text-gray-500 truncate">{b.link || "No Link"}</p>
                </div>
                <button 
                  onClick={() => handleDelete(b.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          {banners.length === 0 && !loading && (
            <div className="bg-white p-10 rounded-2xl border border-dashed text-center text-gray-400">
              Belum ada banner promo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}