"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingBag, ArrowRight, Tag, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KatalogPelangganPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fungsi untuk mengambil data produk dari backend (Master Data yang diisi Admin)
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3001/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        throw new Error("Gagal mengambil data");
      }
    } catch (error) {
      // Data dummy sebagai Fallback jika backend produk kosong / belum siap
      setProducts([
        { id: "1", namaProduk: "Kaos Basic Cotton Combed 30s", harga: 45000, stok: 150, kategori: { namaKategori: "Kaos Polos" }, gambar: null },
        { id: "2", namaProduk: "Hoodie Jumper Premium Fleece", harga: 120000, stok: 50, kategori: { namaKategori: "Hoodie" }, gambar: null },
        { id: "3", namaProduk: "Polo Shirt Pique Cotton", harga: 75000, stok: 80, kategori: { namaKategori: "Polo" }, gambar: null },
        { id: "4", namaProduk: "Kaos Oversize Heavy Cotton 24s", harga: 65000, stok: 120, kategori: { namaKategori: "Kaos Polos" }, gambar: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka || 0);
  };

  const filteredProducts = products.filter(p => 
    p.namaProduk?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simulasi pelanggan memilih baju
  const handlePilihBaju = (product: any) => {
    // Menyimpan produk yang dipilih sementara di localStorage untuk digunakan di halaman Pesan
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    // Arahkan ke halaman Form Pesanan Custom
    router.push("/dashboard/pelanggan/pesan");
  };

  return (
    <div className="font-sans space-y-8 pb-10">
      
      {/* Banner Khusus Area Pelanggan */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm mb-3 inline-block">
            Step 1: Pilih Bahan
          </span>
          <h1 className="text-3xl font-bold mb-2">Katalog Baju Polos</h1>
          <p className="text-emerald-50 opacity-90 max-w-xl text-sm leading-relaxed">
            Pilih jenis pakaian yang ingin Anda custom sablon. Kami menyediakan berbagai macam bahan berkualitas tinggi mulai dari cotton combed standar distro hingga hoodie premium.
          </p>
        </div>
        <div className="hidden md:flex items-center justify-center h-24 w-24 bg-white/10 rounded-full backdrop-blur-sm shrink-0 relative z-10">
          <ShoppingBag size={40} className="text-white opacity-80" />
        </div>
        
        {/* Dekorasi Background */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-teal-900/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Pencarian & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari kaos, hoodie, dll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-700 shadow-sm transition-shadow"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold whitespace-nowrap">Semua</button>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 whitespace-nowrap">Kaos Polos</button>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 whitespace-nowrap">Hoodie</button>
        </div>
      </div>

      {/* Grid Produk */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              
              {/* Gambar Produk */}
              <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center p-6">
                {product.gambar ? (
                  <img 
                    src={`http://localhost:3001/uploads/products/${product.gambar}`} 
                    alt={product.namaProduk} 
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  // Placeholder jika admin belum upload gambar produk
                  <div className="w-full h-full bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                    <ShoppingBag size={48} className="mb-2 opacity-50" />
                    <span className="text-xs font-medium">Gambar Produk</span>
                  </div>
                )}
                
                {/* Badge Kategori */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                  <Tag size={12} className="text-emerald-600" />
                  <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{product.kategori?.namaKategori || "Umum"}</span>
                </div>
              </div>

              {/* Info Produk */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1 mb-2">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-400 ml-1">(4.9)</span>
                </div>
                
                <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2">
                  {product.namaProduk}
                </h3>
                
                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Mulai dari</p>
                    <p className="text-lg font-black text-emerald-600">{formatRupiah(product.harga)}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-400">
                    Stok: {product.stok}
                  </span>
                </div>

                {/* Tombol Aksi */}
                <button 
                  onClick={() => handlePilihBaju(product)}
                  className="mt-5 w-full bg-slate-900 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  Pilih Baju Ini <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="bg-white p-16 rounded-2xl border border-dashed border-gray-200 text-center">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Baju yang Anda cari tidak ditemukan.</p>
        </div>
      )}
    </div>
  );
}