import Link from "next/link";
import { ArrowRight, Smartphone, Palette, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Navbar Sederhana */}
      <nav className="absolute top-0 w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="text-2xl font-bold text-slate-900 tracking-wider">
          GLOWEAR<span className="text-blue-600">.</span>
        </div>
        <Link 
          href="/dashboard" 
          className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
        >
          Masuk Admin
        </Link>
      </nav>

      {/* Hero Section (Pendekatan Mobile-First) */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-16 text-center overflow-hidden">
        
        {/* Efek Latar Belakang */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        {/* Badge Label */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-8">
          <Zap size={14} className="fill-blue-600" />
          Sistem Konveksi Modern
        </div>

        {/* Headline Utama */}
        <h1 className="max-w-4xl text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-6">
          Bikin Kaos Custom Impianmu, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Tanpa Ribet.
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed">
          Platform pemesanan konveksi terlengkap. Desain sesukamu, pantau progres produksi secara real-time, dan nikmati kualitas sablon premium untuk komunitas atau brand Anda.
        </p>

        {/* Tombol Call to Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5">
            Mulai Pesan Custom
            <ArrowRight size={20} />
          </button>
          
          <button className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-semibold transition-all">
            <Smartphone size={20} className="text-slate-500" />
            Download App (Segera)
          </button>
        </div>

        {/* Fitur Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Palette size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Custom Desain Bebas</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Upload gambar, pilih jenis sablon (Plastisol, DTF, dll), dan sesuaikan ukuran langsung dari aplikasi.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Pantau Real-time</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Tidak perlu lagi menebak-nebak. Pantau status pesanan mulai dari antrean hingga masuk ke proses penjahitan.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
            <div className="h-12 w-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-slate-900">Pembayaran Aman</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Sistem pembayaran transparan dengan metode DP (Uang Muka) terintegrasi langsung di dalam invoice digital Anda.</p>
          </div>
        </div>
      </main>
    </div>
  );
}