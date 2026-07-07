"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@apollo/client/react";
import { CheckCircle2 } from "lucide-react";
import { SUBMIT_RECOVERY_REQUEST } from "@/lib/graphql/recovery";
import { toast } from "sonner";

export default function RecoverPage() {
  const [form, setForm] = useState({ fullName: "", phone: "", telegramUsername: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const [submitRecoveryRequest, { loading }] = useMutation(SUBMIT_RECOVERY_REQUEST, {
    onCompleted: () => setSubmitted(true),
    onError: (err: any) => {
      const msg = err.graphQLErrors?.[0]?.message;
      toast.error(msg ?? "Yuborishda xatolik yuz berdi");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim() || !form.message.trim()) return;
    submitRecoveryRequest({
      variables: {
        input: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          telegramUsername: form.telegramUsername.trim() || undefined,
          message: form.message.trim(),
        },
      },
    });
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md mx-auto bg-background rounded-2xl border border-border shadow-xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">So'rovingiz qabul qilindi!</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Tez orada administratsiya siz bilan telefon orqali bog'lanadi va
          hisobingizni tiklashda yordam beradi.
        </p>
        <Link href="/" className="text-sm text-primary hover:underline">
          ← Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-background rounded-2xl border border-border shadow-xl p-8">
      <h1 className="text-xl font-bold mb-1">Hisobingizga kira olmayapsizmi?</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Telegram akkauntingiz o'chib qolgan yoki boshqa sababga ko'ra kira
        olmayotgan bo'lsangiz, quyidagi formani to'ldiring — administratsiya
        siz bilan bog'lanib, hisobingizni tiklashda yordam beradi.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Ism-familya</label>
          <input
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Ism Familya"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Telefon raqam</label>
          <input
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+998 90 000 00 00"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Telegram username <span className="text-muted-foreground font-normal">(ixtiyoriy)</span>
          </label>
          <input
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
            value={form.telegramUsername}
            onChange={(e) => setForm({ ...form, telegramUsername: e.target.value })}
            placeholder="@username"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Muammoyingiz</label>
          <textarea
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Masalan: Telegram akkauntim o'chib qoldi, hisobimga kira olmayapman..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Yuborilmoqda..." : "Yuborish"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Kirish sahifasiga qaytish
        </Link>
      </div>
    </div>
  );
}
