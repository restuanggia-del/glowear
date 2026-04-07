"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from "lucide-react";

// Interface untuk TypeScript agar tahu bentuk data produk kita
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

  // Fungsi untuk mengambil data dari Backend NestJS
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/products");
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fungsi untuk format mata uang Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // Filter produk berdasarkan search bar
  const filteredProducts = products.filter((product) =>
    product.namaProduk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua produk Glowear Anda di sini.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm">
          <Plus size={20} />
          Tambah Produk
        </button>
      </div>

      {/* Card Wrapper untuk Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar (Search) */}
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
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all text-black"
            />
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="py-3 px-6 font-semibold">Info Produk</th>
                <th className="py-3 px-6 font-semibold">Kategori</th>
                <th className="py-3 px-6 font-semibold">Harga</th>
                <th className="py-3 px-6 font-semibold">Stok</th>
                <th className="py-3 px-6 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6 flex items-center gap-4">
                      {/* Thumbnail Gambar */}
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
                    <td className="py-4 px-6 font-medium text-gray-800">
                      {formatRupiah(product.harga)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                        product.stok > 10 ? "bg-green-100 text-green-700" : 
                        product.stok > 0 ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                      }`}>
                        {product.stok} pcs
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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
  );
}