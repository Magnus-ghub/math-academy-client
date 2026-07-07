"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client/react";
import QRCode from "qrcode";
import { Loader2, QrCode, ChevronLeft } from "lucide-react";
import { CREATE_QR_SESSION, CHECK_QR_SESSION } from "@/lib/graphql/auth";
import { useAuthStore } from "@/lib/store/auth.store";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!;

const features = [
  "DTM, SAT, Milliy Sertifikat testlari",
  "Real natijalar va statistika",
  "50 000+ o'quvchi ishongan platforma",
  "Guruh a'zolariga maxsus testlar",
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showQr, setShowQr] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const loggedIn = useRef(false);

  const [createQrSession] = useMutation(CREATE_QR_SESSION, {
    onCompleted: (data: any) => setSessionId(data.createQrSession),
  });

  // QR faqat foydalanuvchi "boshqa qurilmada" variantini tanlaganda yaratiladi
  useEffect(() => {
    if (showQr && !sessionId) createQrSession();
  }, [showQr]);

  useEffect(() => {
    if (!sessionId) return;
    const link = `https://t.me/${BOT_USERNAME}?start=qr_${sessionId}`;
    QRCode.toDataURL(link, { width: 220, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [sessionId]);

  const { data } = useQuery<{ checkQrSession: any }>(CHECK_QR_SESSION, {
    variables: { sessionId },
    skip: !showQr || !sessionId || loggedIn.current,
    pollInterval: 2000,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    const result = data?.checkQrSession;
    if (!result || loggedIn.current) return;

    if (result.status === "CONFIRMED") {
      loggedIn.current = true;
      const { user, accessToken, groups } = result.session;
      setAuth(user, accessToken, groups);
      router.push(user.userRole === "ADMIN" ? "/admin" : "/dashboard");
    } else if (result.status === "NOT_FOUND") {
      // Sessiya eskirgan — yangisini avtomatik yaratamiz
      setSessionId(null);
      setQrDataUrl(null);
      createQrSession();
    }
  }, [data]);

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
                <svg className="w-4 h-4 mt-0.5 shrink-0 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4 12 14.01l-3-3" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/40 text-xs">© 2026 Saidxonov Academy</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-background p-8 md:p-10 flex flex-col justify-center items-center text-center">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2.5 mb-8 self-start">
          <Image src="/logo.jpg" alt="Saidxonov Academy" width={36} height={36} className="rounded-lg" />
          <span className="font-bold text-primary">Saidxonov Academy</span>
        </div>

        {showQr ? (
          <>
            <button
              onClick={() => setShowQr(false)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors self-start mb-4"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Orqaga
            </button>

            <h1 className="text-2xl font-bold mb-1">QR kodni skanerlang</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Boshqa qurilmadagi (telefoningizdagi) Telegram bilan skanerlang
            </p>

            <div className="w-56 h-56 rounded-2xl border-2 border-border flex items-center justify-center bg-white p-3 mb-3">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="Telegram QR kod" className="w-full h-full" />
              ) : (
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2 max-w-64">
              Telegram → Sozlamalar → Qurilmalar → QR kod skanerlash
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">Xush kelibsiz!</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Telegram bot orqali ro'yxatdan o'ting yoki hisobingizga kiring
            </p>

            <a
              href={`https://t.me/${BOT_USERNAME}?start=register`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-[#26A5E4] hover:bg-[#229ED9] text-white font-medium py-3.5 px-6 rounded-xl transition-colors text-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.05 3.76 2.87 10.9c-1.24.5-1.23 1.19-.23 1.5l4.65 1.45 1.8 5.48c.22.6.11.85.75.85.49 0 .7-.22.97-.48l2.32-2.24 4.83 3.56c.9.5 1.53.24 1.76-.82l3.18-14.9c.33-1.3-.5-1.87-1.85-1.54Z" />
              </svg>
              Telegram bot orqali kirish / ro'yxatdan o'tish
            </a>

            <p className="text-xs text-muted-foreground text-center leading-relaxed mt-4 mb-6">
              Tugmani bosgach Telegram botimiz ochiladi — u yerda qisqa forma
              to'ldirib, saytga avtomatik kirasiz.
            </p>

            <button
              onClick={() => setShowQr(true)}
              className="w-full flex items-center justify-center gap-2 border border-border hover:bg-muted text-sm font-medium py-3 px-6 rounded-xl transition-colors"
            >
              <QrCode className="w-4 h-4" />
              Telegram boshqa qurilmada — QR orqali kirish
            </button>
          </>
        )}

        <div className="mt-6 text-center space-y-2">
          <Link href="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Bosh sahifaga qaytish
          </Link>
          <Link href="/recover" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
            Hisobingizga kira olmayapsizmi? →
          </Link>
        </div>
      </div>
    </div>
  );
}
