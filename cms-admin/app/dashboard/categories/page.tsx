"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag } from "lucide-react";

interface Category {
  id: string;
  namaKategori: string;
  deskripsi: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ namaKategori: "", deskripsi: "" });

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3001/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat),
      });
      if (res.ok) {
        setNewCat({ namaKategori: "", deskripsi: "" });
        fetchCategories();
      }
    } catch (error) {
      alert("Gagal menambah kategori");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      const res = await fetch(`http://localhost:3001/categories/${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
      else alert("Gagal hapus (Mungkin masih ada produk di kategori ini)");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Tambah Kategori */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Tambah Kategori</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
              <input
                type="text"
                required
                value={newCat.namaKategori}
                onChange={(e) => setNewCat({ ...newCat, namaKategori: e.target.value })}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
                placeholder="Contoh: Kaos Polos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={newCat.deskripsi}
                onChange={(e) => setNewCat({ ...newCat, deskripsi: e.target.value })}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black"
                rows={3}
                placeholder="Opsional..."
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Plus size={18} /> Simpan Kategori
            </button>
          </form>
        </div>
      </div>

      {/* Daftar Kategori */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Kategori</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={2} className="p-10 text-center text-gray-400 text-sm italic">Memuat...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={2} className="p-10 text-center text-gray-400 text-sm">Belum ada kategori.</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Tag size={18} /></div>
                        <div>
                          <p className="font-medium text-gray-800">{cat.namaKategori}</p>
                          <p className="text-xs text-gray-500">{cat.deskripsi || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
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