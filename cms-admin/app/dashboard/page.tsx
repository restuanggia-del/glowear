"use client";

import { useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/unauthorized");
      return;
    }
  }, [user]);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return null;
  }

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold">
        Dashboard Admin Glowear
      </h1>

      <p className="mt-2 text-zinc-400">
        Selamat datang, {user.nama}
      </p>

      <button
        onClick={logout}
        className="mt-6 bg-red-500 px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}