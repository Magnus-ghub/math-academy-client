"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { SET_GOOGLE_PASSWORD } from "@/lib/graphql/auth";
import { useAuthStore } from "@/lib/store/auth.store";

export default function SetPasswordPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [setGooglePassword, { loading }] = useMutation(SET_GOOGLE_PASSWORD, {
    onCompleted: () => {
      toast.success("Parol muvaffaqiyatli yaratildi!");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      const msg = err.graphQLErrors?.[0]?.message;
      toast.error(msg ?? "Xatolik yuz berdi");
    },
  });

  useEffect(() => {
    // Agar user yo'q bo'lsa login sahifasiga yo'naltirish
    const userId = sessionStorage.getItem("google-set-password-userId");
    if (!user?.id && !userId) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (password !== confirm) {
      toast.error("Parollar bir xil emas");
      return;
    }

    const userId = user?.id ?? sessionStorage.getItem("google-set-password-userId");
    if (!userId) {
      toast.error("Foydalanuvchi topilmadi");
      return;
    }

    sessionStorage.removeItem("google-set-password-userId");
    setGooglePassword({ variables: { userId, password } });
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Zaif", "O'rtacha", "Kuchli"];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-border bg-background shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.jpg" alt="Saidxonov Academy" width={40} height={40} className="rounded-xl" />
          <span className="font-bold text-lg text-primary leading-tight">
            Saidxonov<br />Academy
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold">Parol yarating</h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Google akkauntingiz uchun parol o'rnating. Keyinchalik email va parol bilan ham kira olasiz.
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
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Saqlanmoqda..." : "Parolni saqlash va davom etish"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Keyinchalik email va parol bilan ham kira olasiz
        </p>
      </div>
    </div>
  );
}
