"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Banknote, Clock, User, Loader2, Image as ImageIcon } from "lucide-react";

export default function PaymentVerificationPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:3001/orders/pending-verification");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPayments(); 
  }, []);

  // Fungsi Terima Pembayaran
  const handleVerify = async (orderId: string, status: "DP" | "LUNAS") => {
    if (!confirm(`Konfirmasi pembayaran ini sebagai ${status}? Pesanan akan langsung masuk ke antrean Produksi.`)) return;
    
    try {
      await fetch(`http://localhost:3001/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Mengubah status pembayaran dan menaikkan status pesanan menjadi DIPROSES
        body: JSON.stringify({ statusPembayaran: status, status: "DIPROSES" }),
      });
      
      alert(`Sukses! Pembayaran ${status} terverifikasi.`);
      fetchPayments(); // Refresh data otomatis
    } catch (error) {
      alert("Gagal memverifikasi pembayaran. Periksa koneksi server.");
    }
  };

  // Fungsi Tolak Pembayaran (Baru)
  const handleReject = async (orderId: string) => {
    if (!confirm("Yakin ingin MENOLAK bukti transfer ini? Pelanggan harus mengunggah ulang bukti pembayaran.")) return;
    
    try {
      await fetch(`http://localhost:3001/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Kembalikan status pembayaran menjadi BELUM_BAYAR agar user bisa upload ulang
        body: JSON.stringify({ statusPembayaran: "BELUM_BAYAR" }),
      });
      
      alert("Bukti pembayaran ditolak.");
      fetchPayments();
    } catch (error) {
      alert("Gagal menolak pembayaran.");
    }
  };

  return (
    <div className="font-sans space-y-6 pb-10">
      
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
        
        {/* State 1: Loading */}
        {loading ? (
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Memuat data pembayaran...</p>
          </div>
        ) 
        
        /* State 2: Kosong (Semua sudah diverifikasi) */
        : orders.length === 0 ? (
          <div className="col-span-1 lg:col-span-2 bg-white p-16 rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Banknote size={40} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Semua Beres! 🎉</h3>
            <p className="text-sm text-slate-500 font-medium max-w-md">Belum ada bukti pembayaran baru yang diunggah. Anda bisa bersantai sejenak.</p>
          </div>
        ) 
        
        /* State 3: Ada Data */
        : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200 overflow-hidden flex flex-col sm:flex-row transition-shadow">
              
              {/* Kiri: Preview Struk */}
              <div className="w-full sm:w-48 h-56 sm:h-auto bg-slate-100 relative group shrink-0 border-b sm:border-b-0 sm:border-r border-slate-200 flex items-center justify-center">
                <img 
                  src={`http://localhost:3001/uploads/${order.buktiPembayaran}`} 
                  alt="Struk Transfer" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Jika gambar gagal dimuat (misal terhapus), ganti dengan icon
                    (e.target as HTMLImageElement).style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-slate-50');
                  }}
                />
                {/* Fallback Icon jika gambar error (Berada di balik gambar) */}
                <ImageIcon size={32} className="text-slate-300 absolute -z-10" />

                {/* Overlay Zoom */}
                <button 
                  onClick={() => setSelectedProof(`http://localhost:3001/uploads/${order.buktiPembayaran}`)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2"
                >
                  <div className="p-3 bg-white/20 rounded-full">
                    <Eye size={24} />
                  </div>
                  <span className="text-xs font-bold tracking-wider uppercase">Lihat Penuh</span>
                </button>
              </div>

              {/* Kanan: Info & Action */}
              <div className="flex-1 p-5 flex flex-col justify-between bg-white">
                
                {/* Info Atas */}
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
                  
                  {/* Catatan (Bisa dihubungkan dengan field catatan jika ada di DB) */}
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    Menunggu validasi admin untuk nominal transfer sebesar 50% atau 100% dari total tagihan.
                  </p>
                </div>

                {/* Tombol Aksi */}
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
                  
                  {/* Tombol Tolak Berfungsi */}
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

      {/* Modal Zoom Gambar */}
      {selectedProof && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[99] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedProof(null)}>
          
          <button 
            onClick={() => setSelectedProof(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 p-3 rounded-full transition-colors z-50 shadow-lg border border-slate-700"
          >
            <X size={24} />
          </button>

          <div className="relative max-w-3xl max-h-[85vh] rounded-xl overflow-hidden shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedProof} 
              alt="Zoom Struk Transfer" 
              className="w-full h-full object-contain bg-slate-800" 
            />
          </div>
          <p className="text-white mt-6 font-medium text-sm tracking-wide">Ketuk area luar untuk menutup</p>
        </div>
      )}
    </div>
  );
}