"use client";

import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">
        🚫 Akses Ditolak Silahkan Hubungi Admin
      </h1>
      <p className="text-zinc-400 mb-6">
        Kamu tidak memiliki akses ke halaman ini
      </p>

      <button
        onClick={() => router.push("/login")}
        className="bg-blue-500 px-4 py-2 rounded"
      >
        Kembali ke Login
      </button>
    </div>
  );
}