"use client";

import { useState, useEffect } from "react";
import { Download, FileSpreadsheet, Calendar, TrendingUp, CheckCircle2, Banknote, Loader2, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import DialogModal, { DialogState, DEFAULT_DIALOG, DialogType } from "@/app/components/ui/DialogModal";

export default function ReportsPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // STATE CUSTOM DIALOG
  // ==========================================
  const [dialog, setDialog] = useState<DialogState>(DEFAULT_DIALOG);

  const showDialog = (type: DialogType, title: string, message: string, onConfirm?: () => void) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };

  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));
  // ==========================================

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/orders/report?month=${selectedMonth}&year=${selectedYear}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      showDialog('error', 'Koneksi Gagal', 'Gagal mengambil data laporan dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [selectedMonth, selectedYear]);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);
  };

  const exportToExcel = () => {
    if (!data || !data.orders || data.orders.length === 0) {
      showDialog('error', 'Data Kosong', 'Tidak ada data pesanan pada periode ini untuk diekspor.');
      return;
    }

    const excelData = data.orders.map((order: any, index: number) => ({
      "No": index + 1,
      "ID Pesanan": `ORD-${order.id.substring(0, 6).toUpperCase()}`,
      "Tanggal": new Date(order.waktuDibuat).toLocaleDateString("id-ID"),
      "Nama Pelanggan": order.pengguna?.nama || "Pelanggan",
      "Status Pembayaran": order.statusPembayaran.replace('_', ' '),
      "Status Produksi": order.status,
      "Total Tagihan (Rp)": order.totalHarga,
      "DP Masuk (Rp)": order.dpAmount || 0,
      "Sisa Pelunasan (Rp)": order.sisaPembayaran || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");

    worksheet["!cols"] = [
      { wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 25 }, 
      { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 15 }, { wch: 20 }
    ];

    XLSX.writeFile(workbook, `Laporan_Glowear_Bulan_${selectedMonth}_Tahun_${selectedYear}.xlsx`);
    showDialog('success', 'Ekspor Berhasil!', `File Excel bulan ke-${selectedMonth} tahun ${selectedYear} telah diunduh.`);
  };

  return (
    <div className="space-y-6 pb-10 relative">
      
      {/* Header & Filter */}
      {/* Header & Filter */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Laporan & Pembukuan</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">Rekapitulasi pendapatan konveksi dan ekspor data ke Excel.</p>
        </div>

        {/* Filter Bulan & Tahun */}
        <div className="flex flex-wrap sm:flex-nowrap items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-inner w-full lg:w-auto gap-1">
          <div className="flex items-center px-3 border-r border-slate-200 relative group flex-1 sm:w-auto">
            <Calendar size={15} className="text-slate-400 mr-2 shrink-0" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none w-full pr-5 py-1"
            >
              {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
            <ChevronDown size={14} className="text-slate-400 absolute right-2 pointer-events-none group-hover:text-blue-500" />
          </div>
          <div className="flex items-center px-3 relative group flex-1 sm:w-auto">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none w-full pr-5 py-1"
            >
              {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={14} className="text-slate-400 absolute right-2 pointer-events-none group-hover:text-blue-500" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 size={36} className="text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium text-sm">Menghitung kalkulasi pembukuan...</p>
        </div>
      ) : data ? (
        <>
          {/* Baris Kartu Ringkasan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proyeksi Omzet</p>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 truncate">{formatRupiah(data.summary?.totalOmzet || 0)}</h3>
                </div>
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100 shrink-0">
                  <TrendingUp size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uang Masuk (DP)</p>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 truncate">{formatRupiah(data.summary?.totalDP || 0)}</h3>
                </div>
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100 shrink-0">
                  <Banknote size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pesanan</p>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800">{data.summary?.totalPesanan || 0} Trx</h3>
                </div>
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100 shrink-0">
                  <FileSpreadsheet size={22} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selesai Produksi</p>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800">{data.summary?.pesananSelesai || 0} Selesai</h3>
                </div>
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm border border-orange-100 shrink-0">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

          </div>

          {/* Area Tabel Preview & Tombol Export */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-800">Pratinjau Data Bulan Ini</h2>
                <p className="text-xs text-slate-500 mt-0.5">Daftar transaksi yang masuk dalam periode laporan.</p>
              </div>
              <button 
                onClick={exportToExcel}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 border border-emerald-500 shrink-0"
              >
                <Download size={16} /> Unduh Excel
              </button>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-5 sm:px-6 font-bold">ID & Tanggal</th>
                    <th className="py-3.5 px-5 sm:px-6 font-bold">Pelanggan</th>
                    <th className="py-3.5 px-5 sm:px-6 font-bold">Total Tagihan</th>
                    <th className="py-3.5 px-5 sm:px-6 font-bold">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {!data.orders || data.orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <FileSpreadsheet size={36} className="text-slate-300 mb-3" />
                          <p className="font-medium text-sm">Tidak ada transaksi tercatat di bulan ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 sm:py-4 px-5 sm:px-6">
                          <p className="font-mono text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block mb-1 border border-slate-200">
                            ORD-{order.id.substring(0, 6).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">{new Date(order.waktuDibuat).toLocaleDateString('id-ID')}</p>
                        </td>
                        <td className="py-3.5 sm:py-4 px-5 sm:px-6 text-xs sm:text-sm font-bold text-slate-700">
                          {order.pengguna?.nama || "Pelanggan Anonim"}
                        </td>
                        <td className="py-3.5 sm:py-4 px-5 sm:px-6">
                          <p className="text-xs sm:text-sm font-black text-blue-600">{formatRupiah(order.totalHarga)}</p>
                          {order.dpAmount > 0 && <p className="text-[10px] font-bold text-emerald-600 mt-0.5 uppercase tracking-wider">DP: {formatRupiah(order.dpAmount)}</p>}
                        </td>
                        <td className="py-3.5 sm:py-4 px-5 sm:px-6">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                            order.statusPembayaran === 'LUNAS' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                            order.statusPembayaran === 'DP' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                          }`}>
                            <Banknote size={12} /> {order.statusPembayaran.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {/* =========================================
          CUSTOM DIALOG SYSTEM (Shared DialogModal)
      ========================================= */}
      <DialogModal dialog={dialog} onClose={closeDialog} />

    </div>
  );
}
