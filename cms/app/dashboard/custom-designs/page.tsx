"use client";

import { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Clock, X, Image as ImageIcon, Loader2, CheckCircle2, FileText } from "lucide-react";
import DialogModal, { DialogState, DEFAULT_DIALOG, DialogType } from "@/app/components/ui/DialogModal";

export default function CustomDesignPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Review
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ statusDesain: "", catatanAdmin: "" });
  
  // State untuk Fitur Zoom Gambar
  const [isZoomed, setIsZoomed] = useState(false);

  // ==========================================
  // STATE CUSTOM DIALOG
  // ==========================================
  const [dialog, setDialog] = useState<DialogState>(DEFAULT_DIALOG);

  const showDialog = (type: DialogType, title: string, message: string, onConfirm?: () => void) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };

  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));
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
    <div className="space-y-6 pb-10">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Review Desain Custom</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Review, evaluasi, dan setujui desain sablon yang diajukan oleh pelanggan.</p>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-5 sm:px-6 font-bold">ID Order</th>
                <th className="py-4 px-5 sm:px-6 font-bold">Detail Baju & Sablon</th>
                <th className="py-4 px-5 sm:px-6 font-bold">Status Desain</th>
                <th className="py-4 px-5 sm:px-6 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-500 font-medium">
                    <Loader2 size={32} className="animate-spin mx-auto mb-3 text-blue-500"/>
                    <span className="text-sm">Memuat data desain...</span>
                  </td>
                </tr>
              ) : designs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-slate-500 font-medium text-sm">
                    Tidak ada desain custom yang perlu direview saat ini.
                  </td>
                </tr>
              ) : (
               designs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 sm:px-6">
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      ORD-{item.orderId.substring(0,6).toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-5 sm:px-6">
                    <p className="font-bold text-slate-800 text-xs sm:text-sm mb-1">
                      {item.product?.namaProduk || "Produk Custom"} 
                      <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs ml-1 font-black">x{item.jumlah}</span>
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      Sablon: <span className="font-bold text-slate-700">{item.jenisSablon}</span>
                    </p>
                  </td>
                  <td className="py-4 px-5 sm:px-6">{getStatusBadge(item.statusDesain)}</td>
                  <td className="py-4 px-5 sm:px-6 text-center">
                    <button 
                      onClick={() => { setSelectedItem(item); setReviewForm({ statusDesain: item.statusDesain || "", catatanAdmin: item.catatanAdmin || "" }); }}
                      className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye size={15} /> Review Desain
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          MODAL REVIEW DESAIN (Split Screen Responsive)
      ========================================= */}
      {selectedItem && !isZoomed && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)}></div>
          
          <div className="relative bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            
            {/* Bagian Kiri: Preview Gambar Klien */}
            <div className="w-full md:w-1/2 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-5 sm:p-7 flex flex-col justify-center overflow-y-auto custom-scrollbar">
              
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pratinjau Desain Klien</h3>
              
              {/* Container Gambar (Click to Zoom) */}
              <div 
                onClick={() => setIsZoomed(true)}
                className="w-full aspect-square max-h-[260px] sm:max-h-[340px] md:max-h-none bg-white border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center relative group cursor-zoom-in shadow-sm"
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

              <div className="mt-4 w-full bg-amber-50 p-3.5 sm:p-4 rounded-xl border border-amber-100 text-xs sm:text-sm shadow-sm">
                <p className="text-amber-700/70 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <FileText size={12}/> Catatan Pelanggan:
                </p>
                <p className="text-amber-950 italic font-medium leading-relaxed">
                  "{selectedItem.deskripsiDesain || "Tidak ada instruksi tambahan."}"
                </p>
              </div>
            </div>

            {/* Bagian Kanan: Form Keputusan Admin */}
            <div className="w-full md:w-1/2 bg-white flex flex-col relative overflow-y-auto custom-scrollbar">
              
              {/* Tombol Tutup (X) di Kanan Atas Modal */}
              <button 
                onClick={() => setSelectedItem(null)} 
                className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200 z-10"
              >
                <X size={16} />
              </button>

              <form onSubmit={handleReviewSubmit} className="p-5 sm:p-7 flex flex-col h-full justify-between">
                <div>
                  <div className="mb-6 pr-8">
                    <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Keputusan Admin</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Tentukan apakah desain ini layak untuk diproduksi.</p>
                  </div>
                  
                  <div className="space-y-5">
                    {/* Pemilihan Status (Radio Buttons) */}
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Status Persetujuan</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 cursor-pointer transition-all active:scale-95 text-center ${reviewForm.statusDesain === 'DISETUJUI' ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/20' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                          <input type="radio" name="status" value="DISETUJUI" className="hidden" onChange={(e) => setReviewForm({...reviewForm, statusDesain: e.target.value})} />
                          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <CheckCircle2 size={22} className={reviewForm.statusDesain === 'DISETUJUI' ? 'text-emerald-500' : 'text-slate-300'} />
                            <span className={`text-xs sm:text-sm font-black tracking-wide ${reviewForm.statusDesain === 'DISETUJUI' ? 'text-emerald-700' : 'text-slate-500'}`}>Terima Desain</span>
                          </div>
                        </label>
                        
                        <label className={`border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 cursor-pointer transition-all active:scale-95 text-center ${reviewForm.statusDesain === 'DITOLAK' ? 'border-rose-500 bg-rose-50 shadow-md shadow-rose-500/20' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                          <input type="radio" name="status" value="DITOLAK" className="hidden" onChange={(e) => setReviewForm({...reviewForm, statusDesain: e.target.value})} />
                          <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                            <XCircle size={22} className={reviewForm.statusDesain === 'DITOLAK' ? 'text-rose-500' : 'text-slate-300'} />
                            <span className={`text-xs sm:text-sm font-black tracking-wide ${reviewForm.statusDesain === 'DITOLAK' ? 'text-rose-700' : 'text-slate-500'}`}>Tolak / Revisi</span>
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
                        className="w-full border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 custom-scrollbar" 
                        rows={3} 
                        placeholder="Berikan alasan penolakan atau instruksi khusus untuk tim sablon..."
                      />
                    </div>
                  </div>
                </div>

                {/* Tombol Simpan */}
                <div className="pt-5 mt-5 border-t border-slate-100 flex gap-2.5">
                  <button type="button" onClick={() => setSelectedItem(null)} className="w-1/3 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                    Batal
                  </button>
                  <button type="submit" className="w-2/3 bg-blue-600 text-white py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20">
                    Simpan Keputusan
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* =========================================
          MODAL ZOOM GAMBAR (Overlay Khusus)
      ========================================= */}
      {isZoomed && selectedItem && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity" 
            onClick={() => setIsZoomed(false)}
          />
          
          <button 
            onClick={() => setIsZoomed(false)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 sm:p-3 rounded-full transition-all z-[260] shadow-lg backdrop-blur-md border border-white/10"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div 
            className="relative transform transition-all duration-300 ease-in-out cursor-zoom-out flex items-center justify-center max-w-5xl max-h-[85vh] w-full z-[255]"
            onClick={() => setIsZoomed(false)}
            title="Ketuk untuk menutup"
          >
            <img 
              src={`http://localhost:3001/uploads/${selectedItem.gambarDesain}`} 
              alt="Zoom Desain Pelanggan" 
              className="w-auto h-auto max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl bg-white/5 border border-white/10" 
            />
          </div>
          
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full pointer-events-none z-[260]">
            <p className="text-white/80 font-medium text-xs sm:text-sm tracking-wide flex items-center gap-2">
              <Eye size={14} /> Ketuk area mana saja untuk menutup
            </p>
          </div>
        </div>
      )}

      {/* =========================================
          CUSTOM DIALOG SYSTEM (Shared DialogModal)
      ========================================= */}
      <DialogModal dialog={dialog} onClose={closeDialog} />

    </div>
  );
}
