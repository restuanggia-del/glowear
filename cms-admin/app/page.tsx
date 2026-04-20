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
  CheckCircle2
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050A15] font-sans selection:bg-indigo-500/30 selection:text-indigo-200 text-slate-300 overflow-hidden">
      
      {/* Background Glow Effects (Branding GLOWEAR) */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-l from-purple-600 to-pink-600 opacity-10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

      {/* Navbar Premium Glassmorphism */}
      <nav className="fixed top-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-[#050A15]/70 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Layers size={18} className="text-white" />
          </div>
          <div className="text-2xl font-black text-white tracking-widest">
        GLOWEAR<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">.</span>
      </div>
    </div>
    
    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
      <a href="#fitur" className="text-slate-400 hover:text-white transition-colors">Fitur</a>
      <a href="#cara-kerja" className="text-slate-400 hover:text-white transition-colors">Cara Kerja</a>
      <a href="#katalog" className="text-slate-400 hover:text-white transition-colors">Katalog</a>
    </div>

    <div className="flex items-center gap-4">
      <a 
        href="/dashboard" 
        className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors"
      >
        Masuk Admin
      </a>
      <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white text-sm font-semibold transition-all">
        Login / Daftar
      </button>
    </div>
  </nav>

  {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center pt-40 pb-20 px-4 text-center">
        
        {/* Badge Label */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in-up">
          <Zap size={14} className="text-indigo-400" />
          Revolusi Sistem Konveksi
        </div>

        {/* Headline Utama */}
        <h1 className="max-w-5xl text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-8">
          Wujudkan Kaos Custom Impian, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">
            Kualitas Premium Tanpa Ribet.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
          Satu-satunya platform konveksi yang memberikan kebebasan desain seutuhnya, pantauan produksi *real-time*, dan hasil sablon akurasi tinggi untuk brand & komunitas Anda.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full justify-center">
          <button className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full font-bold transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] hover:-translate-y-1">
            Mulai Pesan Sekarang
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#0F172A] hover:bg-[#1E293B] text-white border border-slate-700 rounded-full font-semibold transition-all">
            <Smartphone size={20} className="text-indigo-400 group-hover:animate-bounce" />
            Download App (Segera)
          </button>
        </div>

        {/* Social Proof / Stats */}
        <div className="mt-20 pt-10 border-t border-white/5 w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
          <div className="flex flex-col items-center gap-2">
            <h4 className="text-3xl font-bold text-white">500+</h4>
            <p className="text-sm text-slate-500">Komunitas & Brand</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h4 className="text-3xl font-bold text-white">100k+</h4>
            <p className="text-sm text-slate-500">Pcs Terproduksi</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex text-amber-400 mb-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="text-sm text-slate-500">4.9/5 Rating Kepuasan</p>
          </div>
        </div>
      </main>

      {/* Value Proposition / Features Section */}
      <section id="fitur" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Kenapa Memilih GLOWEAR?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Kami mengubah cara tradisional pemesanan konveksi menjadi pengalaman digital yang cepat, transparan, dan terpercaya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/30 p-8 rounded-3xl transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Custom Desain Bebas</h3>
              <p className="text-slate-400 leading-relaxed">Upload gambar sesukamu, pilih material kain, jenis sablon (Plastisol, DTF, Rubber), hingga sesuaikan letak desain langsung dari aplikasi.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-purple-500/30 p-8 rounded-3xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={100} />
              </div>
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">Pantau Real-Time</h3>
              <p className="text-slate-400 leading-relaxed relative z-10">Ucapkan selamat tinggal pada "Udah sampai mana min?". Lacak status pesanan Anda dari potong kain, sablon, jahit, hingga pengiriman.</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-green-500/30 p-8 rounded-3xl transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Transaksi Super Aman</h3>
              <p className="text-slate-400 leading-relaxed">Sistem pembayaran transparan. Gunakan metode DP terintegrasi di invoice digital. Dana aman dengan garansi produksi tepat waktu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 to-[#0A1020] p-10 md:p-16 text-center">
          {/* Internal Glow for Box */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm z-0"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Siap Naikkan Level Merchandise Anda?</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">Mulai rancang desain pertamamu. Dapatkan penawaran harga instan tanpa harus menunggu balasan admin.</p>
            <button className="flex items-center mx-auto justify-center gap-2 px-10 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-200 hover:scale-105 transition-all">
              Buat Pesanan Baru Sekarang
              <ArrowRight size={20} />
            </button>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 size={16} className="text-green-400" /> Tanpa Minimum Order Detail
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 size={16} className="text-green-400" /> Garansi Uang Kembali
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-white/5 py-10 text-center">
        <div className="text-2xl font-black text-white tracking-widest mb-4 opacity-50">
          GLOWEAR<span className="text-indigo-500">.</span>
        </div>
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Glowear Custom Apparel. Hak Cipta Dilindungi.</p>
      </footer>

    </div>
  );
}