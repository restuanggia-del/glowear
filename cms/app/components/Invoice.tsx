import React from "react";
import { Printer, Scissors } from "lucide-react";

interface InvoiceProps {
  order: any;
  onClose?: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ order, onClose }) => {
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:backdrop-none print:relative print:z-auto">
      {/* Container Struk */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:max-w-none print:rounded-none">
        
        {/* Kontrol (Hanya muncul di layar, tidak saat di-print) */}
        <div className="p-4 bg-slate-100 border-b flex justify-between items-center print:hidden">
          <h3 className="font-bold text-slate-700">Preview Struk Pesanan</h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              <Printer size={18} /> Cetak Sekarang
            </button>
            <button 
              onClick={onClose}
              className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-50 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>

        {/* Isi Struk (Halaman Cetak) */}
        <div id="printable-invoice" className="p-10 text-slate-800 bg-white min-h-[600px] font-sans">
          
          {/* Header Struk */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900">GLOWEAR</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Konveksi & Sablon Custom</p>
              <div className="mt-4 text-sm text-slate-600 space-y-0.5">
                <p>Jl. Raya Utama No. 123, Indonesia</p>
                <p>WhatsApp: 0812-3456-7890</p>
                <p>Email: admin@glowear.com</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-slate-900 text-white px-4 py-2 rounded-lg inline-block">
                <h2 className="text-xl font-bold uppercase tracking-tight">INVOICE</h2>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-bold text-slate-900">No. Order: <span className="font-mono">ORD-{order.id.substring(0, 8).toUpperCase()}</span></p>
                <p className="text-xs text-slate-500">Tanggal: {formatDate(order.waktuDibuat)}</p>
              </div>
            </div>
          </div>

          {/* Informasi Pelanggan & Pengiriman */}
          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Ditujukan Kepada:</h3>
              <p className="font-bold text-slate-900 text-base">{order.pengguna?.nama || "Pelanggan Glowear"}</p>
              <p className="text-sm text-slate-600 mt-1">{order.pengguna?.email}</p>
              <p className="text-sm text-slate-600">{order.pengguna?.noTelp}</p>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-1">Alamat Pengiriman:</h3>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {order.alamatPengiriman || "Alamat tidak dicantumkan."}
              </p>
            </div>
          </div>

          {/* Tabel Barang */}
          <div className="mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y-2 border-slate-900">
                  <th className="py-3 px-4 font-black text-[11px] uppercase tracking-wider text-slate-900">Deskripsi Produk / Pesanan</th>
                  <th className="py-3 px-4 font-black text-[11px] uppercase tracking-wider text-slate-900 text-center">Jumlah</th>
                  <th className="py-3 px-4 font-black text-[11px] uppercase tracking-wider text-slate-900 text-right">Harga Satuan</th>
                  <th className="py-3 px-4 font-black text-[11px] uppercase tracking-wider text-slate-900 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{item.product?.namaProduk || "Item Custom"}</p>
                      {item.jenisSablon && <p className="text-xs text-slate-500 mt-0.5">Sablon: {item.jenisSablon}</p>}
                      {item.deskripsiDesain && <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">"{item.deskripsiDesain}"</p>}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-900">{item.jumlah} Pcs</td>
                    <td className="py-4 px-4 text-right text-slate-700">{formatRupiah(item.hargaSatuan)}</td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">{formatRupiah(item.jumlah * item.hargaSatuan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bagian Bawah: Catatan & Total Biaya */}
          <div className="flex justify-between items-start pt-6 border-t-2 border-slate-100">
            <div className="max-w-[300px]">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Scissors size={12}/> Catatan Produksi:</h4>
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                {order.catatanCustom ? `"${order.catatanCustom}"` : "Tidak ada catatan khusus dari pelanggan."}
              </p>
              <div className="mt-10 pt-10 border-t border-dashed border-slate-300">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-8 text-center">Tanda Terima Pelanggan</p>
                <div className="h-px w-40 bg-slate-300 mx-auto"></div>
              </div>
            </div>
            
            <div className="w-[300px] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-500">Subtotal:</span>
                <span className="font-bold text-slate-900">{formatRupiah(order.totalHarga)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-500">Uang Muka (DP):</span>
                <span className="font-bold text-blue-600">-{formatRupiah(order.dpAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-xl shadow-lg mt-2">
                <span className="font-bold uppercase tracking-widest text-[10px]">Sisa Pelunasan:</span>
                <span className="text-xl font-black">{formatRupiah(order.sisaPembayaran)}</span>
              </div>
              <div className="pt-4 text-center">
                 <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                   Status: {order.statusPembayaran === 'LUNAS' ? 'LUNAS SEPENUHNYA' : 'MENUNGGU PELUNASAN'}
                 </p>
              </div>
            </div>
          </div>

          {/* Footer Struk */}
          <div className="mt-16 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs font-bold text-slate-400">Terima kasih telah mempercayakan produksi Anda pada Glowear.</p>
            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-black">Dicetak Secara Otomatis oleh Sistem ERP Glowear</p>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @media print {
          /* Sembunyikan semua elemen di body */
          body * {
            display: none !important;
          }
          /* Tampilkan hanya area invoice */
          #printable-invoice, #printable-invoice * {
            display: block !important;
          }
          /* Pastikan teks dan layout muncul */
          #printable-invoice {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
          }
          /* Perbaikan untuk tabel agar tidak terpotong */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            display: table-cell !important;
          }
          .flex {
            display: flex !important;
          }
          .justify-between {
            justify-content: space-between !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
