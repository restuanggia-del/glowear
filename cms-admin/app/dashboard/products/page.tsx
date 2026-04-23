"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Image as ImageIcon, X, Upload, Loader2, Package, Tag, AlertCircle, CheckCircle2, Info } from "lucide-react";

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

  // State Modal Tambah
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    namaProduk: "",
    deskripsi: "",
    harga: 0,
    stok: 0,
    categoryId: ""
  });

  // State Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const [editFormData, setEditFormData] = useState({
    id: "",
    namaProduk: "",
    deskripsi: "",
    harga: 0,
    stok: 0,
    categoryId: ""
  });

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
    const fetchCats = async () => {
      try {
        const res = await fetch("http://localhost:3001/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        showDialog('error', 'Koneksi Gagal', 'Gagal mengambil data kategori.');
      }
    };
    fetchCats();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/products");
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showDialog('error', 'Koneksi Gagal', 'Gagal mengambil data produk dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 1. Fungsi Tambah Produk
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showDialog('info', 'Gambar Diperlukan', 'Silakan pilih gambar produk terlebih dahulu sebelum menyimpan!');
      return;
    }

    const submitData = new FormData();
    submitData.append("namaProduk", formData.namaProduk);
    submitData.append("deskripsi", formData.deskripsi);
    submitData.append("harga", formData.harga.toString());
    submitData.append("stok", formData.stok.toString());
    submitData.append("categoryId", formData.categoryId);
    submitData.append("image", selectedFile);

    try {
      const res = await fetch("http://localhost:3001/products", {
        method: "POST",
        body: submitData,
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
        showDialog('success', 'Berhasil', 'Produk baru telah ditambahkan ke katalog.');
        setFormData({ namaProduk: "", deskripsi: "", harga: 0, stok: 0, categoryId: "" });
        setSelectedFile(null);
      } else {
        showDialog('error', 'Gagal', 'Terjadi kesalahan saat menambahkan produk.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal menghubungi server.');
    }
  };

  // 2. Fungsi Edit Produk
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append("namaProduk", editFormData.namaProduk);
    submitData.append("deskripsi", editFormData.deskripsi);
    submitData.append("harga", editFormData.harga.toString());
    submitData.append("stok", editFormData.stok.toString());
    submitData.append("categoryId", editFormData.categoryId);
    
    if (editSelectedFile) {
      submitData.append("image", editSelectedFile);
    }

    try {
      const res = await fetch(`http://localhost:3001/products/${editFormData.id}`, {
        method: "PUT",
        body: submitData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchProducts();
        showDialog('success', 'Update Berhasil', 'Informasi produk berhasil diperbarui.');
        setEditSelectedFile(null);
      } else {
        showDialog('error', 'Update Gagal', 'Gagal menyimpan perubahan produk.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal menghubungi server saat memperbarui data.');
    }
  };

  // 3. Fungsi Hapus Produk
  const handleDelete = async (id: string) => {
    showDialog('confirm', 'Hapus Produk?', 'Apakah Anda yakin ingin menghapus produk ini dari katalog secara permanen?', async () => {
      closeDialog();
      try {
        const res = await fetch(`http://localhost:3001/products/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchProducts();
          showDialog('success', 'Terhapus', 'Produk berhasil dihapus dari sistem.');
        } else {
          showDialog('error', 'Gagal', 'Tidak dapat menghapus produk ini.');
        }
      } catch (error) {
        showDialog('error', 'Kesalahan Sistem', 'Terjadi kesalahan saat menghapus data.');
      }
    });
  };

  const openEditModal = (product: Product) => {
    setEditFormData({
      id: product.id,
      namaProduk: product.namaProduk,
      deskripsi: product.deskripsi,
      harga: product.harga,
      stok: product.stok,
      categoryId: product.category?.id || ""
    });
    setIsEditModalOpen(true);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  const formatIdProduk = (id: string) => `PRD-${id.substring(0, 6).toUpperCase()}`;

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; 
    return `http://localhost:3001/uploads/${path}`;
  };

  const filteredProducts = products.filter((product) =>
    product.namaProduk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="font-sans space-y-6 pb-10 relative">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Katalog Produk</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola daftar baju polos, harga, dan ketersediaan stok Anda.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full flex items-center justify-center gap-2 transition-all active:scale-95 font-bold shadow-md shadow-blue-600/20"
        >
          <Plus size={18} className="stroke-[3px]" /> Tambah Produk
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-full max-w-md group">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-800 transition-all placeholder:text-slate-400 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-6 font-bold">ID Produk</th>
                <th className="py-4 px-6 font-bold">Info Produk</th>
                <th className="py-4 px-6 font-bold">Kategori</th>
                <th className="py-4 px-6 font-bold">Harga</th>
                <th className="py-4 px-6 font-bold">Sisa Stok</th>
                <th className="py-4 px-6 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-blue-500"/><span className="text-slate-500 font-medium">Memuat data produk...</span></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center flex flex-col items-center justify-center text-slate-500"><Package size={40} className="mb-3 text-slate-300"/><span className="font-medium">Tidak ada produk ditemukan.</span></td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {formatIdProduk(product.id)}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                        {product.gambar ? (
                          <img src={getImageUrl(product.gambar)!} alt={product.namaProduk} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon size={24} className="text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-sm mb-1">{product.namaProduk}</div>
                        <div className="text-[11px] font-medium text-slate-500 truncate max-w-[200px]">{product.deskripsi}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200 inline-flex items-center gap-1">
                        <Tag size={12} /> {product.category?.namaKategori || "Tanpa Kategori"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-black text-blue-600">{formatRupiah(product.harga)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border inline-flex items-center gap-1 
                        ${product.stok > 10 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : 
                          product.stok > 0 ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-rose-50 text-rose-600 border-rose-200"}`}>
                        {product.stok} pcs
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(product)} className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all bg-blue-50 border border-blue-100 shadow-sm" title="Edit Produk">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all bg-rose-50 border border-rose-100 shadow-sm" title="Hapus Produk">
                          <Trash2 size={16} />
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

      {/* =========================================
          MODAL TAMBAH PRODUK (Tengah Sempurna & Scrollable)
      ========================================= */}
{isModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto pt-[110px] pl-4 lg:ml-[320px] lg:pl-0 max-w-xl w-full mx-auto">
          <div className="flex min-h-full items-center justify-center p-4">
          
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
            
            {/* Header (Menempel di Atas) */}
            <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-black text-slate-800">Tambah Produk Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200">
                <X size={18} />
              </button>
            </div>
            
            {/* Isi Form (Bisa di-scroll) */}
            <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              <form id="addForm" onSubmit={handleAddSubmit} className="p-6 space-y-6">
                
                {/* Area Upload Gambar */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Foto Produk</label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-white hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group shadow-sm overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*"
                      required
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {selectedFile ? (
                      <div className="text-center z-0">
                        <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3"><ImageIcon size={32}/></div>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{selectedFile.name}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-2 bg-blue-50 py-1 px-3 rounded-full inline-block">Ganti Gambar</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center z-0">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 rounded-full flex items-center justify-center mb-3 transition-colors"><Upload size={28} /></div>
                        <p className="text-sm font-bold text-slate-700">Pilih atau seret gambar ke sini</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">Format: JPG, PNG (Maks. 2MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nama Produk</label>
                    <input type="text" required value={formData.namaProduk} placeholder="Contoh: Kaos Polos Heavyweight" className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-medium" onChange={(e) => setFormData({...formData, namaProduk: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
                    <select required value={formData.categoryId} className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.namaKategori}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Harga (Rp)</label>
                    <input type="number" required value={formData.harga || ""} placeholder="0" className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" onChange={(e) => setFormData({...formData, harga: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Stok (Pcs)</label>
                    <input type="number" required value={formData.stok || ""} placeholder="0" className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" onChange={(e) => setFormData({...formData, stok: Number(e.target.value)})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Deskripsi Produk</label>
                    <textarea required value={formData.deskripsi} placeholder="Jelaskan detail bahan, ukuran, dan fitur..." className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm custom-scrollbar" rows={3} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}></textarea>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer (Menempel di Bawah) */}
            <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-1/2 bg-white border border-slate-200 text-slate-600 py-3 rounded-full font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Batal</button>
              <button type="submit" form="addForm" className="w-full sm:w-1/2 bg-blue-600 text-white py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20">Simpan Produk</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL EDIT PRODUK (Tengah Sempurna & Scrollable)
      ========================================= */}
{isEditModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto pt-[110px] pl-4 lg:ml-[320px] lg:pl-0 max-w-xl w-full mx-auto">
          <div className="flex min-h-full items-center justify-center p-4">
          
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden">
            
            {/* Header (Menempel di Atas) */}
            <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-black text-slate-800">Edit Data Produk</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200">
                <X size={18} />
              </button>
            </div>
            
            {/* Isi Form (Bisa di-scroll) */}
            <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              <form id="editForm" onSubmit={handleEditSubmit} className="p-6 space-y-6">
                
                {/* Area Upload Gambar */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Ganti Foto Produk <span className="normal-case tracking-normal font-medium text-slate-400">(Opsional)</span></label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-white hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group shadow-sm overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setEditSelectedFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {editSelectedFile ? (
                      <div className="text-center z-0">
                        <p className="text-sm font-bold text-blue-600 truncate max-w-xs">{editSelectedFile.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Siap Diunggah</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center z-0">
                        <Upload size={24} className="mb-2 text-slate-300 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm font-bold text-slate-600">Pilih gambar baru</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nama Produk</label>
                    <input type="text" required value={editFormData.namaProduk} className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" onChange={(e) => setEditFormData({...editFormData, namaProduk: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
                    <select required value={editFormData.categoryId} className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" onChange={(e) => setEditFormData({...editFormData, categoryId: e.target.value})}>
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.namaKategori}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Harga (Rp)</label>
                    <input type="number" required value={editFormData.harga} className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" onChange={(e) => setEditFormData({...editFormData, harga: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Stok (Pcs)</label>
                    <input type="number" required value={editFormData.stok} className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" onChange={(e) => setEditFormData({...editFormData, stok: Number(e.target.value)})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Deskripsi Produk</label>
                    <textarea required value={editFormData.deskripsi} className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm custom-scrollbar" rows={3} onChange={(e) => setEditFormData({...editFormData, deskripsi: e.target.value})}></textarea>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer (Menempel di Bawah) */}
            <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3 shrink-0">
              <button type="button" onClick={() => { setIsEditModalOpen(false); setEditSelectedFile(null); }} className="w-full sm:w-1/2 bg-white border border-slate-200 text-slate-600 py-3 rounded-full font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Batal</button>
              <button type="submit" form="editForm" className="w-full sm:w-1/2 bg-blue-600 text-white py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20">Simpan Perubahan</button>
            </div>
          </div>
        </div>
        </div>
      )}

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