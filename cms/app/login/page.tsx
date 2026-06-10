"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import type { LoginCredentials } from "../services/api";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type FormData = LoginCredentials;

// Daftar foto latar belakang yang ada di folder public
const BACKGROUND_IMAGES = [
  "/bg-1.jpeg", 
  "/bg-2.jpeg", 
  "/bg-3.jpeg"
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  // Efek Slideshow Otomatis setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prevBg) => (prevBg + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const userResponse = await login(data.email, data.kataSandi);
      
      let role = userResponse?.role;
      if (!role && typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          role = parsedUser.role;
        }
      }

      if (role === "ADMIN") {
        router.push("/dashboard"); 
      } else {
        router.push("/unauthorized"); 
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Login gagal, periksa email dan password Anda.");
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
      <div className="relative z-20 w-full max-w-md px-6">
        
        {/* Logo Atas (Disesuaikan ukurannya seperti di Register) */}
        <div className="flex justify-center mb-2">
          <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
            <Image src="/logoglomed.png" alt="Glomed Logo" fill sizes="100px" className="object-contain" priority />
          </div>
        </div>

        {/* Kartu Login Putih */}
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl">
          
          {/* Header Kartu (Ditambahkan agar seragam dengan Register) */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Selamat Datang</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Silakan masuk ke akun Anda</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Input Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register("email", { required: "Email wajib diisi" })}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                placeholder="admin@glowear.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("kataSandi", { required: "Password wajib diisi" })}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.kataSandi && <p className="text-red-500 text-xs mt-1 font-medium">{errors.kataSandi.message}</p>}
            </div>

            {/* Baris Bawah Form: Remember Me & Button Log In */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Ingat Saya</span>
              </label>

              {/* Tombol Login (Disesuaikan warnanya dengan gaya Register) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-wait text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>
        </div>

        {/* Tautan Tambahan di Bawah Kartu */}
        <div className="mt-8 text-center space-y-3">
          <Link href="/lupa-password" className="block text-sm text-slate-300 hover:text-white transition-colors">
            Lupa kata sandi?
          </Link>
          <Link href="/register" className="block text-sm font-medium text-white hover:text-blue-200 transition-colors">
            Buat Akun Baru &rarr;
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