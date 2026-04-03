"use client";

import { useForm } from "react-hook-form";
import { api } from "../services/api";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const res = await api.post("/auth/login", data);
      console.log(res.data);

      alert("Login berhasil!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 border rounded w-80 space-y-4"
      >
        <h1 className="text-xl font-bold">Login Glowear</h1>

        <input
          placeholder="Email"
          {...register("email")}
          className="w-full border p-2"
        />

        <input
          type="password"
          placeholder="Password"
          {...register("kataSandi")}
          className="w-full border p-2"
        />

        <button className="w-full bg-blue-500 text-white p-2">
          Login
        </button>
      </form>
    </div>
  );
}