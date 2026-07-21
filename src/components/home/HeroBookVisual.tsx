import Image from "next/image";
import { BookOpen, Star } from "lucide-react";

export default function HeroBookVisual() {
  return (
    <div className="relative shrink-0 w-full max-w-xs lg:max-w-sm hidden sm:flex items-center justify-center">
      {/* Glow */}
      <div className="absolute inset-0 blur-3xl bg-primary/15 dark:bg-primary/25 rounded-full scale-90 pointer-events-none" />

      {/* Backdrop arch */}
      <div className="absolute inset-x-4 top-4 bottom-10 -z-10 bg-linear-to-br from-primary/12 via-accent/8 to-transparent dark:from-primary/20 dark:via-accent/12 rounded-[3rem] pointer-events-none" />

      {/* Decorative ring */}
      <div className="absolute top-2 left-0 w-12 h-12 rounded-full border-2 border-primary/25 hidden lg:block" />

      {/* Sparkle */}
      <svg className="absolute top-10 -right-6 w-5 h-5 text-accent/70 hidden lg:block" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0 L14 9 L24 12 L14 15 L12 24 L10 15 L0 12 L10 9 Z" />
      </svg>

      {/* Small floating dot */}
      <div className="absolute bottom-28 -left-5 w-3.5 h-3.5 rounded-full bg-primary/40 shadow-md hidden lg:block" />

      {/* Pedestal platform */}
      <div className="absolute bottom-3 w-60 h-12 rounded-full bg-card/80 dark:bg-card/50 border border-border/60 backdrop-blur-sm shadow-[0_18px_36px_-12px_rgba(0,0,0,0.18)] pointer-events-none" />
      <div className="absolute bottom-6 w-52 h-8 bg-primary/15 dark:bg-primary/25 rounded-full blur-lg pointer-events-none" />

      {/* Book wrapper — 3D tilt */}
      <div
        className="relative"
        style={{ transform: "perspective(800px) rotateY(-8deg) rotateX(2deg)" }}
      >
        <Image
          src="/images/kitob.jpg"
          alt="Milliy Sertifikat sA+ri Matematika"
          width={388}
          height={484}
          className="w-74 md:w-82 rounded-2xl shadow-[0_32px_64px_rgba(0,0,0,0.28)] object-cover select-none"
          priority
          draggable={false}
        />

        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

        {/* Badge — top right */}
        <div className="absolute -top-3 -right-3 bg-accent text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1 whitespace-nowrap">
          <Star className="w-3 h-3 fill-white" />
          Muallif kitobi
        </div>

        {/* Badge — bottom left */}
        <div className="absolute -bottom-3 -left-3 bg-background border border-border rounded-xl shadow-lg px-3 py-2 flex items-center gap-2">
          <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground leading-none">Nashriyot</p>
            <p className="text-xs font-bold leading-tight mt-0.5">Spectrum</p>
          </div>
        </div>
      </div>
    </div>
  );
}
