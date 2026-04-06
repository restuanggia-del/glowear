"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useState } from "react";

interface RegisterFormData {
  nama: string;
  username: string;
  email: string;
  kataSandi: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register: reg, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await register(data);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.message || "Register gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg w-80 border border-zinc-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Register Glowear
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            placeholder="Nama"
            {...reg("nama", { required: "Nama wajib" })}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.nama && <p className="text-red-400 text-sm">{errors.nama.message}</p>}

          <input
            placeholder="Username"
            {...reg("username", { required: "Username wajib" })}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.username && <p className="text-red-400 text-sm">{errors.username.message}</p>}

          <input
            type="email"
            placeholder="Email"
            {...reg("email", { required: "Email wajib" })}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...reg("kataSandi", { required: "Password wajib", minLength: { value: 6, message: "Min 6 karakter" } })}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.kataSandi && <p className="text-red-400 text-sm">{errors.kataSandi.message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 transition p-2 rounded text-white font-semibold cursor-pointer"
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-zinc-400 mt-4 text-center">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

