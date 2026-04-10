"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, Plus, Image as ImageIcon, Link as LinkIcon, Loader2, AlertCircle, CheckCircle2, X, Info, Edit } from "lucide-react";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form Tambah
  const [file, setFile] = useState<File | null>(null);
  const [judul, setJudul] = useState("");
  const [link, setLink] = useState("");

  // State Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editJudul, setEditJudul] = useState("");
  const [editLink, setEditLink] = useState("");

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

  const fetchBanners = async () => {
    try {
      const res = await fetch("http://localhost:3001/banners");
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      showDialog('error', 'Koneksi Gagal', 'Gagal mengambil data banner dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // 1. Fungsi Tambah Banner
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showDialog('info', 'Gambar Diperlukan', 'Silakan pilih gambar banner terlebih dahulu sebelum mengunggah.');
      return;
    }

    const formData = new FormData();
    formData.append("gambar", file);
    formData.append("judul", judul);
    formData.append("link", link);

    try {
      const res = await fetch("http://localhost:3001/banners", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFile(null); 
        setJudul(""); 
        setLink("");
        fetchBanners();
        showDialog('success', 'Banner Mengudara!', 'Banner promo berhasil diunggah dan langsung aktif di aplikasi mobile.');
      } else {
        showDialog('error', 'Upload Gagal', 'Terjadi kesalahan saat menyimpan banner.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal terhubung ke server.');
    }
  };

  // 2. Fungsi Edit Banner
  const openEditModal = (banner: any) => {
    setEditingBanner(banner);
    setEditJudul(banner.judul);
    setEditLink(banner.link || "");
    setEditFile(null); // Reset file input
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("judul", editJudul);
    formData.append("link", editLink);
    if (editFile) {
      formData.append("gambar", editFile);
    }

    try {
      const res = await fetch(`http://localhost:3001/banners/${editingBanner.id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        fetchBanners();
        showDialog('success', 'Update Berhasil', 'Informasi banner promo telah diperbarui.');
      } else {
        showDialog('error', 'Update Gagal', 'Terjadi kesalahan saat menyimpan perubahan banner.');
      }
    } catch (error) {
      showDialog('error', 'Kesalahan Sistem', 'Gagal terhubung ke server saat memperbarui data.');
    }
  };

  // 3. Fungsi Hapus Banner
  const handleDelete = async (id: string, title: string) => {
    showDialog('confirm', 'Hapus Banner', `Apakah Anda yakin ingin menghapus banner "${title}"? Banner ini tidak akan tampil lagi di aplikasi pelanggan.`, async () => {
      closeDialog();
      try {
        const res = await fetch(`http://localhost:3001/banners/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchBanners();
          showDialog('success', 'Terhapus', 'Banner berhasil dihapus dari sistem.');
        } else {
          showDialog('error', 'Gagal', 'Tidak dapat menghapus banner ini.');
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
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Banner Promo Mobile</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Gambar yang Anda unggah di sini akan tampil sebagai slider informasi/promo di halaman utama aplikasi pelanggan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* =========================================
            KOLOM KIRI: FORM UPLOAD BANNER
        ========================================= */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Plus size={20} className="stroke-[3px]" />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Tambah Banner</h2>
            </div>
            
            <form onSubmit={handleAddSubmit} className="space-y-5">
              
              {/* Input Judul */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Judul Promo</label>
                <input 
                  type="text" 
                  value={judul} 
                  onChange={(e) => setJudul(e.target.value)} 
                  required 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium" 
                  placeholder="Contoh: Diskon Kemerdekaan" 
                />
              </div>

              {/* Input Link */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Link Tujuan <span className="normal-case tracking-normal font-medium text-slate-400">(Opsional)</span></label>
                <div className="relative group">
                  <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    value={link} 
                    onChange={(e) => setLink(e.target.value)} 
                    className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-800 bg-slate-50 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400 placeholder:font-medium" 
                    placeholder="https://..." 
                  />
                </div>
              </div>

              {/* Input File */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">File Gambar (Rasio 16:9)</label>
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
                      <div className="w-12 h-12 bg-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 rounded-full flex items-center justify-center mb-2 transition-colors"><Upload size={24} /></div>
                      <p className="text-sm font-bold text-slate-700">Pilih gambar dari perangkat</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">Format: PNG, JPG</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/20 mt-2">
                Unggah Banner
              </button>
            </form>
          </div>
        </div>

        {/* =========================================
            KOLOM KANAN: DAFTAR BANNER AKTIF
        ========================================= */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={18}/> Banner Aktif di Aplikasi
              </h2>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">{banners.length} Banner</span>
            </div>

            {loading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
                <span className="text-slate-500 font-medium text-sm">Memuat data banner...</span>
              </div>
            ) : banners.length === 0 ? (
              <div className="py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center flex flex-col items-center justify-center">
                <ImageIcon size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">Belum Ada Banner</h3>
                <p className="text-sm text-slate-500 font-medium max-w-sm">Aplikasi mobile Anda belum memiliki slider promo. Silakan unggah banner pertama Anda di menu sebelah kiri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {banners.map((b) => (
                  <div key={b.id} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    {/* Gambar Banner */}
                    <div className="w-full aspect-video bg-slate-100 relative">
                      <img 
                        src={`http://localhost:3001/uploads/banners/${b.gambar}`} 
                        alt={b.judul} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} 
                      />
                      <ImageIcon size={32} className="text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />
                      
                      {/* Gradient Overlay bawah agar teks terbaca */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none"></div>
                    </div>
                    
                    {/* Info Banner */}
                    <div className="p-4 bg-white border-t border-slate-100 relative z-10">
                      <h3 className="font-black text-slate-800 text-sm mb-1 truncate">{b.judul}</h3>
                      <p className="text-[11px] font-medium text-slate-400 truncate flex items-center gap-1">
                        <LinkIcon size={10} /> {b.link || "Tidak ada link tautan"}
                      </p>
                    </div>

                    {/* Action Buttons (Muncul saat Hover) */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => openEditModal(b)}
                        className="p-2.5 bg-blue-500/90 backdrop-blur-md hover:bg-blue-600 text-white rounded-xl shadow-lg scale-95 group-hover:scale-100 transition-all"
                        title="Edit Banner"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(b.id, b.judul)}
                        className="p-2.5 bg-rose-500/90 backdrop-blur-md hover:bg-rose-600 text-white rounded-xl shadow-lg scale-95 group-hover:scale-100 transition-all"
                        title="Hapus Banner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          MODAL EDIT BANNER (Tengah Sempurna)
      ========================================= */}
      {isEditModalOpen && editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md text-left overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-black text-slate-800">Edit Banner Promo</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
              <form id="editBannerForm" onSubmit={handleEditSubmit} className="p-6 space-y-5">
                
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Judul Promo</label>
                  <input 
                    type="text" 
                    value={editJudul} 
                    onChange={(e) => setEditJudul(e.target.value)} 
                    required 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Link Tujuan <span className="normal-case tracking-normal font-medium text-slate-400">(Opsional)</span></label>
                  <div className="relative group">
                    <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text" 
                      value={editLink} 
                      onChange={(e) => setEditLink(e.target.value)} 
                      className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm" 
                      placeholder="https://..." 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Ganti Gambar <span className="normal-case tracking-normal font-medium text-slate-400">(Biarkan kosong jika tidak ganti)</span></label>
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
              <button type="submit" form="editBannerForm" className="w-full sm:w-1/2 bg-blue-600 text-white py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20">Simpan Perubahan</button>
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