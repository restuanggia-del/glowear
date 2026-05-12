"use client";

import { useState, useEffect } from "react";
import {
  Search, Edit, Truck, Package, CheckCircle, Clock, Banknote,
  Eye, X, MapPin, FileText, CalendarDays, AlertCircle,
  CheckCircle2, Info, XCircle, ChevronDown, Palette, Shirt, ImageIcon, Printer, ShoppingBag, Users
} from "lucide-react";
import Image from "next/image"; // Menggunakan Next Image untuk optimasi
import { api } from "@/app/services/api";
import Invoice from "@/app/components/Invoice";

// ==========================================
// CONFIGURASI & DATA MASTER
// ==========================================
const API_BASE_URL = "http://localhost:3001"; // Sesuaikan dengan URL Backend Anda

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

  // ==========================================
  // STATE BARU: IMAGE PREVIEW (ZOOM)
  // ==========================================
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // State Baru: Invoice (Print)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);

  const openInvoice = (order: any) => {
    setInvoiceOrder(order);
    setIsInvoiceOpen(true);
  };

  const openPreview = (url: string) => {
    setPreviewImageUrl(url);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewImageUrl(null), 200); // Delay hapus URL agar transisi mulus
  };
  // ==========================================

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
    dpAmount: 0,
    kurir: "",
    nomorResi: ""
  });

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders");
      // Check if data is array before setting, to prevent filter error
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
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
        const { status } = await api.put(`/orders/${selectedOrder.id}/status`, {
          status: updateForm.status,
          statusPembayaran: updateForm.statusPembayaran,
          dpAmount: Number(updateForm.dpAmount),
          kurir: updateForm.kurir,
          nomorResi: updateForm.nomorResi
        });

        if (status === 200 || status === 201) {
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
      kurir: order.kurir || "",
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SELESAI': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'DIKIRIM': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'DIPROSES': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DIBATALKAN': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  const filteredOrders = orders.filter((order) =>
    String(order.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10 relative">

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
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${order.statusPembayaran === 'LUNAS' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        order.statusPembayaran === 'DP' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                        <Banknote size={12} /> {order.statusPembayaran.replace('_', ' ')}
                      </span>
                      {order.statusPembayaran === 'DP' && <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-wider">Sisa: {formatRupiah(order.sisaPembayaran)}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${order.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        order.status === 'DIKIRIM' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          order.status === 'DIPROSES' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            order.status === 'DIBATALKAN' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}>
                        {order.status === 'SELESAI' ? <CheckCircle size={12} /> : order.status === 'DIKIRIM' ? <Truck size={12} /> : order.status === 'DIPROSES' ? <Package size={12} /> : order.status === 'DIBATALKAN' ? <XCircle size={12} /> : <Clock size={12} />}
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
                        <button onClick={() => openInvoice(order)} className="p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-lg transition-all bg-emerald-50 border border-emerald-100 shadow-sm" title="Cetak Struk">
                          <Printer size={16} />
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
          MODAL DETAIL PESANAN (PREMIUM OVERHAUL)
      ========================================= */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] overflow-y-auto pt-[110px] pl-4 lg:ml-[320px] lg:pl-0">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsDetailModalOpen(false)}></div>

            <div className="relative bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.25)] w-full max-w-5xl text-left overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20">

              {/* Modern Header dengan Gradients */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-8 text-white relative overflow-hidden flex-shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl border border-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                      <ShoppingBag size={32} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black tracking-tight">Detail Pesanan</h2>
                        <span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-400/50 shadow-lg shadow-blue-900/40">
                          #{selectedOrder.id.substring(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 font-medium mt-1 flex items-center gap-2">
                        <CalendarDays size={14} className="text-slate-500" /> Terdaftar pada {formatDate(selectedOrder.waktuDibuat)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className={`px-5 py-2 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border shadow-lg ${getStatusStyle(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 bg-white/10 border border-white/10 text-white`}>
                      Status Bayar: <span className="text-blue-400">{selectedOrder.statusPembayaran}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-8 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-50/50">

                {/* Section 1: Customer & Logistics Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm group hover:shadow-md transition-all duration-300">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Users size={14} className="text-blue-500" /> Informasi Pelanggan
                    </h3>
                    <div className="space-y-3">
                      <p className="text-base font-black text-slate-900 leading-none">{selectedOrder.pengguna?.nama || "Pelanggan Glowear"}</p>
                      <p className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> {selectedOrder.pengguna?.email}
                      </p>
                      <p className="text-[13px] text-slate-500 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> {selectedOrder.pengguna?.noTelp}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm group hover:shadow-md transition-all duration-300">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <MapPin size={14} className="text-rose-500" /> Alamat Pengiriman
                    </h3>
                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                      {selectedOrder.alamatPengiriman || "Alamat tidak dicantumkan."}
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm group hover:shadow-md transition-all duration-300">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Banknote size={14} className="text-emerald-500" /> Ringkasan Finansial
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl">
                        <span className="text-xs font-bold text-slate-500">Total Tagihan</span>
                        <span className="text-sm font-black text-slate-900">{formatRupiah(selectedOrder.totalHarga)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-blue-50/50 px-4 py-2.5 rounded-xl border border-blue-100/50">
                        <span className="text-xs font-bold text-blue-600">Terbayar (DP)</span>
                        <span className="text-sm font-black text-blue-700">{formatRupiah(selectedOrder.dpAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100/50">
                        <span className="text-xs font-bold text-rose-500">Sisa Pelunasan</span>
                        <span className="text-sm font-black text-rose-700">{formatRupiah(selectedOrder.sisaPembayaran)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Items Overhaul */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Shirt size={16} className="text-blue-500" /> Item Produksi ({selectedOrder.items?.length || 0})
                    </h3>
                    <div className="h-px flex-1 bg-slate-200 mx-6"></div>
                  </div>

                  <div className="space-y-6">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col md:flex-row gap-0 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">

                        {/* Area Info (Kiri) */}
                        <div className="flex-1 p-8">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                              <Shirt size={28} />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-lg leading-none">{item.product?.namaProduk || "Produk Custom"}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">{item.jumlah} PCS</span>
                                <span className="text-xs font-bold text-slate-400">@ {formatRupiah(item.hargaSatuan)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Pilihan Sablon</p>
                              <p className="text-sm font-bold text-slate-700">{item.jenisSablon || "Tidak ditentukan"}</p>
                            </div>
                            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50">
                              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Catatan Desain</p>
                              <p className="text-[13px] font-medium text-slate-700 italic line-clamp-2">
                                {item.deskripsiDesain ? `"${item.deskripsiDesain}"` : "Tidak ada catatan."}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Area Lampiran (Kanan) */}
                        <div className="w-full md:w-[360px] bg-slate-50/80 p-8 border-t md:border-t-0 md:border-l border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Aset Desain Pelanggan</p>

                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: 'Depan', file: item.fileDesainDepan },
                              { label: 'Belakang', file: item.fileDesainBelakang }
                            ].map((design, i) => (
                              <div key={i} className="space-y-2">
                                <div
                                  className="aspect-square bg-white rounded-2xl border-2 border-slate-200 overflow-hidden relative group cursor-pointer shadow-sm hover:border-blue-400 transition-all duration-300"
                                  onClick={() => design.file && openPreview(`${API_BASE_URL}/${design.file}`)}
                                >
                                  {design.file ? (
                                    <>
                                      <Image src={`${API_BASE_URL}/${design.file}`} alt={design.label} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                      <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white backdrop-blur-[2px]">
                                        <Eye size={24} className="scale-75 group-hover:scale-100 transition-transform duration-300" />
                                      </div>
                                    </>
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-1 bg-slate-50">
                                      <ImageIcon size={24} className="opacity-40" />
                                      <span className="text-[9px] font-bold uppercase tracking-widest">Polos</span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest">{design.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Modern Action Bar */}
              <div className="p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-3 bg-white text-slate-600 rounded-xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm border border-slate-200 uppercase tracking-widest">
                    Tutup
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setIsDetailModalOpen(false); openUpdateModal(selectedOrder); }}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20 flex items-center gap-3 uppercase tracking-widest border border-slate-700"
                  >
                    <Edit size={16} /> Update Status
                  </button>
                  <button
                    onClick={() => openInvoice(selectedOrder)}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-600/20 flex items-center gap-3 uppercase tracking-widest border border-emerald-500"
                  >
                    <Printer size={18} /> Cetak Struk
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL PREVIEW GAMBAR (ZOOM LIGHTBOX)
      ========================================= */}
      {isPreviewOpen && previewImageUrl && (
        <div className="fixed inset-0 z-[100] pt-[110px] pl-4 lg:ml-[320px] lg:pl-0 h-[calc(100vh-110px)] flex items-center justify-center animate-in fade-in duration-300" onClick={closePreview}>
          {/* Backdrop Gelap */}
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm"></div>

          {/* Kontainer Gambar (Centered) */}
          <div className="relative z-10 max-w-7xl max-h-[90vh] p-4 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Image
              src={previewImageUrl}
              alt="Zoom Preview"
              width={1200}
              height={1200}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border-4 border-white/10 animate-in zoom-in-95 duration-300"
            />
            <p className="text-white/60 text-xs mt-4 font-medium tracking-wide">Klik di luar gambar atau tombol X untuk menutup</p>
          </div>

          {/* Tombol Tutup X */}
          <button onClick={closePreview} className="absolute top-6 right-6 z-20 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 border border-white/10 transition-colors">
            <X size={28} />
          </button>
        </div>
      )}

      {/* =========================================
          MODAL UPDATE STATUS (Icon Dropdown & Centered)
      ========================================= */}
      {/* =========================================
          MODAL UPDATE STATUS (PREMIUM CENTERED)
      ========================================= */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">

            {/* Header dengan Icon Visual */}
            <div className="p-8 pb-4 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
                <Edit size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Perbarui Pesanan</h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">ID: #{selectedOrder.id.substring(0, 8).toUpperCase()}</p>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-8 pt-4 space-y-6">

              {/* Dropdown Produksi */}
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Tahap Produksi</label>
                <button
                  type="button"
                  onClick={() => { setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsPaymentDropdownOpen(false); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 flex justify-between items-center hover:bg-white hover:border-blue-400 transition-all shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    {(() => {
                      const opt = STATUS_OPTIONS.find(o => o.value === updateForm.status);
                      const Icon = opt?.icon || Clock;
                      return <><div className={`w-8 h-8 rounded-lg ${opt?.color.replace('text', 'bg')}/10 flex items-center justify-center`}><Icon size={16} className={opt?.color} /></div> {opt?.label || "Pilih Status"}</>;
                    })()}
                  </span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden p-2 animate-in fade-in slide-in-from-top-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setUpdateForm({ ...updateForm, status: opt.value }); setIsStatusDropdownOpen(false); }}
                        className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <div className={`w-8 h-8 rounded-lg ${opt.color.replace('text', 'bg')}/10 flex items-center justify-center`}><opt.icon size={16} className={opt.color} /></div>
                        <span className="text-[13px] font-bold text-slate-700">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropdown Pembayaran */}
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Status Keuangan</label>
                <button
                  type="button"
                  onClick={() => { setIsPaymentDropdownOpen(!isPaymentDropdownOpen); setIsStatusDropdownOpen(false); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 flex justify-between items-center hover:bg-white hover:border-blue-400 transition-all shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    {(() => {
                      const opt = PAYMENT_OPTIONS.find(o => o.value === updateForm.statusPembayaran);
                      const Icon = opt?.icon || AlertCircle;
                      return <><div className={`w-8 h-8 rounded-lg ${opt?.color.replace('text', 'bg')}/10 flex items-center justify-center`}><Icon size={16} className={opt?.color} /></div> {opt?.label || "Pilih Status"}</>;
                    })()}
                  </span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isPaymentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPaymentDropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden p-2 animate-in fade-in slide-in-from-top-2">
                    {PAYMENT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setUpdateForm({ ...updateForm, statusPembayaran: opt.value }); setIsPaymentDropdownOpen(false); }}
                        className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <div className={`w-8 h-8 rounded-lg ${opt.color.replace('text', 'bg')}/10 flex items-center justify-center`}><opt.icon size={16} className={opt.color} /></div>
                        <span className="text-[13px] font-bold text-slate-700">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Area Nominal DP */}
              {updateForm.statusPembayaran === 'DP' && (
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 animate-in slide-in-from-bottom-2">
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 px-1">Nominal Pembayaran (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-blue-400 text-lg">Rp</span>
                    <input
                      type="number"
                      required
                      value={updateForm.dpAmount || ''}
                      onChange={(e) => setUpdateForm({ ...updateForm, dpAmount: Number(e.target.value) })}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-blue-100 focus:border-blue-500 outline-none font-black text-blue-900 transition-all text-xl"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Area Pengiriman */}
              {updateForm.status === 'DIKIRIM' && (
                <div className="space-y-4 p-6 bg-indigo-50 rounded-3xl border border-indigo-100 animate-in slide-in-from-bottom-2">
                  <div>
                    <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 px-1">Kurir / Ekspedisi</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: J&T Express"
                      value={updateForm.kurir || ''}
                      onChange={(e) => setUpdateForm({ ...updateForm, kurir: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-white border-2 border-indigo-100 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 px-1">Nomor Resi</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan resi pengiriman"
                      value={updateForm.nomorResi || ''}
                      onChange={(e) => setUpdateForm({ ...updateForm, nomorResi: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-white border-2 border-indigo-100 focus:border-indigo-500 outline-none font-black text-indigo-900 transition-all text-sm uppercase tracking-widest"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-1 py-4 flex-1 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Batal
                </button>
                <button type="submit" className="px-1 py-4 flex-1 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          DIALOG KONFIRMASI (PREMIUM ALERT)
      ========================================= */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={closeDialog}></div>

          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/20 p-8 text-center">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ${dialog.type === 'confirm' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
              {dialog.type === 'confirm' ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
            </div>

            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">{dialog.title}</h3>
            <p className="text-slate-500 font-medium text-[13px] mb-8 leading-relaxed px-2">{dialog.message}</p>

            <div className="flex flex-col gap-3">
              {dialog.type === 'confirm' ? (
                <>
                  <button onClick={dialog.onConfirm} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all active:scale-95">
                    Ya, Lanjutkan
                  </button>
                  <button onClick={closeDialog} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all">
                    Batalkan
                  </button>
                </>
              ) : (
                <button onClick={closeDialog} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 transition-all active:scale-95">
                  Selesai
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL INVOICE (PRINTABLE)
      ========================================= */}
      {isInvoiceOpen && (
        <Invoice order={invoiceOrder} onClose={() => setIsInvoiceOpen(false)} />
      )}

    </div>
  );
}