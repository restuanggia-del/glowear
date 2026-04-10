"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Tag, FileText, Camera, Upload, Edit, Loader2, AlertCircle, CheckCircle2, X, Info, Maximize2 } from "lucide-react";

export default function PortfolioPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form Tambah
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ judul: "", deskripsi: "", kategori: "Kaos" });

  // State Form Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({ judul: "", deskripsi: "", kategori: "Kaos" });

  // State Zoom Gambar
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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

  const fetchPortfolio = async () => {
    try {
      const res = await fetch("http://localhost:3001/portfolio");
      const data = await res.json();
      setItems(data);
    } catch (error) {
      showDialog('error', 'Koneksi Gagal', 'Gagal mengambil data portofolio dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  // 1. Fungsi Tambah
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showDialog('info', 'Gambar Diperlukan', 'Silakan pilih foto hasil pengerjaan terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.append("gambar", file);
    formData.append("judul", form.judul);
    formData.append("deskripsi", form.deskripsi);
    formData.append("kategori", form.kategori);

    try {
      const res = await fetch("http://localhost:3001/portfolio", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFile(null);
        setForm({ judul: "", deskripsi: "", kategori: "Kaos" });
        fetchPortfolio();
        showDialog('success', 'Karya Tersimpan!', 'Item portofolio berhasil ditambahkan ke galeri publik.');
      } else {
        showDialog('error', 'Upload Gagal', 'Terjadi kesalahan saat menyimpan karya.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal terhubung ke server.');
    }
  };

  // 2. Fungsi Buka Modal Edit
  const openEditModal = (item: any) => {
    setEditingItem(item);
    setEditForm({
      judul: item.judul,
      deskripsi: item.deskripsi || "",
      kategori: item.kategori || "Kaos"
    });
    setEditFile(null);
    setIsEditModalOpen(true);
  };

  // 3. Fungsi Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("judul", editForm.judul);
    formData.append("deskripsi", editForm.deskripsi);
    formData.append("kategori", editForm.kategori);
    if (editFile) {
      formData.append("gambar", editFile);
    }

    try {
      const res = await fetch(`http://localhost:3001/portfolio/${editingItem.id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchPortfolio();
        showDialog('success', 'Update Berhasil', 'Informasi portofolio telah diperbarui.');
      } else {
        showDialog('error', 'Update Gagal', 'Terjadi kesalahan saat menyimpan perubahan portofolio.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal terhubung ke server saat memperbarui data.');
    }
  };

  // 4. Fungsi Hapus
  const handleDelete = async (id: string, title: string) => {
    showDialog('confirm', 'Hapus Karya', `Apakah Anda yakin ingin menghapus "${title}" dari galeri portofolio?`, async () => {
      closeDialog();
      try {
        const res = await fetch(`http://localhost:3001/portfolio/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchPortfolio();
          showDialog('success', 'Terhapus', 'Karya berhasil dihapus dari galeri.');
        } else {
          showDialog('error', 'Gagal', 'Tidak dapat menghapus item ini.');
        }
      } catch (error) {
        showDialog('error', 'Kesalahan Sistem', 'Terjadi kesalahan saat menghapus data.');
      }
    });
  };

  return (
    <div className="font-sans space-y-6 pb-10 relative">
      
      {/* Header Halaman */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Portofolio</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Pamerkan hasil pengerjaan sablon dan jahit terbaik Anda untuk meyakinkan calon pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* =========================================
            KOLOM KIRI: FORM TAMBAH KARYA
        ========================================= */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28 space-y-5">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Plus size={20} className="stroke-[3px]" />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Tambah Karya</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Judul Karya</label>
                <input 
                  type="text" 
                  required 
                  value={form.judul} 
                  onChange={(e)=>setForm({...form, judul: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium" 
                  placeholder="Misal: Sablon Plastisol Reuni" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategori Produk</label>
                <select 
                  value={form.kategori} 
                  onChange={(e)=>setForm({...form, kategori: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="Kaos">Kaos</option>
                  <option value="Hoodie">Hoodie</option>
                  <option value="Polo">Polo</option>
                  <option value="Kemeja">Kemeja/Seragam</option>
                  <option value="Jaket">Jaket</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Deskripsi Detail <span className="normal-case tracking-normal font-medium text-slate-400">(Opsional)</span></label>
                <textarea 
                  value={form.deskripsi} 
                  onChange={(e)=>setForm({...form, deskripsi: e.target.value})} 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 custom-scrollbar resize-none" 
                  rows={3} 
                  placeholder="Jelaskan jenis sablon, kerumitan, atau jumlah pcs..." 
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Foto Hasil Jadi</label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-white hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group shadow-sm overflow-hidden">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                    accept="image/*" 
                  />
                  {file ? (
                    <div className="text-center z-0">
                      <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2"><ImageIcon size={24}/></div>
                      <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1 bg-blue-50 py-1 px-3 rounded-full inline-block">Siap Diunggah</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center z-0">
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 rounded-full flex items-center justify-center mb-2 transition-colors"><Camera size={24} /></div>
                      <p className="text-sm font-bold text-slate-700">Pilih gambar karya</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 mt-2">
                Simpan ke Galeri
              </button>
            </form>
          </div>
        </div>

        {/* =========================================
            KOLOM KANAN: DISPLAY GALERI
        ========================================= */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={18}/> Etalase Portofolio
              </h2>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{items.length} Karya</span>
            </div>

            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
                <span className="text-slate-500 font-medium text-sm">Memuat galeri...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                <ImageIcon size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">Belum Ada Karya</h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm">Galeri portofolio masih kosong. Tambahkan hasil pengerjaan terbaik Anda di kolom sebelah kiri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                    
                    {/* Gambar Portofolio */}
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img 
                        src={`http://localhost:3001/uploads/portfolio/${item.gambar}`} 
                        alt={item.judul} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} 
                      />
                      <ImageIcon size={32} className="text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />
                      
                      {/* Badge Kategori */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md border border-white/10">
                          {item.kategori}
                        </span>
                      </div>

                      {/* Tombol Aksi Hover */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <button 
                          onClick={() => setZoomedImage(`http://localhost:3001/uploads/portfolio/${item.gambar}`)}
                          className="p-3 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-full transition-all scale-75 group-hover:scale-100"
                          title="Lihat Penuh"
                        >
                          <Maximize2 size={20} />
                        </button>
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-3 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-full transition-all scale-75 group-hover:scale-100"
                          title="Edit Info"
                        >
                          <Edit size={20} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, item.judul)}
                          className="p-3 bg-white/20 hover:bg-white text-white hover:text-rose-600 rounded-full transition-all scale-75 group-hover:scale-100"
                          title="Hapus Karya"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Info Portofolio */}
                    <div className="p-5 flex-1 flex flex-col bg-white">
                      <h3 className="font-black text-slate-800 text-sm mb-1.5 line-clamp-2 leading-tight">{item.judul}</h3>
                      <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed">{item.deskripsi || <span className="italic text-slate-400">Tidak ada deskripsi.</span>}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          MODAL EDIT PORTOFOLIO (Terpusat)
      ========================================= */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md text-left overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-black text-slate-800">Edit Portofolio</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              <form id="editPortfolioForm" onSubmit={handleEditSubmit} className="p-6 space-y-5">
                
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Judul Karya</label>
                  <input 
                    type="text" 
                    value={editForm.judul} 
                    onChange={(e) => setEditForm({...editForm, judul: e.target.value})} 
                    required 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
                  <select 
                    value={editForm.kategori} 
                    onChange={(e)=>setEditForm({...editForm, kategori: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  >
                    <option value="Kaos">Kaos</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="Polo">Polo</option>
                    <option value="Kemeja">Kemeja/Seragam</option>
                    <option value="Jaket">Jaket</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Deskripsi Detail</label>
                  <textarea 
                    value={editForm.deskripsi} 
                    onChange={(e)=>setEditForm({...editForm, deskripsi: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all custom-scrollbar shadow-sm" 
                    rows={3} 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Ganti Gambar <span className="normal-case tracking-normal font-medium text-slate-400">(Opsional)</span></label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-white hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group shadow-sm overflow-hidden">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      onChange={(e) => setEditFile(e.target.files?.[0] || null)} 
                      accept="image/*" 
                    />
                    {editFile ? (
                      <div className="text-center z-0">
                        <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2"><ImageIcon size={24}/></div>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{editFile.name}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1 bg-blue-50 py-1 px-3 rounded-full inline-block">Siap Diunggah</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center z-0">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 rounded-full flex items-center justify-center mb-2 transition-colors"><Upload size={24} /></div>
                        <p className="text-sm font-bold text-slate-700">Pilih gambar baru</p>
                      </div>
                    )}
                  </div>
                </div>

              </form>
            </div>

            <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3 shrink-0">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-1/2 bg-white border border-slate-200 text-slate-600 py-3 rounded-full font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Batal</button>
              <button type="submit" form="editPortfolioForm" className="w-full sm:w-1/2 bg-blue-600 text-white py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL ZOOM GAMBAR (LIGHTBOX)
      ========================================= */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div 
              className="fixed inset-0 bg-slate-900/95 backdrop-blur-md transition-opacity" 
              onClick={() => setZoomedImage(null)}
            ></div>
            
            <button 
              onClick={() => setZoomedImage(null)}
              className="fixed top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-[110] shadow-lg backdrop-blur-md border border-white/10"
            >
              <X size={24} />
            </button>

            <div 
              className="relative transform transition-all duration-300 ease-in-out cursor-zoom-out flex items-center justify-center max-w-5xl max-h-[90vh] w-full z-[105]"
              onClick={() => setZoomedImage(null)}
              title="Ketuk untuk menutup"
            >
              <img 
                src={zoomedImage} 
                alt="Zoom Portofolio" 
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl bg-white/10" 
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          CUSTOM DIALOG SYSTEM (Pengganti Alert)
      ========================================= */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[120] overflow-y-auto">
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
                  <button onClick={dialog.onConfirm} className="flex-1 py-3 rounded-full font-bold text-sm bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all active:scale-95">
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