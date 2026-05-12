"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/services/api";
import { Star, MessageSquare, User, Package, Calendar, Image as ImageIcon, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get("/reviews");
      setReviews(data);
    } catch (error) {
      console.error("Gagal mengambil ulasan", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Ulasan?",
      text: "Ulasan yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/reviews/${id}`);
        setReviews(reviews.filter(r => r.id !== id));
        Swal.fire("Terhapus!", "Ulasan berhasil dihapus.", "success");
      } catch (error) {
        Swal.fire("Gagal", "Terjadi kesalahan saat menghapus ulasan.", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Manajemen Ulasan</h1>
          <p className="text-sm text-slate-500 font-medium">Lihat dan kelola feedback dari pelanggan Anda.</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-3">
          <Star className="text-blue-600 fill-blue-600" size={20} />
          <span className="text-sm font-bold text-blue-700">{reviews.length} Ulasan Masuk</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">Belum ada ulasan masuk.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
              {/* Header: User & Rating */}
              <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">
                      {rev.pengguna?.nama?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{rev.pengguna?.nama || "Pelanggan"}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className={s <= rev.rating ? "text-orange-400 fill-orange-400" : "text-slate-200"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(rev.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Package size={14} className="text-blue-500" />
                    <span className="line-clamp-1">{rev.product?.namaProduk || "Produk dihapus"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={14} />
                    <span>{new Date(rev.waktuDibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Body: Commentary */}
              <div className="p-6 flex-1">
                <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                  &quot;{rev.komentar || "Tidak ada komentar."}&quot;
                </p>

                {/* Photos */}
                {rev.foto && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(() => {
                      try {
                        const photos = JSON.parse(rev.foto);
                        if (Array.isArray(photos)) {
                          return photos.map((f, i) => (
                            <div key={i} className="relative group/img">
                              <img 
                                src={`http://localhost:3001/uploads/${f}`} 
                                alt="Ulasan" 
                                className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm"
                              />
                            </div>
                          ));
                        }
                      } catch (e) {
                        return (
                          <img 
                            src={`http://localhost:3001/uploads/${rev.foto}`} 
                            alt="Ulasan" 
                            className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm"
                          />
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Glowear Review</span>
                <div className="flex items-center gap-1 text-blue-500">
                   <ImageIcon size={14} />
                   <span className="text-[10px] font-bold uppercase tracking-tight">
                    {rev.foto ? (Array.isArray(JSON.parse(rev.foto)) ? JSON.parse(rev.foto).length : 1) : 0} Foto
                   </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
