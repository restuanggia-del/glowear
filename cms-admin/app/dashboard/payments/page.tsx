"use client";

import { useState, useEffect } from "react";
import { Check, X, Eye, Banknote, Clock, User, ImageIcon } from "lucide-react";

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

  useEffect(() => { fetchPayments(); }, []);

  const handleVerify = async (orderId: string, status: "DP" | "LUNAS") => {
    if (!confirm(`Konfirmasi pembayaran ini sebagai ${status}?`)) return;
    
    try {
      await fetch(`http://localhost:3001/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusPembayaran: status, status: "DIPROSES" }),
      });
      fetchPayments();
      alert("Pembayaran Terverifikasi! Status pesanan berubah menjadi DIPROSES.");
    } catch (error) {
      alert("Gagal verifikasi");
    }
  };

  return (
    <div className="font-sans space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Pembayaran</h1>
          <p className="text-sm text-gray-500">Konfirmasi bukti transfer dari pelanggan untuk memulai produksi.</p>
        </div>
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <Clock size={18}/> {orders.length} Menunggu Verifikasi
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : orders.length === 0 ? (
          <div className="col-span-2 bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center">
            <Banknote size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Belum ada bukti pembayaran baru yang diunggah.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row">
              {/* Sisi Kiri: Preview Struk */}
              <div className="w-full sm:w-48 h-64 sm:h-auto bg-gray-100 relative group">
                <img 
                  src={`http://localhost:3001/uploads/${order.buktiPembayaran}`} 
                  alt="Struk Transfer" 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedProof(`http://localhost:3001/uploads/${order.buktiPembayaran}`)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-sm font-bold"
                >
                  <Eye size={20} /> Zoom Struk
                </button>
              </div>

              {/* Sisi Kanan: Info & Tombol */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      ORD-{order.id.substring(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Tagihan: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(order.totalHarga)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={16} className="text-gray-400" />
                      <p className="text-sm font-bold">{order.pengguna?.nama || "Pelanggan"}</p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed italic">
                      "Telah transfer untuk pesanan custom kaos..."
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleVerify(order.id, "DP")}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold transition-transform active:scale-95"
                  >
                    Terima (DP 50%)
                  </button>
                  <button 
                    onClick={() => handleVerify(order.id, "LUNAS")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-bold transition-transform active:scale-95"
                  >
                    Terima (LUNAS)
                  </button>
                  <button className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Zoom Gambar */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black/90 z-[99] flex items-center justify-center p-4" onClick={() => setSelectedProof(null)}>
          <img src={selectedProof} className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/40">
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}