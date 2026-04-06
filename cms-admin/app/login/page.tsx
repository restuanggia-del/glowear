"use client";

import { useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    console.log("USER:", user); // 🔥 DEBUG

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role?.toUpperCase() !== "ADMIN") {
      router.push("/unauthorized");
      return;
    }
  }, [user, isLoading]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;
  if (user.role?.toUpperCase() !== "ADMIN") return null;

  return <div>Dashboard Admin</div>;
}