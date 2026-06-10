"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/auth-context";
import { useRouter } from "next/navigation";
import { Upload, Palette, Ruler, Info, ShoppingCart, ArrowLeft } from "lucide-react";

export default function StudioCustomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    jumlah: 12, // Minimal order biasanya 12 untuk konveksi
    jenisSablon: "PLASTISOL",
    catatan: "",
    alamat: ""
  });

  useEffect(() => {
    const savedProduct = localStorage.getItem("selectedProduct");
    if (savedProduct) {
      setSelectedProduct(JSON.parse(savedProduct));
    } else {
      router.push("/dashboard/pelanggan/katalog");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Silakan unggah desain sablon Anda!");

    const totalHarga = selectedProduct.harga * form.jumlah;
    const formData = new FormData();
    formData.append("fileDesain", file);
    formData.append("userId", user?.id || "");
    formData.append("totalHarga", totalHarga.toString());
    formData.append("alamatPengiriman", form.alamat);
    formData.append("catatanCustom", form.catatan);
    
    // Kirim data item sebagai string JSON atau sesuaikan dengan struktur backend Anda
    const items = [{
      productId: selectedProduct.id,
      jumlah: Number(form.jumlah),
      hargaSatuan: selectedProduct.harga,
      jenisSablon: form.jenisSablon
    }];
    formData.append("items", JSON.stringify(items));

    try {
      const res = await fetch("http://localhost:3001/orders", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Pesanan berhasil dibuat! Silakan cek menu Tagihan.");
        router.push("/dashboard/pelanggan/tagihan");
      } else {
        // 👇 TAMBAHKAN INI UNTUK MELIHAT ERROR DARI BACKEND
        const errorData = await res.json();
        console.error("Detail Error:", errorData);
        alert(`Gagal menyimpan pesanan: ${errorData.message || 'Cek console browser'}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Gagal terhubung ke server backend.");
    }
  };

  if (!selectedProduct) return null;

  return (
    <div className="font-sans max-w-5xl mx-auto pb-20">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={20} /> Kembali ke Katalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Sisi Kiri: Upload & Preview */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Palette size={20} className="text-blue-600" /> Upload Desain Sablon
            </h2>
            
            <div className="relative aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden group">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
              ) : (
                <div className="text-center p-10">
                  <Upload size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-sm text-gray-500 font-medium">Klik atau tarik gambar desain ke sini</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG (Disarankan background transparan)</p>
                </div>
              )}
              <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4">
            <Info className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Tips:</strong> Pastikan resolusi gambar tinggi agar hasil sablon tidak pecah. Tim kami akan melakukan pengecekan ulang desain sebelum produksi dimulai.
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Detail Pesanan */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Detail Pesanan Custom</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-4 border border-gray-100">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2">
                <img src={`http://localhost:3001/uploads/${selectedProduct.gambar}`} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Bahan Pilihan:</p>
                <p className="text-sm font-bold text-gray-800">{selectedProduct.namaProduk}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Jumlah (Pcs)</label>
                <input 
                  type="number" 
                  min="12" 
                  value={form.jumlah} 
                  onChange={(e) => setForm({...form, jumlah: Number(e.target.value)})}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Jenis Sablon</label>
                <select 
                  value={form.jenisSablon} 
                  onChange={(e) => setForm({...form, jenisSablon: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option value="PLASTISOL">Plastisol</option>
                  <option value="DTF">DTF (Digital)</option>
                  <option value="RUBBER">Rubber</option>
                  <option value="BORDIR">Bordir Komputer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Alamat Pengiriman</label>
              <textarea 
                required
                value={form.alamat} 
                onChange={(e) => setForm({...form, alamat: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 h-20 resize-none"
                placeholder="Alamat lengkap tujuan kirim..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Catatan Tambahan (Opsi)</label>
              <textarea 
                value={form.catatan} 
                onChange={(e) => setForm({...form, catatan: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 h-20 resize-none"
                placeholder="Misal: Posisi sablon di punggung ukuran A3..."
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-medium">Estimasi Biaya:</span>
                <span className="text-2xl font-black text-blue-600">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(selectedProduct.harga * form.jumlah)}
                </span>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <ShoppingCart size={20} /> Kirim Pesanan Sekarang
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}