"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useState, useEffect } from "react";

interface LoginFormData {
  email: string;
  kataSandi: string;
}

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // ✅ FIX: pakai useEffect
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      await login(data.email, data.kataSandi);

      router.push("/dashboard");

    } catch (err: any) {
      alert(err?.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg w-80 border border-zinc-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Login Glowear
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email wajib" })}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email.message}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            {...register("kataSandi", { required: "Password wajib" })}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
          />
          {errors.kataSandi && (
            <p className="text-red-400 text-sm">
              {errors.kataSandi.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 p-2 rounded text-white"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}