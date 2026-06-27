"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { RESET_PASSWORD } from "@/lib/graphql/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: () => {
      setDone(true);
    },
    onError: (err: any) => {
      const msg = err.graphQLErrors?.[0]?.message;
      toast.error(msg ?? "Token yaroqsiz yoki muddati o'tgan");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token topilmadi — parolni tiklash havolasi noto'g'ri");
      return;
    }
    if (password.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (password !== confirm) {
      toast.error("Parollar bir xil emas");
      return;
    }

    resetPassword({ variables: { token, newPassword: password } });
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Zaif", "O'rtacha", "Kuchli"];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"];

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="rounded-2xl border border-border bg-background shadow-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2 text-red-500">Havola noto'g'ri</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Parolni tiklash havolasi yaroqsiz. Qaytadan so'rov yuboring.
          </p>
          <Link href="/forgot-password" className="text-primary hover:underline text-sm">
            Qayta so'rov yuborish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-border bg-background shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.jpg" alt="Saidxonov Academy" width={40} height={40} className="rounded-xl" />
          <span className="font-bold text-lg text-primary leading-tight">
            Saidxonov<br />Academy
          </span>
        </div>

        {done ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Parol yangilandi!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Yangi parolingiz muvaffaqiyatli o'rnatildi. Endi kirish mumkin.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Kirish sahifasiga o'tish
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">Yangi parol o'rnatish</h1>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Yangi parolingizni kiriting. Kamida 6 ta belgidan iborat bo'lishi kerak.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Yangi parol</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kamida 6 ta belgi"
                    className="w-full border border-border rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            strength >= i ? strengthColor[strength] : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{strengthLabel[strength]}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Parolni tasdiqlang</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Parolni qayta kiriting"
                    className="w-full border border-border rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirm.length > 0 && password !== confirm && (
                  <p className="text-xs text-red-500 mt-1">Parollar bir xil emas</p>
                )}
                {confirm.length > 0 && password === confirm && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Parollar mos keladi
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password !== confirm || password.length < 6}
                className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saqlanmoqda..." : "Parolni yangilash"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kirish sahifasiga qaytish
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Yuklanmoqda...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
