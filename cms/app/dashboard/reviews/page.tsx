"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/services/api";
import { Star, MessageSquare, Package, Calendar, Image as ImageIcon, Trash2, X, Eye, Loader2 } from "lucide-react";
import DialogModal, { DialogState, DEFAULT_DIALOG } from "@/app/components/ui/DialogModal";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(DEFAULT_DIALOG);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get("/reviews");
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil ulasan", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = (id: string) => {
    setDialog({
      isOpen: true,
      type: "confirm",
      title: "Hapus Ulasan?",
      message: "Ulasan yang dihapus tidak dapat dikembalikan!",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        setDialog(DEFAULT_DIALOG);
        try {
          await api.delete(`/reviews/${id}`);
          setReviews(prev => prev.filter(r => r.id !== id));
          setDialog({
            isOpen: true,
            type: "success",
            title: "Terhapus!",
            message: "Ulasan berhasil dihapus dari sistem."
          });
        } catch (error) {
          setDialog({
            isOpen: true,
            type: "error",
            title: "Gagal",
            message: "Terjadi kesalahan saat menghapus ulasan."
          });
        }
      }
    });
  };

  const getPhotoArray = (fotoString: string) => {
    if (!fotoString) return [];
    try {
      const parsed = JSON.parse(fotoString);
      return Array.isArray(parsed) ? parsed : [fotoString];
    } catch (e) {
      return [fotoString];
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Manajemen Ulasan</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Lihat dan kelola feedback dari pelanggan Anda.</p>
        </div>
        <div className="bg-blue-50 px-3.5 py-2 rounded-xl flex items-center gap-2 border border-blue-100 self-stretch sm:self-auto justify-center">
          <Star className="text-amber-500 fill-amber-500" size={16} />
          <span className="text-xs sm:text-sm font-bold text-blue-700">{reviews.length} Ulasan Masuk</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 size={36} className="text-blue-600 animate-spin mb-3" />
          <p className="text-slate-500 font-medium text-sm">Memuat data ulasan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {reviews.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <MessageSquare size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-bold text-sm">Belum ada ulasan masuk.</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all">
                {/* Header: User & Rating */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                        {rev.pengguna?.nama?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{rev.pengguna?.nama || "Pelanggan"}</h3>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={11} className={s <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(rev.id)}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0 ml-2"
                      title="Hapus Ulasan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                      <Package size={13} className="text-blue-500 shrink-0" />
                      <span className="truncate">{rev.product?.namaProduk || "Produk kustom"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar size={13} className="shrink-0" />
                      <span>{new Date(rev.waktuDibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Body: Commentary */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium italic">
                    &quot;{rev.komentar || "Tidak ada komentar tertulis."}&quot;
                  </p>

                  {/* Photos */}
                  {rev.foto && (
                    <div className="mt-4 flex flex-wrap gap-2 pt-2">
                      {getPhotoArray(rev.foto).map((f: string, i: number) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedImage(`http://localhost:3001/uploads/${f}`)}
                          className="relative cursor-pointer group/img overflow-hidden rounded-xl border border-slate-200"
                        >
                          <img 
                            src={`http://localhost:3001/uploads/${f}`} 
                            alt="Ulasan" 
                            className="w-14 h-14 sm:w-16 sm:h-16 object-cover hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye size={14} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Glowear Review</span>
                  <div className="flex items-center gap-1 text-blue-600">
                     <ImageIcon size={12} />
                     <span>{getPhotoArray(rev.foto).length} Foto</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Preview Gambar */}
      {selectedImage && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" 
            onClick={() => setSelectedImage(null)}
          />
          <button 
            onClick={() => setSelectedImage(null)}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 sm:p-3 rounded-full transition-all z-[260] shadow-lg backdrop-blur-md border border-white/10"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div className="relative max-w-3xl max-h-[85vh] z-[255]">
            <img 
              src={selectedImage} 
              alt="Preview Ulasan" 
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}

      {/* Shared DialogModal */}
      <DialogModal dialog={dialog} onClose={() => setDialog(DEFAULT_DIALOG)} />
    </div>
  );
}
