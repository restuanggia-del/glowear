"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import type { LoginCredentials } from "../services/api";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
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
  const [currentBg, setCurrentBg] = useState(0); // State untuk melacak gambar yang aktif

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  // Efek Slideshow Otomatis setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prevBg) => (prevBg + 1) % BACKGROUND_IMAGES.length);
    }, 5000); // 5000 milidetik = 5 detik

    // Bersihkan interval saat komponen ditutup agar tidak bocor di memori
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
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-slate-900">
      
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
              priority={index === 0} // Hanya prioritaskan pemuatan foto pertama
              className="object-cover object-center"
            />
          </div>
        ))}
        {/* Overlay Gelap: Sangat penting agar form putih tetap kontras */}
        <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-[2px] mix-blend-multiply z-10"></div>
      </div>
      {/* =============================================================== */}

      {/* Kontainer Utama Form */}
      <div className="relative z-20 w-full max-w-md px-6">
        
        <div className="flex justify-center mb-2">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <Image
              src="/logoglomed.png" // 👈 UBAH INI sesuai nama file logo Anda di folder public
              alt="Logo Glowear"
              fill
              // className="object-contain p-3" // p-3 memberi jarak agar logo tidak nabrak garis pinggir
              priority
            />
          </div>
        </div>

        {/* Kartu Login Putih */}
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Input Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
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
            <div className="flex items-center justify-between pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Remember Me</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                {loading ? "Loading..." : "Log In"}
              </button>
            </div>
          </form>
        </div>

        {/* Tautan Tambahan di Bawah Kartu */}
        <div className="mt-8 text-center space-y-3">
          <Link href="/lupa-password" className="block text-sm text-blue-200 hover:text-white transition-colors">
            Lost your password?
          </Link>
          <Link href="/register" className="block text-sm font-medium text-white hover:text-blue-200 transition-colors">
            &larr; Create an Account
          </Link>
        </div>

      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-4 left-0 w-full text-center z-20">
        <p className="text-xs text-white/50 font-medium">
          © {new Date().getFullYear()} Glowear Konveksi. All rights reserved.
        </p>
      </div>

    </div>
  );
}