"use client";

import { useState, useEffect } from "react";
import { Download, FileSpreadsheet, Calendar, TrendingUp, CheckCircle2, Banknote, Loader2, AlertCircle, X, Info, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // STATE CUSTOM DIALOG (Pengganti Alert)
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
    <div className="font-sans space-y-6 pb-10 relative">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Laporan & Pembukuan</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Rekapitulasi pendapatan konveksi dan ekspor data ke Excel.</p>
        </div>

        {/* Filter Bulan & Tahun (Styling Premium) */}
        <div className="flex items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-inner w-full md:w-auto">
          <div className="flex items-center px-3 border-r border-slate-200 relative group w-1/2 md:w-auto">
            <Calendar size={16} className="text-slate-400 mr-2 shrink-0" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none w-full pr-6"
            >
              {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                <option key={i+1} value={i+1}>{m}</option>
              ))}
            </select>
            <ChevronDown size={14} className="text-slate-400 absolute right-3 pointer-events-none group-hover:text-blue-500" />
          </div>
          <div className="flex items-center px-3 relative group w-1/2 md:w-auto">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none w-full pr-6"
            >
              {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown size={14} className="text-slate-400 absolute right-3 pointer-events-none group-hover:text-blue-500" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Menghitung kalkulasi pembukuan...</p>
        </div>
      ) : data ? (
        <>
          {/* Baris Kartu Ringkasan */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proyeksi Omzet</p>
                  <h3 className="text-xl font-black text-slate-800">{formatRupiah(data.summary?.totalOmzet || 0)}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uang Masuk (DP)</p>
                  <h3 className="text-xl font-black text-slate-800">{formatRupiah(data.summary?.totalDP || 0)}</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100">
                  <Banknote size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pesanan</p>
                  <h3 className="text-xl font-black text-slate-800">{data.summary?.totalPesanan || 0} Trx</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                  <FileSpreadsheet size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selesai Produksi</p>
                  <h3 className="text-xl font-black text-slate-800">{data.summary?.pesananSelesai || 0} Selesai</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm border border-orange-100">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </div>

          </div>

          {/* Area Tabel Preview & Tombol Export */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <h2 className="text-base font-black text-slate-800">Pratinjau Data Bulan Ini</h2>
              <button 
                onClick={exportToExcel}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 border border-emerald-500"
              >
                <Download size={16} /> Unduh Excel
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
                    <th className="py-4 px-6 font-bold">ID & Tanggal</th>
                    <th className="py-4 px-6 font-bold">Pelanggan</th>
                    <th className="py-4 px-6 font-bold">Total Tagihan</th>
                    <th className="py-4 px-6 font-bold">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {!data.orders || data.orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <FileSpreadsheet size={40} className="text-slate-300 mb-3" />
                          <p className="font-medium">Tidak ada transaksi tercatat di bulan ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block mb-1 border border-slate-200">
                            ORD-{order.id.substring(0, 6).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">{new Date(order.waktuDibuat).toLocaleDateString('id-ID')}</p>
                        </td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-700">
                          {order.pengguna?.nama || "Pelanggan Anonim"}
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-black text-blue-600">{formatRupiah(order.totalHarga)}</p>
                          {order.dpAmount > 0 && <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">DP: {formatRupiah(order.dpAmount)}</p>}
                        </td>
                        <td className="py-4 px-6">
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
          CUSTOM DIALOG SYSTEM (Pengganti Alert)
      ========================================= */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => dialog.type !== 'confirm' && closeDialog()}></div>
            
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center animate-in zoom-in-95 duration-200 sm:my-8 border border-slate-100">
              
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