"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout, validate } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.replace("/login");
        return;
      }
      try {
        const valid = await validate();
        if (!valid) {
          setAccessDenied(true);
        } else {
          setLoading(false);
        }
      } catch (error) {
        setAccessDenied(true);
      }
    };

    checkAccess();
  }, [user, validate, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    );
  }

  if (accessDenied || user?.role !== "ADMIN") {
    router.replace("/unauthorized");
    return null;
  }

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard Admin Glowear
      </h1>

      <p className="mb-6 text-zinc-400">
        Selamat datang, {user.nama}
      </p>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-medium transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
