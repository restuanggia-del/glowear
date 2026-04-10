"use client";

import { useState, useEffect } from "react";
import { 
  Search, Edit, Truck, Package, CheckCircle, Clock, Banknote, 
  Eye, X, MapPin, FileText, CalendarDays, AlertCircle, 
  CheckCircle2, Info, XCircle, ChevronDown 
} from "lucide-react";

// ==========================================
// DATA MASTER UNTUK CUSTOM DROPDOWN
// ==========================================
const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending (Menunggu)', icon: Clock, color: 'text-orange-500' },
  { value: 'DIPROSES', label: 'Diproses (Masuk Konveksi)', icon: Package, color: 'text-blue-500' },
  { value: 'DIKIRIM', label: 'Dikirim (Dalam Perjalanan)', icon: Truck, color: 'text-purple-500' },
  { value: 'SELESAI', label: 'Selesai (Diterima Pelanggan)', icon: CheckCircle, color: 'text-emerald-500' },
  { value: 'DIBATALKAN', label: 'Dibatalkan', icon: XCircle, color: 'text-rose-500' }
];

const PAYMENT_OPTIONS = [
  { value: 'BELUM_BAYAR', label: 'Belum Bayar', icon: AlertCircle, color: 'text-slate-500' },
  { value: 'DP', label: 'DP (Uang Muka)', icon: Banknote, color: 'text-blue-500' },
  { value: 'LUNAS', label: 'Lunas', icon: CheckCircle2, color: 'text-emerald-500' }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal Utama
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // State Custom Dropdown
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  
  // State Custom Dialog
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
      showDialog('error', 'Koneksi Gagal', 'Tidak dapat mengambil data pesanan dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    showDialog('confirm', 'Konfirmasi Update', `Yakin ingin mengubah status pesanan ORD-${selectedOrder.id.substring(0, 6).toUpperCase()}?`, async () => {
      closeDialog();
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
          showDialog('success', 'Berhasil!', 'Status pesanan berhasil diperbarui.');
        } else {
          showDialog('error', 'Gagal', 'Terjadi kesalahan saat memperbarui status.');
        }
      } catch (error) {
        showDialog('error', 'Kesalahan Sistem', 'Gagal terhubung ke server saat memperbarui data.');
      }
    });
  };

  const openUpdateModal = (order: any) => {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      statusPembayaran: order.statusPembayaran,
      dpAmount: order.dpAmount
    });
    setIsStatusDropdownOpen(false);
    setIsPaymentDropdownOpen(false);
    setIsModalOpen(true);
  };

  const openDetailModal = (order: any) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
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
    <div className="space-y-6 pb-10 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pesanan Masuk</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola status produksi dan pembayaran pelanggan Glowear.</p>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-full max-w-md group">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari ID Pesanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-800 transition-all placeholder:text-slate-400 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6 font-bold">ID & Waktu</th>
                <th className="py-4 px-6 font-bold">Item & Tagihan</th>
                <th className="py-4 px-6 font-bold">Pembayaran</th>
                <th className="py-4 px-6 font-bold">Produksi</th>
                <th className="py-4 px-6 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-500 font-medium">Memuat data pesanan...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-slate-500 font-medium">Tidak ada pesanan ditemukan.</td></tr>
              ) : (
               filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block mb-1 border border-slate-200">
                      ORD-{order.id.substring(0, 6).toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">{formatDate(order.waktuDibuat)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-xs text-slate-600 font-bold mb-0.5">{order.items?.length || 0} Macam Barang</p>
                    <p className="font-black text-blue-600 text-sm">{formatRupiah(order.totalHarga)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      order.statusPembayaran === 'LUNAS' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                      order.statusPembayaran === 'DP' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      <Banknote size={12} /> {order.statusPembayaran.replace('_', ' ')}
                    </span>
                    {order.statusPembayaran === 'DP' && <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-wider">Sisa: {formatRupiah(order.sisaPembayaran)}</p>}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      order.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      order.status === 'DIKIRIM' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                      order.status === 'DIPROSES' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      order.status === 'DIBATALKAN' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {order.status === 'SELESAI' ? <CheckCircle size={12}/> : order.status === 'DIKIRIM' ? <Truck size={12}/> : order.status === 'DIPROSES' ? <Package size={12}/> : order.status === 'DIBATALKAN' ? <XCircle size={12}/> : <Clock size={12}/>}
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openDetailModal(order)} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-all bg-slate-100 border border-slate-200 shadow-sm" title="Lihat Detail">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => openUpdateModal(order)} className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all bg-blue-50 border border-blue-100 shadow-sm" title="Update Status">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          MODAL DETAIL PESANAN
      ========================================= */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailModalOpen(false)}></div>
            
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl text-left overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 sm:my-8">
              
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0">
                <div>
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Package className="text-blue-600"/> Detail Pesanan 
                    <span className="font-mono text-slate-400 font-bold text-lg bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">ORD-{selectedOrder.id.substring(0, 6).toUpperCase()}</span>
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 font-medium flex items-center gap-1.5">
                    <CalendarDays size={14}/> Dibuat pada {formatDate(selectedOrder.waktuDibuat)}
                  </p>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kolom Kiri */}
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Alamat Pengiriman</h3>
                      <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-slate-700">
                        <MapPin size={18} className="text-rose-500 mt-0.5 shrink-0"/>
                        <p className="text-sm font-medium leading-relaxed">{selectedOrder.alamatPengiriman || "Alamat tidak tersedia"}</p>
                      </div>
                    </section>
                    
                    <section>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText size={14}/> Catatan Pelanggan
                      </h3>
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-sm text-amber-900 italic font-medium shadow-sm">
                        {selectedOrder.catatanCustom ? `"${selectedOrder.catatanCustom}"` : 'Tidak ada catatan tambahan.'}
                      </div>
                    </section>
                  </div>

                  {/* Kolom Kanan: Keuangan */}
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ringkasan Pembayaran</h3>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-sm text-slate-700 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-500">Total Tagihan</span>
                          <span className="font-black text-lg text-slate-800">{formatRupiah(selectedOrder.totalHarga)}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-700 bg-blue-50/50 p-2 rounded-lg">
                          <span className="font-bold">DP Dibayar</span>
                          <span className="font-black">{formatRupiah(selectedOrder.dpAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-rose-600 border-t border-slate-100 pt-3">
                          <span className="font-bold uppercase tracking-wider text-[10px]">Sisa Pelunasan</span>
                          <span className="font-black text-base">{formatRupiah(selectedOrder.sisaPembayaran)}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Rincian Item */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">
                    Daftar Barang ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex flex-col sm:flex-row justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm gap-4">
                        <div>
                          <p className="font-black text-slate-800 text-sm">{item.product?.namaProduk || "Produk Tidak Diketahui"}</p>
                          <div className="text-xs font-medium text-slate-500 mt-1.5 space-y-1">
                            {item.jenisSablon && <p>Sablon: <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.jenisSablon}</span></p>}
                            {item.deskripsiDesain && <p>Desain: {item.deskripsiDesain}</p>}
                          </div>
                        </div>
                        <div className="text-right shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center h-fit">
                          <p className="text-sm font-black text-slate-800">{item.jumlah} Pcs</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{formatRupiah(item.hargaSatuan)} / pcs</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              
              <div className="p-5 border-t border-slate-100 bg-white flex justify-end flex-shrink-0">
                <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/20">
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL UPDATE STATUS (Dengan Custom Dropdown & Centered)
      ========================================= */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md text-left overflow-visible animate-in fade-in zoom-in-95 duration-200 sm:my-8 border border-slate-100">
              
              <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100 rounded-t-[2rem]">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Update Pesanan</h3>
                  <p className="text-xs text-slate-500 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-1 border border-slate-200">ORD-{selectedOrder.id.substring(0, 6).toUpperCase()}</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 border border-slate-200">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5 bg-slate-50/50 rounded-b-[2rem]">
                
                {/* Custom Dropdown: Status Produksi */}
                <div className="relative">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Status Produksi</label>
                  <button 
                    type="button" 
                    onClick={() => { setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsPaymentDropdownOpen(false); }}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white flex justify-between items-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  >
                    <span className="flex items-center gap-2.5">
                      {(() => {
                        const opt = STATUS_OPTIONS.find(o => o.value === updateForm.status);
                        const Icon = opt?.icon || Clock;
                        return <><Icon size={16} className={opt?.color || "text-slate-400"} /> {opt?.label || "Pilih Status"}</>;
                      })()}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isStatusDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <div 
                          key={opt.value} 
                          onClick={() => { setUpdateForm({...updateForm, status: opt.value}); setIsStatusDropdownOpen(false); }}
                          className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                        >
                          <opt.icon size={16} className={opt.color} />
                          <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Dropdown: Status Pembayaran */}
                <div className="relative">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Status Pembayaran</label>
                  <button 
                    type="button" 
                    onClick={() => { setIsPaymentDropdownOpen(!isPaymentDropdownOpen); setIsStatusDropdownOpen(false); }}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white flex justify-between items-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                  >
                    <span className="flex items-center gap-2.5">
                      {(() => {
                        const opt = PAYMENT_OPTIONS.find(o => o.value === updateForm.statusPembayaran);
                        const Icon = opt?.icon || AlertCircle;
                        return <><Icon size={16} className={opt?.color || "text-slate-400"} /> {opt?.label || "Pilih Status"}</>;
                      })()}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isPaymentDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isPaymentDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {PAYMENT_OPTIONS.map((opt) => (
                        <div 
                          key={opt.value} 
                          onClick={() => { setUpdateForm({...updateForm, statusPembayaran: opt.value}); setIsPaymentDropdownOpen(false); }}
                          className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                        >
                          <opt.icon size={16} className={opt.color} />
                          <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input DP */}
                {updateForm.statusPembayaran === 'DP' && (
                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 shadow-inner">
                    <label className="block text-[11px] font-black text-blue-800 uppercase tracking-widest mb-2">Nominal DP Masuk (Rp)</label>
                    <input 
                      type="number" 
                      required 
                      value={updateForm.dpAmount || ''} 
                      onChange={(e) => setUpdateForm({...updateForm, dpAmount: Number(e.target.value)})} 
                      className="w-full border border-blue-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                    />
                    <div className="text-xs font-medium text-blue-700 mt-3 space-y-1 bg-white/50 p-2 rounded-lg border border-blue-100/50">
                      <p className="flex justify-between"><span>Tagihan:</span> <span className="font-bold">{formatRupiah(selectedOrder.totalHarga)}</span></p>
                      <p className="flex justify-between text-rose-600"><span>Sisa Pelunasan:</span> <span className="font-bold">{formatRupiah(selectedOrder.totalHarga - updateForm.dpAmount)}</span></p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-full font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Batal</button>
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20">Simpan Update</button>
                </div>
              </form>
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