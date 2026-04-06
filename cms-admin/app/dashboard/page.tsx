"use client";

import { useAuth } from "../lib/auth-context";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      redirect("/login");
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg w-96 border border-zinc-700 text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Dashboard</h1>
        <p>Selamat datang, <strong>{user.nama}</strong>!</p>
        <p>Email: {user.email}</p>
        <p>Username: {user.username}</p>
        <p>Role: {user.role}</p>
        <button
          onClick={logout}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 transition p-2 rounded text-white font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

