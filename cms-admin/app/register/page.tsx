"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { api } from "../services/api"; // Sesuaikan path ini dengan lokasi file api.ts Anda
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Daftar foto latar belakang yang sama dengan Login
const BACKGROUND_IMAGES = [
  "/bg-1.jpeg", 
  "/bg-2.jpeg", 
  "/bg-3.jpeg"
];

export default function RegisterPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<any>();

  // Efek Slideshow Otomatis setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prevBg) => (prevBg + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Mengirim data ke backend
      await api.post("/auth/register", {
        nama: data.nama,
        username: data.username,
        email: data.email,
        kataSandi: data.kataSandi, // Pastikan ini sesuai dengan field backend Anda
      });

      alert("Registrasi berhasil! Silakan login dengan akun baru Anda.");
      router.push("/login"); // Pindah ke halaman login setelah sukses
    } catch (err: any) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Registrasi gagal, periksa kembali data Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-slate-900 py-10">
      
      {/* ================= SLIDESHOW LATAR BELAKANG FOTO ================= */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        {BACKGROUND_IMAGES.map((bg, index) => (
          <div
            key={bg}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBg ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={bg}
              alt={`Background Glowear ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover object-center"
            />
          </div>
        ))}
        {/* Overlay Gelap */}
        <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-[2px] mix-blend-multiply z-10"></div>
      </div>
      {/* =============================================================== */}

      {/* Kontainer Utama Form */}
      <div className="relative z-20 w-full max-w-lg px-6">
        
        {/* Logo Atas */}
        <div className="flex justify-center mb-2">
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
            <Image
              src="/logoglomed.png" // 👈 Sesuaikan dengan nama logo Anda
              alt="Logo Glowear"
              fill
              priority
            />
          </div>
        </div>

        {/* Kartu Register Putih */}
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Buat Akun Baru</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Bergabunglah dengan Glowear sekarang</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Grid untuk Nama & Username agar tidak terlalu panjang ke bawah */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Input Nama */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  {...register("nama", { required: "Nama wajib diisi" })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  placeholder="Budi Santoso"
                />
                {errors.nama && <p className="text-red-500 text-xs mt-1 font-medium">{errors.nama.message as string}</p>}
              </div>

              {/* Input Username */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                <input
                  type="text"
                  {...register("username", { required: "Username wajib diisi" })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  placeholder="budis"
                  autoCapitalize="none"
                />
                {errors.username && <p className="text-red-500 text-xs mt-1 font-medium">{errors.username.message as string}</p>}
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                {...register("email", { required: "Email wajib diisi" })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="budi@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message as string}</p>}
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("kataSandi", { 
                    required: "Password wajib diisi",
                    minLength: { value: 6, message: "Minimal 6 karakter" }
                  })}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.kataSandi && <p className="text-red-500 text-xs mt-1 font-medium">{errors.kataSandi.message as string}</p>}
            </div>

            {/* Baris Bawah Form: Button Daftar */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-wait text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95"
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </div>
          </form>
        </div>

        {/* Tautan Tambahan di Bawah Kartu */}
        <div className="mt-8 text-center space-y-3">
          <Link href="/login" className="block text-sm font-medium text-white hover:text-blue-200 transition-colors">
            &larr; Kembali ke halaman Login
          </Link>
        </div>

      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-4 left-0 w-full text-center z-20 hidden md:block">
        <p className="text-xs text-white/50 font-medium">
          © {new Date().getFullYear()} Glowear Konveksi. All rights reserved.
        </p>
      </div>

    </div>
  );
}