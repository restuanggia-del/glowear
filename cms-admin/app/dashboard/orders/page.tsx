"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Truck, Package, CheckCircle, Clock, Banknote } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    statusPembayaran: "",
    dpAmount: 0
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:3001/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: updateForm.status,
          statusPembayaran: updateForm.statusPembayaran,
          dpAmount: Number(updateForm.dpAmount)
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchOrders();
        alert("Status pesanan berhasil diperbarui!");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem");
    }
  };

  const openUpdateModal = (order: any) => {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      statusPembayaran: order.statusPembayaran,
      dpAmount: order.dpAmount
    });
    setIsModalOpen(true);
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pesanan Masuk</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola status produksi dan pembayaran pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari ID Pesanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="py-3 px-6 font-semibold">ID & Waktu</th>
                <th className="py-3 px-6 font-semibold">Item & Tagihan</th>
                <th className="py-3 px-6 font-semibold">Status Pembayaran</th>
                <th className="py-3 px-6 font-semibold">Status Produksi</th>
                <th className="py-3 px-6 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="py-10 text-center text-gray-500">Memuat data...</td></tr> : 
               filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-6">
                    <p className="font-mono text-sm font-semibold text-gray-800">ORD-{order.id.substring(0, 6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.waktuDibuat)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-800 font-medium">{order.items?.length || 0} Macam Barang</p>
                    <p className="font-bold text-blue-600">{formatRupiah(order.totalHarga)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 ${
                      order.statusPembayaran === 'LUNAS' ? 'bg-green-100 text-green-700' : 
                      order.statusPembayaran === 'DP' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <Banknote size={14} /> {order.statusPembayaran}
                    </span>
                    {order.statusPembayaran === 'DP' && <p className="text-xs text-gray-500 mt-1">Sisa: {formatRupiah(order.sisaPembayaran)}</p>}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 ${
                      order.status === 'SELESAI' ? 'bg-green-100 text-green-700' :
                      order.status === 'DIKIRIM' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'DIPROSES' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status === 'SELESAI' ? <CheckCircle size={14}/> : order.status === 'DIKIRIM' ? <Truck size={14}/> : order.status === 'DIPROSES' ? <Package size={14}/> : <Clock size={14}/>}
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button onClick={() => openUpdateModal(order)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-blue-50/50">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Update Status */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Update Pesanan</h3>
                <p className="text-xs text-gray-500 font-mono">ORD-{selectedOrder.id.substring(0, 6).toUpperCase()}</p>
              </div>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
              
              {/* Status Produksi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Produksi</label>
                <select required value={updateForm.status} onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black outline-none focus:border-blue-500">
                  <option value="PENDING">Pending (Menunggu)</option>
                  <option value="DIPROSES">Diproses (Masuk Konveksi)</option>
                  <option value="DIKIRIM">Dikirim (Dalam Perjalanan)</option>
                  <option value="SELESAI">Selesai (Diterima Pelanggan)</option>
                  <option value="DIBATALKAN">Dibatalkan</option>
                </select>
              </div>

              {/* Status Pembayaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Pembayaran</label>
                <select required value={updateForm.statusPembayaran} onChange={(e) => setUpdateForm({...updateForm, statusPembayaran: e.target.value})} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black outline-none focus:border-blue-500">
                  <option value="BELUM_BAYAR">Belum Bayar</option>
                  <option value="DP">DP (Uang Muka)</option>
                  <option value="LUNAS">Lunas</option>
                </select>
              </div>

              {/* Input Nominal DP (Hanya muncul jika statusnya DP) */}
              {updateForm.statusPembayaran === 'DP' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <label className="block text-sm font-medium text-blue-800 mb-1">Nominal DP Masuk (Rp)</label>
                  <input 
                    type="number" 
                    required 
                    value={updateForm.dpAmount} 
                    onChange={(e) => setUpdateForm({...updateForm, dpAmount: Number(e.target.value)})} 
                    className="w-full border border-blue-200 rounded-md p-2.5 text-sm text-black outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-2">
                    Total Tagihan: {formatRupiah(selectedOrder.totalHarga)}<br/>
                    Sisa yang harus dilunasi: {formatRupiah(selectedOrder.totalHarga - updateForm.dpAmount)}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/2 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium">Batal</button>
                <button type="submit" className="w-1/2 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700">Simpan Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}