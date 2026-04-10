"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Banknote, Clock, User, Loader2, Image as ImageIcon, AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function PaymentVerificationPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Gambar/Struk
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
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

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:3001/orders/pending-verification");
      const data = await res.json();
      setOrders(data);
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
    showDialog('confirm', 'Konfirmasi Pembayaran', `Terima pembayaran ini sebagai ${status}? Pesanan akan otomatis diteruskan ke antrean Produksi.`, async () => {
      closeDialog(); // Tutup dialog konfirmasi
      
      try {
        await fetch(`http://localhost:3001/orders/${orderId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusPembayaran: status, status: "DIPROSES" }),
        });
        
        showDialog('success', 'Berhasil!', `Pembayaran ${status} telah terverifikasi.`);
        fetchPayments();
      } catch (error) {
        showDialog('error', 'Gagal', 'Gagal memverifikasi pembayaran. Periksa koneksi server.');
      }
    });
  };

  // Fungsi Tolak Pembayaran (Dengan Custom Dialog)
  const handleReject = async (orderId: string) => {
    showDialog('confirm', 'Tolak Bukti Transfer', 'Yakin ingin MENOLAK bukti transfer ini? Pelanggan harus mengunggah ulang bukti pembayaran yang valid.', async () => {
      closeDialog();

      try {
        await fetch(`http://localhost:3001/orders/${orderId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusPembayaran: "BELUM_BAYAR" }),
        });
        
        showDialog('success', 'Ditolak', 'Bukti pembayaran berhasil ditolak.');
        fetchPayments();
      } catch (error) {
        showDialog('error', 'Gagal', 'Gagal menolak pembayaran.');
      }
    });
  };

  return (
    <div className="font-sans space-y-6 pb-10 relative">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Verifikasi Bayar</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Cek keabsahan bukti transfer pelanggan sebelum masuk produksi.</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-inner">
          <Clock size={18} className="animate-pulse" /> 
          <span>{orders.length} Antrean</span>
        </div>
      </div>

      {/* Grid Kartu Pesanan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {loading ? (
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Memuat data pembayaran...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 bg-white p-16 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Banknote size={40} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Semua Beres! 🎉</h3>
            <p className="text-sm text-slate-500 font-medium max-w-md">Belum ada bukti pembayaran baru yang diunggah. Anda bisa bersantai sejenak.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden flex flex-col sm:flex-row transition-shadow">
              
              {/* Kiri: Preview Struk */}
              <div className="w-full sm:w-48 h-56 sm:h-auto bg-slate-100 relative group shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 flex items-center justify-center">
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
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2"
                >
                  <div className="p-3 bg-white/20 rounded-full">
                    <Eye size={24} />
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase">Lihat Bukti</span>
                </button>
              </div>

              {/* Kanan: Info & Action */}
              <div className="flex-1 p-5 flex flex-col justify-between bg-white">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                      ORD-{order.id.substring(0, 6).toUpperCase()}
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total Tagihan</p>
                      <p className="text-sm font-black text-blue-600">
                        {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.totalHarga)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-700 mb-2">
                    <User size={16} className="text-slate-400" />
                    <p className="text-sm font-bold truncate">{order.pengguna?.nama || "Pelanggan Tanpa Nama"}</p>
                  </div>
                  
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Menunggu validasi admin untuk nominal transfer sebesar 50% (DP) atau 100% (Lunas).
                  </p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => handleVerify(order.id, "DP")}
                    className="flex-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                  >
                    Terima DP
                  </button>
                  <button 
                    onClick={() => handleVerify(order.id, "LUNAS")}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Lunas
                  </button>
                  
                  <button 
                    onClick={() => handleReject(order.id)}
                    title="Tolak Bukti Transfer"
                    className="p-2.5 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-xl transition-all active:scale-95 shrink-0"
                  >
                    <X size={18} />
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
        <div className="fixed inset-0 z-[90] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Latar Belakang Gelap */}
            <div 
              className="fixed inset-0 bg-slate-900/90 backdrop-blur-md transition-opacity" 
              onClick={() => { setSelectedProof(null); setIsZoomed(false); }}
            ></div>
            
            {/* Tombol Tutup Kanan Atas */}
            <button 
              onClick={() => { setSelectedProof(null); setIsZoomed(false); }}
              className="fixed top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-[100] shadow-lg backdrop-blur-md border border-white/10"
            >
              <X size={24} />
            </button>

            {/* Container Gambar */}
            <div 
              className={`relative transform transition-all duration-300 ease-in-out cursor-pointer flex items-center justify-center
                ${isZoomed ? 'scale-150 z-50' : 'scale-100 max-w-4xl max-h-[85vh] w-full'}
              `}
              onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
              title={isZoomed ? "Ketuk untuk Perkecil" : "Ketuk untuk Perbesar"}
            >
              <img 
                src={selectedProof} 
                alt="Zoom Bukti" 
                className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl bg-white/5" 
              />
            </div>

            {/* Hint Petunjuk di Bawah */}
            {!isZoomed && (
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/60 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full pointer-events-none z-[100]">
                <p className="text-white/80 font-medium text-sm tracking-wide flex items-center gap-2">
                  <Eye size={16} /> Ketuk gambar untuk Zoom
                </p>
              </div>
            )}
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
            
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200 sm:my-8">
              
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