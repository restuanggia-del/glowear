"use client";

import { useForm } from "react-hook-form";
import { api } from "../services/api";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const res = await api.post("/auth/register", data);
      console.log(res.data);

      alert("Register berhasil!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
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
            {...register("nama")}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            placeholder="Username"
            {...register("username")}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            placeholder="Email"
            {...register("email")}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            {...register("kataSandi")}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition p-2 rounded text-white font-semibold cursor-pointer"
          >
            Register
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
