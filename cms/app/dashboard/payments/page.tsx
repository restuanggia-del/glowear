"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Banknote, Clock, User, Loader2, Image as ImageIcon } from "lucide-react";
import { api } from "@/app/services/api";
import DialogModal, { DialogState, DEFAULT_DIALOG, DialogType } from "@/app/components/ui/DialogModal";

export default function PaymentVerificationPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Gambar/Struk
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
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

  const fetchPayments = async () => {
    try {
      const { data } = await api.get("/orders/pending-verification");
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      showDialog('error', 'Koneksi Gagal', 'Tidak dapat mengambil data pembayaran dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPayments(); 
  }, []);

  // Fungsi Terima Pembayaran (Dengan Custom Dialog)
  const handleVerify = async (orderId: string, status: "DP" | "LUNAS") => {
    showDialog('confirm', 'Verifikasi Pembayaran', `Apakah Anda yakin nominal transfer sudah sesuai dan ingin mengesahkan pembayaran untuk pesanan ${orderId.substring(0,6).toUpperCase()}?`, async () => {
      closeDialog();
      try {
        const { status: resStatus } = await api.put(`/orders/${orderId}/status`, {
          status: "DIPROSES",
          statusPembayaran: status
        });

        if (resStatus === 200 || resStatus === 201) {
          showDialog('success', 'Berhasil', 'Pembayaran telah disahkan dan pesanan diteruskan ke tahap Produksi.');
          fetchPayments();
        }
      } catch (error) {
        showDialog('error', 'Gagal', 'Gagal memverifikasi pembayaran. Periksa koneksi server.');
      }
    });
  };

  // Fungsi Tolak Pembayaran (Dengan Custom Dialog)
  const handleReject = async (orderId: string) => {
    showDialog('confirm', 'Tolak Pembayaran', `Apakah Anda yakin ingin MENOLAK bukti pembayaran untuk pesanan ${orderId.substring(0,6).toUpperCase()}? Pelanggan harus mengunggah ulang bukti transfer.`, async () => {
      closeDialog();
      try {
        const { status: resStatus } = await api.put(`/orders/${orderId}/status`, {
          status: "PENDING",
          statusPembayaran: "BELUM_BAYAR"
        });

        if (resStatus === 200 || resStatus === 201) {
          showDialog('success', 'Ditolak', 'Pembayaran telah ditolak. Status pesanan dikembalikan ke Menunggu Pembayaran.');
          fetchPayments();
        }
      } catch (error) {
        showDialog('error', 'Gagal', 'Gagal menolak pembayaran.');
      }
    });
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Verifikasi Bayar</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Cek keabsahan bukti transfer pelanggan sebelum masuk produksi.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-inner self-stretch sm:self-auto justify-center">
          <Clock size={16} className="animate-pulse text-blue-600" /> 
          <span>{orders.length} Antrean</span>
        </div>
      </div>

      {/* Grid Kartu Pesanan */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
        
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 size={36} className="text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium text-sm">Memuat data pembayaran...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="col-span-full bg-white p-10 sm:p-16 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Banknote size={36} className="text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-700 mb-1">Semua Beres! 🎉</h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md">Belum ada bukti pembayaran baru yang diunggah. Anda bisa bersantai sejenak.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden flex flex-col sm:flex-row transition-all">
              
              {/* Kiri: Preview Struk */}
              <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 relative group shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 flex items-center justify-center overflow-hidden">
                <img 
                  src={`http://localhost:3001/uploads/${order.buktiPembayaran}`} 
                  alt="Struk Transfer" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-slate-50');
                  }}
                />
                <ImageIcon size={32} className="text-slate-300 absolute -z-10" />

                <button 
                  onClick={() => setSelectedProof(`http://localhost:3001/uploads/${order.buktiPembayaran}`)}
                  className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 p-2"
                >
                  <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Eye size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase bg-slate-900/80 px-2.5 py-1 rounded-full">Lihat Bukti</span>
                </button>
              </div>

              {/* Kanan: Info & Action */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between bg-white">
                <div className="mb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                      ORD-{order.id.substring(0, 6).toUpperCase()}
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total Tagihan</p>
                      <p className="text-sm sm:text-base font-black text-blue-600">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.totalHarga)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-700 mb-3">
                    <User size={15} className="text-slate-400 shrink-0" />
                    <p className="text-xs sm:text-sm font-bold truncate">{order.pengguna?.nama || "Pelanggan Tanpa Nama"}</p>
                  </div>
                  
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Menunggu validasi admin untuk nominal transfer sebesar 50% (DP) atau 100% (Lunas).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-auto pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => handleVerify(order.id, "DP")}
                    className="flex-1 min-w-[90px] bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 py-2.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
                  >
                    Terima DP
                  </button>
                  <button 
                    onClick={() => handleVerify(order.id, "LUNAS")}
                    className="flex-1 min-w-[90px] bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Lunas
                  </button>
                  
                  <button 
                    onClick={() => handleReject(order.id)}
                    title="Tolak Bukti Transfer"
                    className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-xl transition-all active:scale-95 shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =========================================
          MODAL PREVIEW GAMBAR (Centered + Zoom)
      ========================================= */}
      {selectedProof && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          {/* Latar Belakang Gelap */}
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
            onClick={() => { setSelectedProof(null); setIsZoomed(false); }}
          />
          
          {/* Tombol Tutup Kanan Atas */}
          <button 
            onClick={() => { setSelectedProof(null); setIsZoomed(false); }}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 sm:p-3 rounded-full transition-all z-[210] shadow-xl backdrop-blur-md border border-white/15"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Container Gambar */}
          <div 
            className={`relative z-[205] transform transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center max-w-full max-h-full
              ${isZoomed ? 'scale-125 sm:scale-150' : 'scale-100 max-w-3xl max-h-[82vh]'}
            `}
            onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
            title={isZoomed ? "Ketuk untuk Perkecil" : "Ketuk untuk Perbesar"}
          >
            <img 
              src={selectedProof} 
              alt="Zoom Bukti" 
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl bg-white/5 border border-white/10" 
            />
          </div>

          {/* Hint Petunjuk di Bawah */}
          {!isZoomed && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full pointer-events-none z-[210]">
              <p className="text-white/80 font-medium text-xs sm:text-sm tracking-wide flex items-center gap-2">
                <Eye size={14} /> Ketuk gambar untuk Zoom
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================
          CUSTOM DIALOG SYSTEM (Shared DialogModal)
      ========================================= */}
      <DialogModal dialog={dialog} onClose={closeDialog} />

    </div>
  );
}
