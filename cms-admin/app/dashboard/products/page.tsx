"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Image as ImageIcon, X } from "lucide-react";

interface Category {
  id: string;
  namaKategori: string;
}

interface Product {
  id: string;
  namaProduk: string;
  deskripsi: string;
  harga: number;
  stok: number;
  gambar: string | null;
  category: Category;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // State untuk Modal Tambah
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    namaProduk: "",
    deskripsi: "",
    harga: 0,
    stok: 0,
    gambar: "",
    categoryId: ""
  });

  // State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    namaProduk: "",
    deskripsi: "",
    harga: 0,
    stok: 0,
    gambar: "",
    categoryId: ""
  });

  // Fetch Kategori
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch("http://localhost:3001/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Gagal mengambil kategori", error);
      }
    };
    fetchCats();
  }, []);

  // Fetch Produk
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/products");
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 1. Fungsi Tambah Produk (POST)
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          harga: Number(formData.harga),
          stok: Number(formData.stok)
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
        alert("Produk berhasil ditambah!");
        setFormData({ namaProduk: "", deskripsi: "", harga: 0, stok: 0, gambar: "", categoryId: "" });
      } else {
        alert("Gagal menambahkan produk.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    }
  };

  // 2. Fungsi Edit Produk (PUT)
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/products/${editFormData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaProduk: editFormData.namaProduk,
          deskripsi: editFormData.deskripsi,
          harga: Number(editFormData.harga),
          stok: Number(editFormData.stok),
          gambar: editFormData.gambar,
          categoryId: editFormData.categoryId
        }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchProducts();
        alert("Produk berhasil diupdate!");
      } else {
        alert("Gagal mengupdate produk.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    }
  };

  // 3. Fungsi Hapus Produk (DELETE)
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      const res = await fetch(`http://localhost:3001/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    }
  };

  // Persiapan data untuk modal Edit
  const openEditModal = (product: Product) => {
    setEditFormData({
      id: product.id,
      namaProduk: product.namaProduk,
      deskripsi: product.deskripsi,
      harga: product.harga,
      stok: product.stok,
      gambar: product.gambar || "",
      categoryId: product.category?.id || ""
    });
    setIsEditModalOpen(true);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  // Format ID produk menjadi kode pendek (misal: PRD-1a2b3c)
  const formatIdProduk = (id: string) => {
    return `PRD-${id.substring(0, 6).toUpperCase()}`;
  };

  const filteredProducts = products.filter((product) =>
    product.namaProduk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
            <p className="text-gray-500 text-sm mt-1">Kelola semua produk Glowear Anda di sini.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} /> Tambah Produk
          </button>
        </div>

        {/* Card & Tabel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="py-3 px-6 font-semibold">ID Produk</th>
                  <th className="py-3 px-6 font-semibold">Info Produk</th>
                  <th className="py-3 px-6 font-semibold">Kategori</th>
                  <th className="py-3 px-6 font-semibold">Harga</th>
                  <th className="py-3 px-6 font-semibold">Stok</th>
                  <th className="py-3 px-6 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-500">Memuat data...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-500">Tidak ada produk.</td></tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* Kolom ID Produk */}
                      <td className="py-4 px-6 font-mono text-sm text-gray-600">
                        {formatIdProduk(product.id)}
                      </td>
                      {/* Kolom Info */}
                      <td className="py-4 px-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                          {product.gambar ? (
                            <img src={product.gambar} alt={product.namaProduk} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{product.namaProduk}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.deskripsi}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">
                          {product.category?.namaKategori || "Tanpa Kategori"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-800">{formatRupiah(product.harga)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${product.stok > 10 ? "bg-green-100 text-green-700" : product.stok > 0 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"}`}>
                          {product.stok} pcs
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tambah Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Tambah Produk Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 text-black">
                  <label className="block text-sm font-medium mb-1">Nama Produk</label>
                  <input type="text" required value={formData.namaProduk} className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setFormData({...formData, namaProduk: e.target.value})} />
                </div>
                <div className="col-span-2 text-black">
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select required value={formData.categoryId} className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.namaKategori}</option>)}
                  </select>
                </div>
                <div className="text-black">
                  <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
                  <input type="number" required value={formData.harga || ""} className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setFormData({...formData, harga: Number(e.target.value)})} />
                </div>
                <div className="text-black">
                  <label className="block text-sm font-medium mb-1">Stok</label>
                  <input type="number" required value={formData.stok || ""} className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setFormData({...formData, stok: Number(e.target.value)})} />
                </div>
                {/* Input URL Gambar */}
                <div className="col-span-2 text-black">
                  <label className="block text-sm font-medium mb-1">URL Gambar (Opsional)</label>
                  <input type="text" value={formData.gambar} placeholder="https://link-gambar.com/baju.jpg" className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setFormData({...formData, gambar: e.target.value})} />
                </div>
              </div>
              <div className="text-black">
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea required value={formData.deskripsi} className="w-full border rounded-lg p-2.5 text-sm" rows={3} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}></textarea>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium">Batal</button>
                <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700">Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Produk */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Edit Produk</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 text-black">
                  <label className="block text-sm font-medium mb-1">Nama Produk</label>
                  <input type="text" required value={editFormData.namaProduk} className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setEditFormData({...editFormData, namaProduk: e.target.value})} />
                </div>
                <div className="col-span-2 text-black">
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select required value={editFormData.categoryId} className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setEditFormData({...editFormData, categoryId: e.target.value})}>
                    <option value="">Pilih Kategori</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.namaKategori}</option>)}
                  </select>
                </div>
                <div className="text-black">
                  <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
                  <input type="number" required value={editFormData.harga} className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setEditFormData({...editFormData, harga: Number(e.target.value)})} />
                </div>
                <div className="text-black">
                  <label className="block text-sm font-medium mb-1">Stok</label>
                  <input type="number" required value={editFormData.stok} className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setEditFormData({...editFormData, stok: Number(e.target.value)})} />
                </div>
                <div className="col-span-2 text-black">
                  <label className="block text-sm font-medium mb-1">URL Gambar (Opsional)</label>
                  <input type="text" value={editFormData.gambar} placeholder="https://link-gambar.com/baju.jpg" className="w-full border rounded-lg p-2.5 text-sm" onChange={(e) => setEditFormData({...editFormData, gambar: e.target.value})} />
                </div>
              </div>
              <div className="text-black">
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea required value={editFormData.deskripsi} className="w-full border rounded-lg p-2.5 text-sm" rows={3} onChange={(e) => setEditFormData({...editFormData, deskripsi: e.target.value})}></textarea>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-50">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium">Batal</button>
                <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}