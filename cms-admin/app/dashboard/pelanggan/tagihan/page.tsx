"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { Receipt, Upload, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function TagihanPelangganPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const fetchMyOrders = async () => {
    try {
      // Kita ambil semua pesanan dari backend
      const res = await fetch("http://localhost:3001/orders");
      const allOrders = await res.json();
      
      // Filter hanya pesanan milik user yang sedang login, dan statusnya belum lunas
      const myUnpaidOrders = allOrders.filter(
        (o: any) => o.userId === user?.id && o.statusPembayaran !== "LUNAS"
      );
      setOrders(myUnpaidOrders);
    } catch (error) {
      console.error("Gagal mengambil tagihan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyOrders();
  }, [user]);

  const handleUploadStruk = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    if (!file) return alert("Pilih foto struk terlebih dahulu!");

    const formData = new FormData();
    formData.append("struk", file);

    try {
      const res = await fetch(`http://localhost:3001/orders/${orderId}/upload-receipt`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Struk berhasil diunggah! Menunggu verifikasi Admin.");
        setFile(null);
        setSelectedOrder(null);
        fetchMyOrders(); // Refresh data
      }
    } catch (error) {
      alert("Gagal mengunggah struk.");
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);
  };

  return (
    <div className="font-sans max-w-4xl mx-auto pb-20 space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-2">Tagihan & Pembayaran</h1>
        <p className="text-emerald-50 opacity-90 text-sm">
          Selesaikan pembayaran Anda agar pesanan dapat segera kami produksi.
        </p>
        <Receipt size={100} className="absolute -bottom-4 -right-4 text-white opacity-20 transform rotate-12" />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Memuat tagihan...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-200 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">Hore! Tidak Ada Tagihan</h3>
          <p className="text-gray-500 text-sm">Semua pesanan Anda sudah dibayar lunas.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Info Rekening Bank */}
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex items-start gap-4">
            <AlertCircle className="text-blue-600 shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Instruksi Pembayaran</h4>
              <p className="text-sm text-blue-800 mb-3">Silakan transfer sesuai nominal tagihan ke rekening resmi Glowear berikut:</p>
              <div className="bg-white p-4 rounded-xl border border-blue-100 inline-block">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">BCA (Bank Central Asia)</p>
                <p className="text-xl font-mono font-black text-gray-800 tracking-wider">8473-1122-33</p>
                <p className="text-sm font-medium text-gray-600 mt-1">a/n Glowear Konveksi</p>
              </div>
            </div>
          </div>

          {/* Daftar Tagihan */}
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded">ORD-{order.id.substring(0,6).toUpperCase()}</span>
                    <span className="text-xs text-gray-400 font-medium">{new Date(order.waktuDibuat).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h3 className="font-bold text-gray-800">Pembayaran Sablon Custom</h3>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Tagihan</p>
                  <p className="text-2xl font-black text-emerald-600">{formatRupiah(order.totalHarga)}</p>
                </div>
              </div>

              <div className="p-6 bg-gray-50/50">
                {order.buktiPembayaran ? (
                  // Jika sudah upload tapi belum diverifikasi Admin
                  <div className="flex items-center gap-3 text-orange-600 bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <Clock size={20} />
                    <div>
                      <p className="font-bold text-sm">Menunggu Verifikasi Admin</p>
                      <p className="text-xs text-orange-700">Struk Anda sedang dicek. Harap tunggu sebentar.</p>
                    </div>
                  </div>
                ) : (
                  // Jika belum upload sama sekali
                  <form onSubmit={(e) => handleUploadStruk(e, order.id)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Upload Bukti Transfer</label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors">
                          <Upload size={20} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            {selectedOrder === order.id && file ? file.name : "Pilih file foto struk (JPG/PNG)"}
                          </span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              setSelectedOrder(order.id);
                              setFile(e.target.files?.[0] || null);
                            }}
                          />
                        </label>
                        <button 
                          type="submit"
                          disabled={selectedOrder !== order.id || !file}
                          className="bg-emerald-600 disabled:bg-gray-300 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-colors"
                        >
                          Kirim Struk
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}