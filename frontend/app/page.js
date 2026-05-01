"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // Cek role untuk redirect yang tepat
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "seller") router.replace("/seller/dashboard");
    else if (user.role === "kurir") router.replace("/courier/tasks");
    else if (user.role === "admin") router.replace("/admin/users");
    else router.replace("/home");
  }, [router]);

  return null;
}