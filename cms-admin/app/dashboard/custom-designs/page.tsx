"use client";

import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, Clock, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2, Info, FileText } from "lucide-react";   
export default function CustomDesignPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Review
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ statusDesain: "", catatanAdmin: "" });
  
  // State untuk Fitur Zoom Gambar
  const [isZoomed, setIsZoomed] = useState(false);

  // ==========================================
  // STATE CUSTOM DIALOG (Pengganti Alert Browser)
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

  const fetchDesigns = async () => {
    try {
      const res = await fetch("http://localhost:3001/custom-design");
      const data = await res.json();
      setDesigns(data);
    } catch (error) {
      showDialog('error', 'Koneksi Gagal', 'Tidak dapat mengambil data desain dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDesigns(); }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewForm.statusDesain) {
      showDialog('error', 'Pilihan Kosong', 'Silakan pilih untuk Menerima atau Menolak desain ini terlebih dahulu.');
      return;
    }

    const actionText = reviewForm.statusDesain === 'DISETUJUI' ? 'MENERIMA' : 'MENOLAK';
    
    showDialog('confirm', 'Konfirmasi Keputusan', `Yakin ingin ${actionText} desain ini?`, async () => {
      closeDialog();
      
      try {
        const res = await fetch(`http://localhost:3001/custom-design/${selectedItem.id}/review`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewForm),
        });

        if (res.ok) {
          setSelectedItem(null);
          fetchDesigns();
          showDialog('success', 'Review Tersimpan!', `Desain telah berhasil ditandai sebagai ${reviewForm.statusDesain}.`);
        } else {
          showDialog('error', 'Gagal Menyimpan', 'Terjadi kesalahan pada server saat menyimpan review.');
        }
      } catch (error) {
        showDialog('error', 'Kesalahan Sistem', 'Gagal terhubung ke server.');
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISETUJUI": return <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-max"><CheckCircle size={12}/> Disetujui</span>;
      case "DITOLAK": return <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-max"><XCircle size={12}/> Ditolak / Revisi</span>;
      default: return <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1.5 w-max"><Clock size={12}/> Menunggu</span>;
    }
  };

  return (
    <div className="space-y-6 pb-10 relative">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Review Desain Custom</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Review, evaluasi, dan setujui desain sablon yang diajukan oleh pelanggan.</p>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6 font-bold">ID Order</th>
                <th className="py-4 px-6 font-bold">Detail Baju & Sablon</th>
                <th className="py-4 px-6 font-bold">Status Desain</th>
                <th className="py-4 px-6 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-16 text-center text-slate-500 font-medium"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-blue-500"/> Memuat data desain...</td></tr>
              ) : designs.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-slate-500 font-medium">Tidak ada desain custom yang perlu direview saat ini.</td></tr>
              ) : (
               designs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      ORD-{item.orderId.substring(0,6).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800 text-sm mb-1">{item.product?.namaProduk || "Produk Custom"} <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs ml-1">x{item.jumlah}</span></p>
                    <p className="text-xs font-medium text-slate-500">
                      Sablon: <span className="font-bold text-slate-700">{item.jenisSablon}</span>
                    </p>
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(item.statusDesain)}</td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => { setSelectedItem(item); setReviewForm({ statusDesain: item.statusDesain || "", catatanAdmin: item.catatanAdmin || "" }); }}
                      className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-100 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 inline-flex items-center gap-2 shadow-sm"
                    >
                      <Eye size={16} /> Review Desain
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          MODAL REVIEW DESAIN (Split Screen)
      ========================================= */}
{selectedItem && !isZoomed && (
        <div className="fixed inset-0 z-[60] overflow-y-auto pt-[110px] pl-4 lg:ml-[320px] lg:pl-0">
          <div className="flex min-h-full items-center justify-center p-4 text-center max-w-6xl w-full">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)}></div>
            
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl text-left overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
              
              {/* Bagian Kiri: Preview Gambar Klien */}
              <div className="w-full md:w-1/2 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 p-8 flex flex-col justify-center">
                
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pratinjau Desain Klien</h3>
                
                {/* Container Gambar (Click to Zoom) */}
                <div 
                  onClick={() => setIsZoomed(true)}
                  className="w-full aspect-square bg-white border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center relative group cursor-zoom-in shadow-sm"
                >
                  <img 
                    src={`http://localhost:3001/uploads/${selectedItem.gambarDesain}`} 
                    alt="Desain Pelanggan" 
                    className="max-w-full max-h-full object-contain p-2" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <ImageIcon size={40} className="text-slate-200 absolute -z-10" />
                  
                  {/* Overlay Hover Zoom */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white/20 p-3 rounded-full text-white">
                      <Eye size={24} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 w-full bg-amber-50 p-4 rounded-2xl border border-amber-100 text-sm shadow-sm">
                  <p className="text-amber-700/60 text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FileText size={12}/> Catatan Pelanggan:</p>
                  <p className="text-amber-900 italic font-medium leading-relaxed">"{selectedItem.deskripsiDesain || "Tidak ada instruksi tambahan."}"</p>
                </div>
              </div>

              {/* Bagian Kanan: Form Keputusan Admin */}
              <div className="w-full md:w-1/2 bg-white flex flex-col relative">
                
                {/* Tombol Tutup (X) di Kanan Atas Modal */}
                <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200 z-10">
                  <X size={18} />
                </button>

                <form onSubmit={handleReviewSubmit} className="p-8 flex flex-col h-full">
                  <div className="mb-8 pr-8">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Keputusan Admin</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Tentukan apakah desain ini layak untuk diproduksi.</p>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    {/* Pemilihan Status (Radio Buttons) */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Status Persetujuan</label>
                      <div className="flex gap-3">
                        <label className={`flex-1 border-2 rounded-2xl p-4 cursor-pointer transition-all active:scale-95 ${reviewForm.statusDesain === 'DISETUJUI' ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/20' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                          <input type="radio" name="status" value="DISETUJUI" className="hidden" onChange={(e) => setReviewForm({...reviewForm, statusDesain: e.target.value})} />
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 size={24} className={reviewForm.statusDesain === 'DISETUJUI' ? 'text-emerald-500' : 'text-slate-300'} />
                            <span className={`text-sm font-black tracking-wide ${reviewForm.statusDesain === 'DISETUJUI' ? 'text-emerald-700' : 'text-slate-500'}`}>Terima Desain</span>
                          </div>
                        </label>
                        
                        <label className={`flex-1 border-2 rounded-2xl p-4 cursor-pointer transition-all active:scale-95 ${reviewForm.statusDesain === 'DITOLAK' ? 'border-rose-500 bg-rose-50 shadow-md shadow-rose-500/20' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                          <input type="radio" name="status" value="DITOLAK" className="hidden" onChange={(e) => setReviewForm({...reviewForm, statusDesain: e.target.value})} />
                          <div className="flex flex-col items-center gap-2">
                            <XCircle size={24} className={reviewForm.statusDesain === 'DITOLAK' ? 'text-rose-500' : 'text-slate-300'} />
                            <span className={`text-sm font-black tracking-wide ${reviewForm.statusDesain === 'DITOLAK' ? 'text-rose-700' : 'text-slate-500'}`}>Tolak / Revisi</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Input Catatan Admin */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Catatan Evaluasi <span className="normal-case tracking-normal font-medium text-slate-400">(Opsional)</span></label>
                      <textarea 
                        value={reviewForm.catatanAdmin}
                        onChange={(e) => setReviewForm({...reviewForm, catatanAdmin: e.target.value})}
                        className="w-full border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 custom-scrollbar" 
                        rows={4} 
                        placeholder="Berikan alasan penolakan, atau instruksi khusus untuk tim produksi konveksi..."
                      />
                    </div>
                  </div>

                  {/* Tombol Simpan */}
                  <div className="pt-6 mt-6 border-t border-slate-100 flex gap-3">
                    <button type="button" onClick={() => setSelectedItem(null)} className="w-1/3 bg-white border border-slate-200 text-slate-600 py-3 rounded-full font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Batal</button>
                    <button type="submit" className="w-2/3 bg-blue-600 text-white py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20">Simpan Keputusan</button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL ZOOM GAMBAR (Overlay Khusus)
      ========================================= */}
{isZoomed && selectedItem && (
        <div className="fixed inset-0 z-[100] overflow-y-auto pt-[110px] pl-4 lg:ml-[320px] lg:pl-0 h-[calc(100vh-110px)]">
          <div className="flex min-h-full items-center justify-center p-4 text-center max-w-6xl w-full">
            <div 
              className="fixed inset-0 bg-slate-900/95 backdrop-blur-md transition-opacity" 
              onClick={() => setIsZoomed(false)}
            ></div>
            
            <button 
              onClick={() => setIsZoomed(false)}
              className="fixed top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-[110] shadow-lg backdrop-blur-md border border-white/10"
            >
              <X size={24} />
            </button>

            <div 
              className="relative transform transition-all duration-300 ease-in-out cursor-zoom-out flex items-center justify-center scale-100 max-w-5xl max-h-[90vh] w-full z-[105]"
              onClick={() => setIsZoomed(false)}
              title="Ketuk untuk menutup"
            >
              <img 
                src={`http://localhost:3001/uploads/${selectedItem.gambarDesain}`} 
                alt="Zoom Desain Pelanggan" 
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl bg-white/10" 
              />
            </div>
            
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/60 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full pointer-events-none z-[110]">
              <p className="text-white/80 font-medium text-sm tracking-wide flex items-center gap-2">
                <Eye size={16} /> Ketuk area mana saja untuk menutup
              </p>
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
        </div>
      )}

    </div>
  );
}