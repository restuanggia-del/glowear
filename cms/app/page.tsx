import React from "react";
import { 
  ArrowRight, 
  Smartphone, 
  Palette, 
  ShieldCheck, 
  Zap, 
  Star, 
  TrendingUp,
  Layers,
  CheckCircle2,
  PlayCircle,
  BarChart3,
  Package
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090B] font-sans selection:bg-indigo-500/30 selection:text-indigo-200 text-slate-300 overflow-hidden relative">
      
      {/* SaaS Grid Background & Radial Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20"></div>
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* Navbar Floating Pill (Finorio Style) */}
      <div className="fixed top-6 w-full flex justify-center z-50 px-4">
        <nav className="w-full max-w-4xl px-4 py-3 flex justify-between items-center bg-[#09090B]/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all">
          <div className="flex items-center gap-2 pl-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              <Layers size={14} className="text-white" />
            </div>
            <div className="text-xl font-bold text-white tracking-wide">
              GLOWEAR<span className="text-indigo-500">.</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#fitur" className="text-zinc-400 hover:text-white transition-colors">Fitur</a>
            <a href="#cara-kerja" className="text-zinc-400 hover:text-white transition-colors">Cara Kerja</a>
            <a href="#katalog" className="text-zinc-400 hover:text-white transition-colors">Katalog</a>
          </div>

          <div className="flex items-center gap-3">
            <a href="/dashboard" className="hidden md:block text-sm font-medium text-zinc-400 hover:text-white transition-colors px-2">
              Masuk Admin
            </a>
            <button className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-full text-sm font-semibold transition-all">
              Mulai Pesan
            </button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center pt-48 pb-20 px-4 text-center">
        
        {/* Badge Label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Revolusi Sistem Konveksi SOA
        </div>

        {/* Headline Utama */}
        <h1 className="max-w-5xl text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
          Wujudkan Kaos Custom Impian, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500">
            Kualitas Premium Tanpa Ribet.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl text-lg text-zinc-400 mb-10 leading-relaxed">
          Satu-satunya platform konveksi yang memberikan kebebasan desain seutuhnya, pantauan produksi <span className="text-indigo-400">real-time</span>, dan hasil sablon akurasi tinggi untuk brand Anda.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mb-20">
          <button className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            Mulai Pesan Sekarang
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-full font-medium transition-all">
            <PlayCircle size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
            Lihat Demo Singkat
          </button>
        </div>

        {/* Dashboard Mockup (SaaS Vibe) */}
        <div className="w-full max-w-5xl mx-auto p-2 bg-zinc-900/50 rounded-2xl border border-white/10 backdrop-blur-sm shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent z-10 rounded-2xl pointer-events-none"></div>
          <div className="bg-zinc-950 rounded-xl border border-white/5 overflow-hidden">
            {/* Window Controls */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-zinc-900/50">
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
            </div>
            {/* Fake Dashboard Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70">
              <div className="h-40 rounded-lg border border-white/5 bg-zinc-900/30 flex flex-col justify-center items-center gap-3">
                <BarChart3 size={32} className="text-indigo-500/50" />
                <div className="h-2 w-20 bg-zinc-800 rounded-full"></div>
              </div>
              <div className="h-40 rounded-lg border border-white/5 bg-zinc-900/30 flex flex-col justify-center items-center gap-3">
                <Package size={32} className="text-purple-500/50" />
                <div className="h-2 w-24 bg-zinc-800 rounded-full"></div>
              </div>
              <div className="h-40 rounded-lg border border-white/5 bg-zinc-900/30 flex flex-col justify-center items-center gap-3">
                <TrendingUp size={32} className="text-emerald-500/50" />
                <div className="h-2 w-16 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof / Stats Ticker */}
        <div className="mt-20 border-y border-white/5 w-full bg-zinc-900/20 py-8 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24">
          <div className="flex flex-col items-center gap-1">
            <h4 className="text-3xl font-bold text-white">500+</h4>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Komunitas & Brand</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h4 className="text-3xl font-bold text-white">100k+</h4>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Pcs Terproduksi</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex text-indigo-400 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">4.9/5 Rating Kepuasan</p>
          </div>
        </div>
      </main>

      {/* Features Section - Bento Grid */}
      <section id="fitur" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-3">Keunggulan Sistem</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Kenapa Memilih GLOWEAR?</h2>
            <p className="text-zinc-400 max-w-xl">Kami mengubah cara tradisional pemesanan konveksi menjadi pengalaman digital yang cepat, transparan, dan terpercaya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 - Large spanning card */}
            <div className="md:col-span-2 group bg-zinc-900/40 border border-white/5 hover:border-indigo-500/30 p-8 rounded-3xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Palette size={120} />
              </div>
              <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 text-indigo-400 flex items-center justify-center mb-6 relative z-10">
                <Palette size={24} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Custom Desain Bebas</h3>
              <p className="text-zinc-400 leading-relaxed max-w-md relative z-10">
                Upload gambar sesukamu, pilih material kain, jenis sablon (Plastisol, DTF, Rubber), hingga sesuaikan letak desain langsung dari aplikasi dengan visualisasi akurat.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="group bg-zinc-900/40 border border-white/5 hover:border-purple-500/30 p-8 rounded-3xl transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 text-purple-400 flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pantau Real-Time</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Lacak status pesanan Anda dari potong kain, sablon, jahit, hingga pengiriman. Tidak perlu lagi bolak-balik chat admin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 p-8 rounded-3xl transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Transaksi Aman</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">
                Sistem pembayaran transparan. Gunakan metode DP terintegrasi di invoice digital. Garansi produksi tepat waktu.
              </p>
            </div>

            {/* Feature 4 - Bottom spanning */}
            <div className="md:col-span-2 group bg-gradient-to-r from-indigo-900/20 to-zinc-900/40 border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Terintegrasi dalam satu platform</h3>
                <p className="text-zinc-400 text-sm">Dibangun dengan arsitektur modern untuk menjamin kecepatan dan keandalan pesanan partai besar.</p>
              </div>
              <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white text-sm font-medium whitespace-nowrap transition-colors">
                Pelajari Teknisnya
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto relative rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-900/50 p-12 md:p-20 text-center">
          {/* Internal Glow for Box */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 z-0"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Siap Naikkan Level <br/> Merchandise Anda?</h2>
            <p className="text-zinc-400 mb-10 max-w-xl mx-auto">Mulai rancang desain pertamamu. Dapatkan penawaran harga instan tanpa harus menunggu balasan admin.</p>
            <button className="flex items-center mx-auto justify-center gap-2 px-8 py-4 bg-white text-zinc-950 rounded-full font-bold hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Buat Pesanan Baru
              <ArrowRight size={18} />
            </button>
            
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                <CheckCircle2 size={18} className="text-indigo-400" /> Tanpa Minimum Order Detail
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                <CheckCircle2 size={18} className="text-indigo-400" /> Garansi Uang Kembali
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-white/5 py-12 text-center mt-10">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <Layers size={18} className="text-white" />
          <div className="text-xl font-bold text-white tracking-widest">
            GLOWEAR<span className="text-indigo-500">.</span>
          </div>
        </div>
        <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} Glowear Custom Apparel. Hak Cipta Dilindungi.</p>
      </footer>

    </div>
  );
}