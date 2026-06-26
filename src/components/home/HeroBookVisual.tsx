import Image from "next/image";
import { BookOpen, Star } from "lucide-react";

export default function HeroBookVisual() {
  return (
    <div className="relative shrink-0 w-full max-w-xs lg:max-w-sm hidden sm:flex items-center justify-center">
      {/* Glow */}
      <div className="absolute inset-0 blur-3xl bg-primary/15 rounded-full scale-90 pointer-events-none" />

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
