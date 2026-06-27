"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { REQUEST_PASSWORD_RESET } from "@/lib/graphql/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const [requestReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET, {
    onCompleted: () => {
      setSent(true);
    },
    onError: (err: any) => {
      const msg = err.graphQLErrors?.[0]?.message;
      toast.error(msg ?? "Xatolik yuz berdi, qayta urinib ko'ring");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    requestReset({ variables: { email: email.trim().toLowerCase() } });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-border bg-background shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.jpg" alt="Saidxonov Academy" width={40} height={40} className="rounded-xl" />
          <span className="font-bold text-lg text-primary leading-tight">
            Saidxonov<br />Academy
          </span>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Email yuborildi!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              <span className="font-medium text-foreground">{email}</span> manziliga
              parolni tiklash havolasi yuborildi. Elektron pochtangizni tekshiring.
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              Xat kelmasa, spam papkasini ham ko'ring. Havola 1 soat ichida amal qiladi.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Kirish sahifasiga qaytish
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">Parolni tiklash</h1>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Email manzilingizni kiriting — parolni tiklash havolasini yuboramiz.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Yuborilmoqda..." : "Havola yuborish"}
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
