"use client";

import { useState, useEffect } from "react";
import { 
  Search, Edit, Truck, Package, CheckCircle, Clock, Banknote, 
  Eye, X, MapPin, FileText, CalendarDays, AlertCircle, 
  CheckCircle2, Info, XCircle, ChevronDown, Palette, Shirt, ImageIcon
} from "lucide-react";
import Image from "next/image"; 

// ==========================================
// CONFIGURASI & DATA MASTER
// ==========================================
const API_BASE_URL = "http://localhost:3001";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const openPreview = (url: string) => {
    setPreviewImageUrl(url);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewImageUrl(null), 200); 
  };

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  
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
    dpAmount: 0,
    nomorResi: ""
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
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
        const res = await fetch(`${API_BASE_URL}/orders/${selectedOrder.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: updateForm.status,
            statusPembayaran: updateForm.statusPembayaran,
            dpAmount: Number(updateForm.dpAmount),
            nomorResi: updateForm.nomorResi
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
      dpAmount: order.dpAmount || 0,
      nomorResi: order.nomorResi || ""
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
    String(order.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 md:p-6 relative min-h-[calc(100vh-80px)] flex flex-col">
          {/* Penambahan min-h-[85vh] dan relative agar absolute modal terkurung di komponen ini */}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pesanan Masuk</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola produksi & cek detail desain custom pelanggan Glowear.</p>
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
                      ORD-{String(order.id).substring(0, 6).toUpperCase()}
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
        <div className="absolute inset-0 z-[50] pointer-events-none flex justify-center items-start pt-[5vh]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity pointer-events-auto rounded-xl" onClick={() => setIsDetailModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl text-left overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-100 mx-4 pointer-events-auto">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white flex-shrink-0 z-10 relative">
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

            <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-slate-50/50 custom-scrollbar relative z-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <section className="md:col-span-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><MapPin size={12} className="text-rose-500"/> Alamat Pengiriman</h3>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-slate-700 h-full flex items-center">
                    <p className="text-sm font-medium leading-relaxed">{selectedOrder.alamatPengiriman || "Alamat tidak tersedia"}</p>
                  </div>
                </section>
                
                <section className="md:col-span-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><FileText size={12} className="text-amber-500"/> Catatan Utama</h3>
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-sm text-amber-900 italic font-medium shadow-sm h-full flex items-center">
                    {selectedOrder.catatanCustom ? `"${selectedOrder.catatanCustom}"` : 'Tidak ada catatan tambahan.'}
                  </div>
                </section>

                <section className="md:col-span-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Banknote size={12} className="text-emerald-500"/> Ringkasan Biaya</h3>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5 text-sm text-slate-700 shadow-sm">
                    <div className="flex justify-between items-center"><span className="font-medium text-slate-500">Total</span><span className="font-black text-lg text-slate-800">{formatRupiah(selectedOrder.totalHarga)}</span></div>
                    <div className="flex justify-between items-center text-blue-700 bg-blue-50 px-2 py-1 rounded-md"><span className="font-bold">DP Paid</span><span className="font-black">{formatRupiah(selectedOrder.dpAmount)}</span></div>
                    <div className="flex justify-between items-center text-rose-600 border-t border-slate-100 pt-2.5"><span className="font-bold uppercase tracking-wider text-[10px]">Sisa Pelunasan</span><span className="font-black text-base">{formatRupiah(selectedOrder.sisaPembayaran)}</span></div>
                  </div>
                </section>
              </div>

              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2.5 flex items-center gap-2">
                  <Shirt size={14} className="text-blue-500"/> Daftar Barang Produksi ({selectedOrder.items?.length || 0})
                </h3>
                
                <div className="space-y-6">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row gap-6 p-6 transition-hover hover:shadow-md">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-blue-600"><Shirt size={20}/></div>
                          <div>
                            <p className="font-black text-slate-900 text-base">{item.product?.namaProduk || "Produk Custom"}</p>
                            <p className="text-xs font-bold text-slate-500 mt-0.5">{item.jumlah} Pcs x {formatRupiah(item.hargaSatuan)}</p>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
                          {item.jenisSablon && <p className="text-sm font-medium text-slate-600">Jenis Sablon: <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md text-xs border border-blue-200">{item.jenisSablon}</span></p>}
                          {item.deskripsiDesain && (
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Permintaan Desain:</p>
                              <p className="text-sm text-slate-700 mt-1 font-medium leading-relaxed">{item.deskripsiDesain}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Palette size={12} className="text-blue-500"/> Lampiran Desain Custom</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-500 text-center">Desain Depan</p>
                            <div className="aspect-square bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden relative group cursor-pointer" 
                              onClick={() => openPreview(`${API_BASE_URL}/${item.fileDesainDepan}`)}
                            >
                              {item.fileDesainDepan ? (
                                <>
                                  <Image src={`${API_BASE_URL}/${item.fileDesainDepan}`} alt="Depan" fill className="object-cover group-hover:scale-110 transition-transform duration-300"/>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Eye size={20}/></div>
                                </>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1"><ImageIcon size={24}/><span className="text-[10px]">Polos</span></div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-500 text-center">Desain Belakang</p>
                            <div className="aspect-square bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden relative group cursor-pointer"
                              onClick={() => openPreview(`${API_BASE_URL}/${item.fileDesainBelakang}`)}
                            >
                              {item.fileDesainBelakang ? (
                                <>
                                  <Image src={`${API_BASE_URL}/${item.fileDesainBelakang}`} alt="Belakang" fill className="object-cover group-hover:scale-110 transition-transform duration-300"/>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Eye size={20}/></div>
                                </>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1"><ImageIcon size={24}/><span className="text-[10px]">Polos</span></div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {item.fileGambarReferensi && (
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-500">Gambar Referensi/Inspirasi</p>
                            <div className="w-full h-20 bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden relative group cursor-pointer"
                              onClick={() => openPreview(`${API_BASE_URL}/${item.fileGambarReferensi}`)}
                            >
                              <Image src={`${API_BASE_URL}/${item.fileGambarReferensi}`} alt="Referensi" fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 text-xs font-bold"><Eye size={16}/> Zoom Ref</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-white flex justify-end flex-shrink-0 relative z-10">
              <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-md shadow-slate-900/20">
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL PREVIEW GAMBAR
      ========================================= */}
      {isPreviewOpen && previewImageUrl && (
        <div className="absolute inset-0 z-[60] pointer-events-none flex items-start pt-[5vh] justify-center">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm pointer-events-auto rounded-xl" onClick={closePreview}></div>
          
          <div className="relative z-10 p-4 flex flex-col items-center justify-center pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative inline-block">
              <Image 
                src={previewImageUrl} 
                alt="Zoom Preview" 
                width={800} 
                height={800} 
                className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300"
              />
              <button onClick={closePreview} className="absolute -top-4 -right-4 z-20 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 border border-white/10 transition-colors shadow-xl">
                <X size={20} />
              </button>
            </div>
            <p className="text-white/60 text-xs mt-6 font-medium tracking-wide">Klik di luar gambar atau tombol X untuk menutup</p>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL UPDATE STATUS
      ========================================= */}
      {isModalOpen && selectedOrder && (
        <div className="absolute inset-0 z-[50] pointer-events-none flex justify-center items-start pt-[10vh]">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity pointer-events-auto rounded-xl" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md text-left overflow-visible animate-in fade-in zoom-in-95 duration-200 border border-slate-100 pointer-events-auto mx-4">
            
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

              {updateForm.status === 'DIKIRIM' && (
                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 shadow-inner mt-4">
                  <label className="block text-[11px] font-black text-purple-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Truck size={14} /> Nomor Resi Pengiriman
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: JNE123456789"
                    value={updateForm.nomorResi} 
                    onChange={(e) => setUpdateForm({...updateForm, nomorResi: e.target.value})} 
                    className="w-full border border-purple-200 rounded-xl p-3 text-sm font-bold text-slate-800 bg-white outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                  />
                  <p className="text-[10px] text-purple-600 mt-2 font-medium italic">*Nomor ini akan langsung terlihat oleh pelanggan di aplikasi HP mereka.</p>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-full font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-600/20">Simpan Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          CUSTOM DIALOG SYSTEM
      ========================================= */}
      {dialog.isOpen && (
        <div className="absolute inset-0 z-[70] pointer-events-none flex justify-center items-start pt-[15vh]">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity pointer-events-auto rounded-xl" onClick={() => dialog.type !== 'confirm' && closeDialog()}></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200 border border-slate-100 pointer-events-auto mx-4">
            
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
      )}

    </div>
  );
}