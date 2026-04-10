"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Edit, X, Loader2, Layers, AlertCircle, CheckCircle2, Info } from "lucide-react";

interface Category {
  id: string;
  namaKategori: string;
  deskripsi: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ namaKategori: "", deskripsi: "" });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3001/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      showDialog('error', 'Koneksi Gagal', 'Gagal mengambil data kategori dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Fungsi Tambah Kategori
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
        showDialog('success', 'Berhasil', 'Kategori baru telah ditambahkan ke katalog.');
      } else {
        showDialog('error', 'Gagal', 'Terjadi kesalahan saat menyimpan kategori baru.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal menghubungi server.');
    }
  };

  // Fungsi Hapus Kategori
  const handleDelete = async (id: string) => {
    showDialog('confirm', 'Hapus Kategori?', 'Kategori ini akan dihapus dari sistem. Pastikan tidak ada produk yang masih menggunakan kategori ini.', async () => {
      closeDialog();
      try {
        const res = await fetch(`http://localhost:3001/categories/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchCategories();
          showDialog('success', 'Terhapus', 'Kategori berhasil dihapus dari sistem.');
        } else {
          showDialog('error', 'Penghapusan Ditolak', 'Gagal menghapus kategori. Kemungkinan masih ada produk yang terkait dengan kategori ini.');
        }
      } catch (error) {
        showDialog('error', 'Kesalahan Sistem', 'Terjadi kesalahan saat menghapus data.');
      }
    });
  };

  // Fungsi Update Kategori
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const res = await fetch(`http://localhost:3001/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaKategori: editingCategory.namaKategori,
          deskripsi: editingCategory.deskripsi,
        }),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingCategory(null);
        fetchCategories();
        showDialog('success', 'Update Berhasil', 'Informasi kategori telah diperbarui.');
      } else {
        showDialog('error', 'Update Gagal', 'Gagal menyimpan perubahan kategori.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal menghubungi server saat memperbarui data.');
    }
  };

  return (
    <div className="font-sans space-y-6 pb-10 relative">
      
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Kategori Produk</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Kelola klasifikasi baju polos untuk mempermudah navigasi pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Tambah Kategori */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Plus size={20} className="stroke-[3px]" />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Tambah Kategori</h2>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={newCat.namaKategori}
                  onChange={(e) => setNewCat({ ...newCat, namaKategori: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="Contoh: Kaos Polos"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Deskripsi <span className="normal-case tracking-normal font-medium text-slate-400">(Opsional)</span></label>
                <textarea
                  value={newCat.deskripsi}
                  onChange={(e) => setNewCat({ ...newCat, deskripsi: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 custom-scrollbar"
                  rows={4}
                  placeholder="Bahan, jenis, atau karakteristik kategori ini..."
                />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 mt-2">
                Simpan Kategori Baru
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Kategori */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4 font-bold">Informasi Kategori</th>
                    <th className="px-6 py-4 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={2} className="py-16 text-center">
                        <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-3" />
                        <span className="text-slate-500 font-medium">Memuat data kategori...</span>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
                        <Layers size={40} className="text-slate-300 mb-3" />
                        <span className="font-medium">Belum ada kategori tersimpan.</span>
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                              <Tag size={18} />
                            </div>
                            <div>
                              <p className="font-black text-slate-800 text-sm mb-1">{cat.namaKategori}</p>
                              <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-md">{cat.deskripsi || <span className="italic text-slate-400">Tidak ada deskripsi.</span>}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-middle">
                          <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingCategory(cat); setIsEditModalOpen(true); }} 
                              className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all bg-blue-50 border border-blue-100 shadow-sm"
                              title="Edit Kategori"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(cat.id)} 
                              className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all bg-rose-50 border border-rose-100 shadow-sm"
                              title="Hapus Kategori"
                            >
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
        </div>
      </div>

      {/* =========================================
          MODAL EDIT KATEGORI (Terpusat Sempurna)
      ========================================= */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
            
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md text-left overflow-hidden animate-in fade-in zoom-in-95 duration-200 sm:my-8 border border-slate-100">
              
              <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-800">Edit Kategori</h3>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200">
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-6 space-y-5 bg-slate-50/50">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Nama Kategori</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.namaKategori}
                    onChange={(e) => setEditingCategory({ ...editingCategory, namaKategori: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Deskripsi</label>
                  <textarea
                    value={editingCategory.deskripsi || ""}
                    onChange={(e) => setEditingCategory({ ...editingCategory, deskripsi: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm custom-scrollbar"
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-3 pt-4 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-full font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-blue-600 text-white py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20"
                  >
                    Simpan Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          CUSTOM DIALOG SYSTEM (Pengganti Alert)
      ========================================= */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => dialog.type !== 'confirm' && closeDialog()}></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200 sm:my-8 border border-slate-100">
              
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
                    Ya, Hapus
                  </button>
                </div>
              ) : (
                <button onClick={closeDialog} className="w-full py-3 rounded-full font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 transition-all active:scale-95">
                  Mengerti
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}