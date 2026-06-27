"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { TELEGRAM_LOGIN, LOGIN_WITH_EMAIL } from "@/lib/graphql/auth";
import { useAuthStore } from "@/lib/store/auth.store";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!;
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const features = [
  "DTM, SAT, Milliy Sertifikat testlari",
  "Real natijalar va statistika",
  "50 000+ o'quvchi ishongan platforma",
  "Guruh a'zolariga maxsus testlar",
];

type Tab = "social" | "email";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { setAuth } = useAuthStore();
  const mounted = useRef(false);

  const [tab, setTab] = useState<Tab>("social");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const getRedirect = (role: string) => {
    if (callbackUrl?.startsWith("/dashboard")) return callbackUrl;
    return role === "ADMIN" ? "/admin" : "/dashboard";
  };

  const [telegramLogin, { loading: tgLoading }] = useMutation(TELEGRAM_LOGIN, {
    onCompleted: (data: any) => {
      const { user, accessToken, groups } = data.telegramLogin;
      setAuth(user, accessToken, groups);
      router.push(getRedirect(user.userRole));
    },
    onError: (err: any) => {
      const msg = err.graphQLErrors?.[0]?.message;
      if (msg === "Invalid Telegram data") {
        toast.error("Telegram ma'lumotlari noto'g'ri — qayta urinib ko'ring");
      } else {
        toast.error("Kirishda xatolik yuz berdi");
      }
    },
  });

  const [loginWithEmail, { loading: emailLoading }] = useMutation(LOGIN_WITH_EMAIL, {
    onCompleted: (data: any) => {
      const { user, accessToken, groups } = data.loginWithEmail;
      setAuth(user, accessToken, groups);
      router.push(getRedirect(user.userRole));
    },
    onError: (err: any) => {
      const msg = err.graphQLErrors?.[0]?.message;
      toast.error(msg ?? "Email yoki parol noto'g'ri");
    },
  });

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    (window as any).TelegramLoginCallback = (data: any) => {
      telegramLogin({
        variables: {
          telegramId: data.id.toString(),
          hash: data.hash,
          authDate: Number(data.auth_date),
          userName: data.first_name ?? undefined,
          userLastName: data.last_name ?? undefined,
          userImage: data.photo_url ?? undefined,
        },
      });
    };

    const el = document.getElementById("telegram-login-btn");
    if (!el || el.querySelector("script")) return;

    const script = document.createElement("script");
    script.setAttribute("data-telegram-login", BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "TelegramLoginCallback(user)");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-userpic", "false");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.onerror = () => toast.error("Telegram widget yuklanmadi — domenni tekshiring");
    el.appendChild(script);

    return () => {
      delete (window as any).TelegramLoginCallback;
    };
  }, []);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginWithEmail({ variables: { email: email.trim().toLowerCase(), password } });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex rounded-2xl overflow-hidden shadow-xl border border-border">
      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-primary p-10 text-white">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <Image
              src="/logo.jpg"
              alt="Saidxonov Academy"
              width={44}
              height={44}
              className="rounded-xl"
            />
            <span className="font-bold text-lg leading-tight">
              Saidxonov<br />Academy
            </span>
          </div>

          <h2 className="text-3xl font-bold leading-tight mb-3">
            Matematika bo'yicha eng yaxshi platform
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            Real testlar, real natijalar. DTM, SAT va Milliy Sertifikat
            imtihonlariga puxta tayyorlaning.
          </p>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-white/90">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-white/60" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/40 text-xs">© 2026 Saidxonov Academy</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-background p-8 md:p-10 flex flex-col justify-center">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2.5 mb-8">
          <Image src="/logo.jpg" alt="Saidxonov Academy" width={36} height={36} className="rounded-lg" />
          <span className="font-bold text-primary">Saidxonov Academy</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">Xush kelibsiz!</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Hisobingizga kiring yoki ro'yxatdan o'ting
        </p>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("social")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              tab === "social" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ijtimoiy tarmoq
          </button>
          <button
            onClick={() => setTab("email")}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${
              tab === "email" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Email / Parol
          </button>
        </div>

        {tab === "social" && (
          <div className="space-y-4">
            {/* Telegram Widget */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                Telegram orqali kirish
              </p>
              <div id="telegram-login-btn" className="min-h-12.5" />
            </div>

            {tgLoading && (
              <p className="text-sm text-muted-foreground animate-pulse text-center">
                Kirilmoqda...
              </p>
            )}

            {process.env.NODE_ENV === "development" && (
              <button
                onClick={() =>
                  telegramLogin({
                    variables: {
                      telegramId: "123456789",
                      hash: "dev_bypass",
                      authDate: Math.floor(Date.now() / 1000),
                      userName: "DevUser",
                    },
                  })
                }
                className="w-full py-2 rounded-xl border-2 border-dashed border-yellow-400 text-yellow-600 text-xs font-medium hover:bg-yellow-50 transition-colors"
              >
                Dev: Test login (Telegram bypass)
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">yoki</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => {
                if (callbackUrl?.startsWith("/dashboard")) {
                  sessionStorage.setItem("auth-callbackUrl", callbackUrl);
                }
                window.location.href = `${API_BASE}/auth/google`;
              }}
              className="w-full flex items-center justify-center gap-3 border border-border hover:bg-muted font-medium py-3 px-6 rounded-xl transition-colors text-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google orqali kirish / ro'yxatdan o'tish
            </button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Telegram guruh a'zolari Telegram orqali kiring —<br />guruh testlari avtomatik ochiladi.
            </p>
          </div>
        )}

        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@misol.com"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Parol</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Parolni unutdim?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolingizni kiriting"
                  className="w-full border border-border rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={emailLoading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? "Kirilmoqda..." : "Kirish"}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Google orqali ro'yxatdan o'tgan bo'lsangiz,{" "}
              <button
                type="button"
                onClick={() => setTab("social")}
                className="text-primary hover:underline"
              >
                ijtimoiy tarmoq
              </button>{" "}
              tabidan kirish yoki parol yaratish mumkin.
            </p>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Yuklanmoqda...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
