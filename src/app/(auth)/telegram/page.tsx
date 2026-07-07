"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { Loader2, XCircle } from "lucide-react";
import { TELEGRAM_BOT_LOGIN } from "@/lib/graphql/auth";
import { useAuthStore } from "@/lib/store/auth.store";

function TelegramCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { setAuth } = useAuthStore();
  const requested = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getRedirect = (role: string) => (role === "ADMIN" ? "/admin" : "/dashboard");

  const [telegramBotLogin] = useMutation(TELEGRAM_BOT_LOGIN, {
    onCompleted: (data: any) => {
      const { user, accessToken, groups } = data.telegramBotLogin;
      setAuth(user, accessToken, groups);
      router.push(getRedirect(user.userRole));
    },
    onError: () => {
      setErrorMessage("Havola yaroqsiz yoki muddati o'tgan. Botdan qaytadan urinib ko'ring.");
    },
  });

  useEffect(() => {
    if (requested.current) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    requested.current = true;
    telegramBotLogin({ variables: { token } });
  }, [token]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center text-center py-24 px-6">
      {errorMessage ? (
        <>
          <XCircle className="w-10 h-10 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground mb-6">{errorMessage}</p>
          <Link href="/login" className="text-sm text-primary hover:underline">
            ← Kirish sahifasiga qaytish
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Kirilmoqda...</p>
        </>
      )}
    </div>
  );
}

export default function TelegramCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground animate-pulse">Yuklanmoqda...</p>
        </div>
      }
    >
      <TelegramCallbackContent />
    </Suspense>
  );
}
