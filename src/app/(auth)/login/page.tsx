"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { TELEGRAM_LOGIN } from "@/lib/graphql/auth";
import { useAuthStore } from "@/lib/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [telegramLogin, { loading }] = useMutation(TELEGRAM_LOGIN, {
    onCompleted: (data: any) => {
      const { user, accessToken } = data.telegramLogin;
      setAuth(user, accessToken);
      router.push(user.userRole === "ADMIN" ? "/admin" : "/dashboard");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });

  useEffect(() => {
    (window as any).TelegramLoginCallback = (data: any) => {
      telegramLogin({
        variables: {
          telegramId: data.id.toString(),
          hash: data.hash,
          authDate: data.auth_date,
          userName: data.first_name,
          userLastName: data.last_name,
          userImage: data.photo_url,
        },
      });
    };

    const timer = setTimeout(() => {
      const el = document.getElementById("telegram-login-btn");
      if (!el || el.querySelector("script")) return;

      const script = document.createElement("script");
      script.setAttribute("data-telegram-login", "Saidxonov_Academy_bot");
      script.setAttribute("data-size", "large");
      script.setAttribute("data-onauth", "TelegramLoginCallback(user)");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-origin", "https://cuben.info"); // qo'shing
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      el.appendChild(script);
    }, 500);

    return () => {
      clearTimeout(timer);
      delete (window as any).TelegramLoginCallback;
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-background rounded-2xl border border-border shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.jpg"
            alt="Saidxonov Academy"
            width={64}
            height={64}
            className="rounded-xl mb-4"
          />
          <h1 className="text-2xl font-bold text-center">Xush kelibsiz!</h1>
          <p className="text-muted-foreground text-sm text-center mt-1">
            Saidxonov Academy ga kirish
          </p>
        </div>

        {/* Telegram Widget */}
        <div className="flex justify-center mb-2">
          <div id="telegram-login-btn" />
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground animate-pulse text-center mb-4">
            Kirilmoqda...
          </p>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">yoki</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={() =>
            (window.location.href = "https://api.cuben.info/auth/google")
          }
          className="w-full flex items-center justify-center gap-3 bg-background hover:bg-muted border border-border font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google orqali kirish
        </button>

        <div className="mt-6 p-4 bg-muted/50 rounded-xl">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Telegram guruh a'zolari Telegram orqali kiring — guruh testlari
            avtomatik ochiladi.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
