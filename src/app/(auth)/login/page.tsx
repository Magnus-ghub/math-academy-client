import Image from "next/image";
import Link from "next/link";

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!;

const features = [
  "DTM, SAT, Milliy Sertifikat testlari",
  "Real natijalar va statistika",
  "50 000+ o'quvchi ishongan platforma",
  "Guruh a'zolariga maxsus testlar",
];

export default function LoginPage() {
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
      <div className="flex-1 bg-background p-8 md:p-10 flex flex-col justify-center">
        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2.5 mb-8">
          <Image src="/logo.jpg" alt="Saidxonov Academy" width={36} height={36} className="rounded-lg" />
          <span className="font-bold text-primary">Saidxonov Academy</span>
        </div>

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

        <p className="text-xs text-muted-foreground text-center leading-relaxed mt-4">
          Tugmani bosgach Telegram botimiz ochiladi — u yerda qisqa forma
          to'ldirib, saytga avtomatik kirasiz.
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
