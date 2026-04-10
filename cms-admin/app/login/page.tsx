"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import type { LoginCredentials } from "../services/api";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";

type FormData = LoginCredentials;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

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
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-800 to-indigo-950">
      
      {/* Latar Belakang Vektor (Pegunungan Abstrak) */}
      <div className="absolute bottom-0 left-0 w-full leading-none z-0 pointer-events-none opacity-80">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#1e1b4b" fillOpacity="1" d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,218.7C840,235,960,245,1080,229.3C1200,213,1320,171,1380,149.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-full leading-none z-0 pointer-events-none opacity-60">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
          <path fill="#312e81" fillOpacity="1" d="M0,160L80,176C160,192,320,224,480,208C640,192,800,128,960,117.3C1120,107,1280,149,1360,170.7L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>

      {/* Kontainer Utama */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Logo Atas */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/30 shadow-xl">
            <ShieldCheck size={32} className="text-white" />
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
      <div className="absolute bottom-4 left-0 w-full text-center z-10">
        <p className="text-xs text-white/50 font-medium">
          © {new Date().getFullYear()} Glowear Konveksi. All rights reserved.
        </p>
      </div>

    </div>
  );
}