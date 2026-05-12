"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, ShieldCheck, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { forgotPassword, verifyOtp, resetPassword } from "../services/api";
import Swal from "sweetalert2";

export default function LupaPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: res.message,
        confirmButtonColor: '#0f172a'
      });
      // Di development, OTP dikembalikan di response
      if (res.otp) {
        setOtp(res.otp);
      }
      setStep(2);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal mengirim OTP',
        confirmButtonColor: '#0f172a'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setStep(3);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'OTP Salah',
        text: err.response?.data?.message || 'Kode OTP tidak valid',
        confirmButtonColor: '#0f172a'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Konfirmasi password tidak cocok' });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Password Anda telah diperbarui. Silakan login kembali.',
        confirmButtonColor: '#0f172a'
      }).then(() => {
        router.push("/login");
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal mereset password',
        confirmButtonColor: '#0f172a'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-slate-900 py-10 px-4">
      {/* Background Slideshow Overlay (Simpler for this page) */}
      <div className="absolute inset-0 z-0 bg-indigo-950/40 backdrop-blur-[2px]"></div>

      <div className="relative z-20 w-full max-w-md">
        {/* Back to Login */}
        <Link href="/login" className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={18} className="mr-2" />
          Kembali ke Login
        </Link>

        {/* Form Card */}
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800">
              {step === 1 ? <Mail size={32} /> : step === 2 ? <ShieldCheck size={32} /> : <Lock size={32} />}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {step === 1 ? "Lupa Password" : step === 2 ? "Verifikasi OTP" : "Buat Password Baru"}
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {step === 1 
                ? "Masukkan email Anda untuk menerima kode verifikasi reset password." 
                : step === 2 
                ? `Masukkan 6 digit kode OTP yang dikirim ke ${email}` 
                : "Silakan masukkan password baru yang kuat untuk akun Anda."}
            </p>
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Terdaftar</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-full font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:bg-slate-400"
              >
                {loading ? "Mengirim..." : "Kirim OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kode OTP</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none tracking-[0.5em] text-center font-bold"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-full font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:bg-slate-400"
              >
                {loading ? "Memverifikasi..." : "Verifikasi OTP"}
              </button>
              <button 
                type="button"
                onClick={handleRequestOtp}
                className="w-full text-sm text-slate-500 hover:text-slate-800 transition-colors font-semibold"
              >
                Kirim ulang kode?
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-full font-bold shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:bg-slate-400"
              >
                {loading ? "Menyimpan..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
