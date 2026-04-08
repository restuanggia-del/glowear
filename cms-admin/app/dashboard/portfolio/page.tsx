"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Tag, FileText, Camera } from "lucide-react";

export default function PortfolioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ judul: "", deskripsi: "", kategori: "Kaos" });

  const fetchPortfolio = async () => {
    const res = await fetch("http://localhost:3001/portfolio");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Pilih foto hasil sablon!");

    const formData = new FormData();
    formData.append("gambar", file);
    formData.append("judul", form.judul);
    formData.append("deskripsi", form.deskripsi);
    formData.append("kategori", form.kategori);

    const res = await fetch("http://localhost:3001/portfolio", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setFile(null);
      setForm({ judul: "", deskripsi: "", kategori: "Kaos" });
      fetchPortfolio();
      alert("Portofolio berhasil ditambahkan!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus item portofolio ini?")) return;
    await fetch(`http://localhost:3001/portfolio/${id}`, { method: "DELETE" });
    fetchPortfolio();
  };

  return (
    <div className="font-sans space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Portofolio</h1>
          <p className="text-sm text-gray-500 mt-1">Galeri hasil pengerjaan terbaik untuk meyakinkan calon pelanggan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Form Input */}
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-5">
          <h2 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
            <Plus size={18}/> Tambah Karya
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Judul Karya</label>
              <input type="text" required value={form.judul} onChange={(e)=>setForm({...form, judul: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" placeholder="Misal: Kaos Komunitas Motor" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
              <select value={form.kategori} onChange={(e)=>setForm({...form, kategori: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 bg-white">
                <option value="Kaos">Kaos</option>
                <option value="Hoodie">Hoodie</option>
                <option value="Polo">Polo</option>
                <option value="Kemeja">Kemeja/Seragam</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Deskripsi Singkat</label>
              <textarea value={form.deskripsi} onChange={(e)=>setForm({...form, deskripsi: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 h-24 resize-none" placeholder="Detail sablon atau bahan..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Foto Hasil Jadi</label>
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                <Camera className="mx-auto text-gray-400 mb-2" size={24} />
                <span className="text-xs text-blue-600 font-bold block">Pilih Gambar</span>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} accept="image/*" />
              </div>
              {file && <p className="text-[10px] text-gray-500 mt-2 italic">{file.name}</p>}
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
              Simpan ke Galeri
            </button>
          </form>
        </div>

        {/* Display Galeri */}
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                <div className="relative h-56 overflow-hidden">
                  <img src={`http://localhost:3001/uploads/portfolio/${item.gambar}`} alt={item.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                      {item.kategori}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{item.judul}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.deskripsi || "Tanpa deskripsi."}</p>
                </div>
              </div>
            ))}
          </div>
          {items.length === 0 && !loading && (
            <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center">
              <ImageIcon className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-medium font-sans">Belum ada karya yang dipamerkan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}