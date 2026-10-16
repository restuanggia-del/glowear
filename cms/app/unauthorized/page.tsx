"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-8 max-w-md w-full text-center backdrop-blur-sm shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          Akses Ditolak
        </h1>
        <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
          Akun Anda tidak memiliki izin untuk mengakses Dashboard Admin Glowear. Silakan hubungi Super Admin jika ini adalah kesalahan.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-600/20"
        >
          <ArrowLeft size={16} /> Kembali ke Login
        </button>
      </div>
    </div>
  );
}