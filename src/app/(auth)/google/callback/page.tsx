"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");
    const userRole = searchParams.get("userRole");

    if (token && userId) {
      setAuth({ id: userId, userName, userRole } as any, token, []);
      const stored = sessionStorage.getItem("auth-callbackUrl");
      if (stored) sessionStorage.removeItem("auth-callbackUrl");
      const redirect = stored?.startsWith("/dashboard")
        ? stored
        : userRole === "ADMIN" ? "/admin" : "/dashboard";
      router.push(redirect);
    } else {
      router.push("/login");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground animate-pulse">Kirilmoqda...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Kirilmoqda...</p>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
