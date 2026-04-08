"use client";

import { useState, useEffect } from "react";
import { Download, FileSpreadsheet, Calendar, TrendingUp, CheckCircle2, Banknote } from "lucide-react";
import * as XLSX from "xlsx"; // Import library Excel

export default function ReportsPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/orders/report?month=${selectedMonth}&year=${selectedYear}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Gagal mengambil laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  // Ambil data otomatis saat halaman dimuat atau bulan/tahun diubah
  useEffect(() => { fetchReport(); }, [selectedMonth, selectedYear]);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);
  };

  // Fungsi sakti untuk mengekspor data ke Excel
  const exportToExcel = () => {
    if (!data || data.orders.length === 0) return alert("Tidak ada data untuk diekspor");

    // 1. Siapkan format data yang rapi untuk Excel
    const excelData = data.orders.map((order: any, index: number) => ({
      "No": index + 1,
      "ID Pesanan": `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      "Tanggal": new Date(order.waktuDibuat).toLocaleDateString("id-ID"),
      "Nama Pelanggan": order.pengguna?.nama || "Unknown",
      "Status Pembayaran": order.statusPembayaran,
      "Status Produksi": order.status,
      "Total Tagihan (Rp)": order.totalHarga,
      "DP Masuk (Rp)": order.dpAmount || 0,
      "Sisa Pelunasan (Rp)": order.sisaPembayaran || 0,
    }));

    // 2. Buat Worksheet & Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");

    // 3. Atur lebar kolom Excel biar rapi
    worksheet["!cols"] = [
      { wch: 5 }, { wch: 15 }, { wch: 12 }, { wch: 25 }, 
      { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }
    ];

    // 4. Unduh file
    XLSX.writeFile(workbook, `Laporan_Glowear_Bulan_${selectedMonth}_Tahun_${selectedYear}.xlsx`);
  };

  return (
    <div className="font-sans space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan & Pembukuan</h1>
          <p className="text-sm text-gray-500 mt-1">Rekap pendapatan konveksi dan ekspor ke Excel.</p>
        </div>

        {/* Filter Bulan & Tahun */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center px-3 border-r border-gray-100">
            <Calendar size={18} className="text-gray-400 mr-2" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value={1}>Januari</option>
              <option value={2}>Februari</option>
              <option value={3}>Maret</option>
              <option value={4}>April</option>
              <option value={5}>Mei</option>
              <option value={6}>Juni</option>
              <option value={7}>Juli</option>
              <option value={8}>Agustus</option>
              <option value={9}>September</option>
              <option value={10}>Oktober</option>
              <option value={11}>November</option>
              <option value={12}>Desember</option>
            </select>
          </div>
          <div className="flex items-center px-3">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
            >
              {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Menghitung data pembukuan...</div>
      ) : data ? (
        <>
          {/* Baris Kartu Ringkasan (Argon Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Proyeksi Omzet</p>
                  <h3 className="text-lg font-bold text-gray-800 mt-1">{formatRupiah(data.summary.totalOmzet)}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Uang Masuk (DP)</p>
                  <h3 className="text-lg font-bold text-gray-800 mt-1">{formatRupiah(data.summary.totalDP)}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                  <Banknote size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Pesanan</p>
                  <h3 className="text-lg font-bold text-gray-800 mt-1">{data.summary.totalPesanan} Pesanan</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                  <FileSpreadsheet size={20} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Selesai Produksi</p>
                  <h3 className="text-lg font-bold text-gray-800 mt-1">{data.summary.pesananSelesai} Pesanan</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Area Preview & Tombol Export */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800">Preview Data Bulan Ini</h2>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-green-600/20 active:scale-95"
              >
                <Download size={18} /> Download Excel
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                    <th className="py-3 px-6 font-semibold">ID & Tanggal</th>
                    <th className="py-3 px-6 font-semibold">Pelanggan</th>
                    <th className="py-3 px-6 font-semibold">Total Tagihan</th>
                    <th className="py-3 px-6 font-semibold">Status Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500">Tidak ada pesanan di bulan ini.</td>
                    </tr>
                  ) : (
                    data.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-6">
                          <p className="font-mono text-sm font-semibold text-gray-800">ORD-{order.id.substring(0, 6).toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{new Date(order.waktuDibuat).toLocaleDateString('id-ID')}</p>
                        </td>
                        <td className="py-3 px-6 text-sm font-medium text-gray-700">{order.pengguna?.nama || "Unknown"}</td>
                        <td className="py-3 px-6">
                          <p className="text-sm font-bold text-blue-600">{formatRupiah(order.totalHarga)}</p>
                          {order.dpAmount > 0 && <p className="text-xs text-green-600">DP: {formatRupiah(order.dpAmount)}</p>}
                        </td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.statusPembayaran === 'LUNAS' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {order.statusPembayaran}
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
    </div>
  );
}