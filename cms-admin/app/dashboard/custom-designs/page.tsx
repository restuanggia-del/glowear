"use client";

import { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

export default function CustomDesignPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Review
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ statusDesain: "", catatanAdmin: "" });

  const fetchDesigns = async () => {
    try {
      const res = await fetch("http://localhost:3001/custom-design");
      const data = await res.json();
      setDesigns(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDesigns(); }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/custom-design/${selectedItem.id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });

      if (res.ok) {
        setSelectedItem(null);
        fetchDesigns();
        alert("Review berhasil disimpan!");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISETUJUI": return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1 w-max"><CheckCircle size={14}/> Disetujui</span>;
      case "DITOLAK": return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1 w-max"><XCircle size={14}/> Ditolak</span>;
      default: return <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700 flex items-center gap-1 w-max"><Clock size={14}/> Menunggu</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Review Desain Custom</h1>
          <p className="text-gray-500 text-sm mt-1">Review dan setujui desain sablon dari pelanggan.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
              <th className="py-3 px-6 font-semibold">ID Order</th>
              <th className="py-3 px-6 font-semibold">Detail Baju & Sablon</th>
              <th className="py-3 px-6 font-semibold">Status Desain</th>
              <th className="py-3 px-6 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={4} className="py-10 text-center">Memuat...</td></tr> : 
             designs.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="py-4 px-6 text-sm font-mono text-gray-600">ORD-{item.orderId.substring(0,6).toUpperCase()}</td>
                <td className="py-4 px-6">
                  <p className="font-medium text-gray-800">{item.product.namaProduk} (x{item.jumlah})</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Jenis Sablon: <span className="font-semibold text-blue-600">{item.jenisSablon}</span>
                  </p>
                </td>
                <td className="py-4 px-6">{getStatusBadge(item.statusDesain)}</td>
                <td className="py-4 px-6 text-center">
                  <button 
                    onClick={() => { setSelectedItem(item); setReviewForm({ statusDesain: item.statusDesain, catatanAdmin: item.catatanAdmin || "" }); }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <Eye size={16} /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL REVIEW DESAIN */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Bagian Kiri: Preview Gambar Klien */}
            <div className="w-full md:w-1/2 bg-slate-50 border-r border-gray-100 p-6 flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Desain Klien</h3>
              <div className="w-full aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={`http://localhost:3001/uploads/${selectedItem.gambarDesain}`} alt="Desain" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="mt-4 w-full bg-white p-3 rounded-lg border border-gray-200 text-sm">
                <p className="text-gray-500 text-xs mb-1">Catatan dari klien:</p>
                <p className="text-gray-800 italic">"{selectedItem.deskripsiDesain}"</p>
              </div>
            </div>

            {/* Bagian Kanan: Form Keputusan Admin */}
            <form onSubmit={handleReviewSubmit} className="w-full md:w-1/2 p-6 flex flex-col">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Keputusan Admin</h3>
              
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Persetujuan</label>
                  <div className="flex gap-3">
                    <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${reviewForm.statusDesain === 'DISETUJUI' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="status" value="DISETUJUI" className="hidden" onChange={(e) => setReviewForm({...reviewForm, statusDesain: e.target.value})} />
                      <div className="text-center font-medium text-green-700 text-sm">Terima Desain</div>
                    </label>
                    <label className={`flex-1 border rounded-lg p-3 cursor-pointer transition-all ${reviewForm.statusDesain === 'DITOLAK' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="status" value="DITOLAK" className="hidden" onChange={(e) => setReviewForm({...reviewForm, statusDesain: e.target.value})} />
                      <div className="text-center font-medium text-red-700 text-sm">Tolak / Revisi</div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Admin (Alasan tolak / instruksi tim produksi)</label>
                  <textarea 
                    value={reviewForm.catatanAdmin}
                    onChange={(e) => setReviewForm({...reviewForm, catatanAdmin: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    rows={4} 
                    placeholder="Contoh: Resolusi gambar terlalu pecah, mohon kirim ulang format PNG..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
                <button type="button" onClick={() => setSelectedItem(null)} className="w-1/3 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium">Batal</button>
                <button type="submit" className="w-2/3 bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700">Simpan Keputusan</button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}