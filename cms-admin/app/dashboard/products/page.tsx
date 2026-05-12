"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Image as ImageIcon, X, Upload, Loader2, Package, Tag, AlertCircle, CheckCircle2, Info } from "lucide-react";
import Skeleton from "@/app/components/Skeleton";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    namaProduk: "",
    deskripsi: "",
    harga: 0,
    stok: 0,
    categoryId: ""
  });

  // State Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSelectedFiles, setEditSelectedFiles] = useState<File[]>([]);
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
    
    if (selectedFiles.length === 0) {
      showDialog('info', 'Gambar Diperlukan', 'Silakan pilih minimal satu gambar produk terlebih dahulu!');
      return;
    }

    const submitData = new FormData();
    submitData.append("namaProduk", formData.namaProduk);
    submitData.append("deskripsi", formData.deskripsi);
    submitData.append("harga", formData.harga.toString());
    submitData.append("stok", formData.stok.toString());
    submitData.append("categoryId", formData.categoryId);
    
    selectedFiles.forEach(file => {
      submitData.append("image", file);
    });

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
        setSelectedFiles([]);
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
    
    if (editSelectedFiles.length > 0) {
      editSelectedFiles.forEach(file => {
        submitData.append("image", file);
      });
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
        setEditSelectedFiles([]);
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

  const getPhotoArray = (fotoString: string | null) => {
    if (!fotoString) return [];
    try {
      const parsed = JSON.parse(fotoString);
      return Array.isArray(parsed) ? parsed : [fotoString];
    } catch (e) {
      return [fotoString];
    }
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
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="py-4 px-6"><Skeleton className="h-6 w-24" /></td>
                    <td className="py-4 px-6 flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="py-4 px-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-4 px-6"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-4 px-6"><div className="flex justify-center gap-2"><Skeleton className="h-9 w-9 rounded-lg" /><Skeleton className="h-9 w-9 rounded-lg" /></div></td>
                  </tr>
                ))
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
                      <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0 shadow-sm relative">
                        {product.gambar ? (
                          <>
                            <img src={getImageUrl(getPhotoArray(product.gambar)[0])!} alt={product.namaProduk} className="h-full w-full object-cover" />
                            {getPhotoArray(product.gambar).length > 1 && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-black text-white">
                                +{getPhotoArray(product.gambar).length - 1}
                              </div>
                            )}
                          </>
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
      {/* =========================================
          MODAL TAMBAH PRODUK (PREMIUM OVERHAUL)
      ========================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20 flex flex-col max-h-[90vh]">
            
            {/* Header Modern */}
            <div className="p-8 pb-4 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                   <Plus size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">Tambah Produk</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Katalog Baru Glowear</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all border border-slate-100">
                <X size={20} />
              </button>
            </div>
            
            {/* Form Content (Scrollable) */}
            <div className="overflow-y-auto custom-scrollbar flex-1 px-8 py-4">
              <form id="addForm" onSubmit={handleAddSubmit} className="space-y-8">
                
                {/* Modern Image Upload */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Galeri Produk (Maks. 5)</label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer group shadow-inner overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      required
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 5) {
                          showDialog('info', 'Batas Maksimal', 'Maksimal 5 gambar diperbolehkan.');
                          setSelectedFiles(files.slice(0, 5));
                        } else {
                          setSelectedFiles(files);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {selectedFiles.length > 0 ? (
                      <div className="flex flex-wrap gap-3 justify-center z-0 relative">
                        {selectedFiles.map((file, i) => (
                          <div key={i} className="relative w-20 h-20 bg-white rounded-2xl overflow-hidden border-2 border-white shadow-lg rotate-2 even:-rotate-2 hover:rotate-0 transition-transform">
                             <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <div className="w-full text-center mt-6">
                           <p className="text-[13px] font-black text-slate-800 tracking-tight">{selectedFiles.length} Gambar Terpilih</p>
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 py-1.5 px-4 rounded-full inline-block mt-2 border border-blue-100">Klik untuk ganti semua</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center z-0">
                        <div className="w-20 h-20 bg-white text-slate-300 group-hover:text-blue-500 group-hover:scale-110 rounded-[1.5rem] flex items-center justify-center mb-4 transition-all shadow-sm border border-slate-100"><Upload size={32} /></div>
                        <p className="text-sm font-black text-slate-700">Tarik gambar ke sini</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Atau klik untuk browse</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Nama Produk</label>
                    <input type="text" required value={formData.namaProduk} placeholder="Contoh: Heavy Cotton T-Shirt 24s" className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all" onChange={(e) => setFormData({...formData, namaProduk: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Pilih Kategori</label>
                    <select required value={formData.categoryId} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none" onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.namaKategori}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Harga Satuan (Rp)</label>
                    <input type="number" required value={formData.harga || ""} placeholder="0" className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-blue-600 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all" onChange={(e) => setFormData({...formData, harga: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Persediaan Stok</label>
                    <input type="number" required value={formData.stok || ""} placeholder="0" className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-800 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all" onChange={(e) => setFormData({...formData, stok: Number(e.target.value)})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Deskripsi Lengkap</label>
                    <textarea required value={formData.deskripsi} placeholder="Spesifikasi bahan, ukuran, dll..." className="w-full border-2 border-slate-100 rounded-[1.5rem] p-4 text-sm font-medium text-slate-600 bg-slate-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all custom-scrollbar" rows={3} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}></textarea>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Modern */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">
                Batal
              </button>
              <button type="submit" form="addForm" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition-all active:scale-95">
                Simpan Katalog
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =========================================
          MODAL EDIT PRODUK (PREMIUM OVERHAUL)
      ========================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20 flex flex-col max-h-[90vh]">
            
            {/* Header Modern */}
            <div className="p-8 pb-4 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                   <Edit size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-none">Edit Produk</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Perbarui Katalog Glowear</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all border border-slate-100">
                <X size={20} />
              </button>
            </div>
            
            {/* Form Content (Scrollable) */}
            <div className="overflow-y-auto custom-scrollbar flex-1 px-8 py-4">
              <form id="editForm" onSubmit={handleEditSubmit} className="space-y-8">
                
                {/* Modern Image Upload */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Ganti Galeri <span className="normal-case tracking-normal font-medium text-slate-300">(Opsional)</span></label>
                  <div className="relative border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white hover:border-amber-400 transition-all cursor-pointer group shadow-inner overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 5) {
                          showDialog('info', 'Batas Maksimal', 'Maksimal 5 gambar diperbolehkan.');
                          setEditSelectedFiles(files.slice(0, 5));
                        } else {
                          setEditSelectedFiles(files);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {editSelectedFiles.length > 0 ? (
                      <div className="flex flex-wrap gap-2 justify-center z-0 relative">
                        {editSelectedFiles.map((file, i) => (
                          <div key={i} className="relative w-16 h-16 bg-white rounded-xl overflow-hidden border border-white shadow-md">
                             <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <div className="w-full text-center mt-3">
                           <p className="text-[13px] font-black text-slate-800 tracking-tight">{editSelectedFiles.length} Gambar Baru</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center z-0">
                        <Upload size={24} className="mb-2 text-slate-300 group-hover:text-amber-500 group-hover:scale-110 transition-all" />
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Unggah untuk ganti semua foto</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Nama Produk</label>
                    <input type="text" required value={editFormData.namaProduk} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 bg-slate-50/50 outline-none focus:border-amber-500 focus:bg-white transition-all" onChange={(e) => setEditFormData({...editFormData, namaProduk: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Pilih Kategori</label>
                    <select required value={editFormData.categoryId} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-800 bg-slate-50/50 outline-none focus:border-amber-500 focus:bg-white transition-all appearance-none" onChange={(e) => setEditFormData({...editFormData, categoryId: e.target.value})}>
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.namaKategori}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Harga Satuan (Rp)</label>
                    <input type="number" required value={editFormData.harga} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-amber-600 bg-slate-50/50 outline-none focus:border-amber-500 focus:bg-white transition-all" onChange={(e) => setEditFormData({...editFormData, harga: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Persediaan Stok</label>
                    <input type="number" required value={editFormData.stok} className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm font-black text-slate-800 bg-slate-50/50 outline-none focus:border-amber-500 focus:bg-white transition-all" onChange={(e) => setEditFormData({...editFormData, stok: Number(e.target.value)})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Deskripsi Lengkap</label>
                    <textarea required value={editFormData.deskripsi} className="w-full border-2 border-slate-100 rounded-[1.5rem] p-4 text-sm font-medium text-slate-600 bg-slate-50/50 outline-none focus:border-amber-500 focus:bg-white transition-all custom-scrollbar" rows={3} onChange={(e) => setEditFormData({...editFormData, deskripsi: e.target.value})}></textarea>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Modern */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0">
              <button type="button" onClick={() => { setIsEditModalOpen(false); setEditSelectedFiles([]); }} className="flex-1 py-4 bg-white text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">
                Batal
              </button>
              <button type="submit" form="editForm" className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 shadow-xl shadow-amber-600/30 transition-all active:scale-95">
                Update Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          CUSTOM DIALOG SYSTEM
      ========================================= */}
            {/* =========================================
          DIALOG KONFIRMASI (PREMIUM ALERT)
      ========================================= */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={closeDialog}></div>
          
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20 p-8 text-center">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${dialog.type === 'confirm' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
              {dialog.type === 'confirm' ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">{dialog.title}</h3>
            <p className="text-slate-500 font-medium text-[13px] mb-8 leading-relaxed px-2">{dialog.message}</p>
            
            <div className="flex flex-col gap-3">
              {dialog.type === 'confirm' ? (
                <>
                  <button onClick={dialog.onConfirm} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-95">
                    Ya, Lanjutkan
                  </button>
                  <button onClick={closeDialog} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">
                    Batalkan
                  </button>
                </>
              ) : (
                <button onClick={closeDialog} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
                  Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}