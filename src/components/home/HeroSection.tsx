import Link from "next/link";
import { ArrowRight, Users, Star, CheckCircle, TrendingUp, Trophy } from "lucide-react";
import HeroBookVisual from "./HeroBookVisual";

const stats = [
  { value: "50K+", label: "Obunachi", icon: Users },
  { value: "35M+", label: "Ko'rishlar", icon: TrendingUp },
  { value: "95%", label: "Muvaffaqiyat", icon: Trophy },
];

const badges = ["DTM", "SAT", "Milliy Sertifikat", "Attestatsiya"];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-accent/5 pt-16 pb-12 md:pt-24 md:pb-20">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left — text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Top badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary/20">
              <Star className="w-3.5 h-3.5 fill-primary" />
              Real testlar · Real natijalar
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-[1.1]">
              Imtihonga{" "}
              <span className="relative inline-block text-primary">
                ishonch
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary/40" />
                </svg>
              </span>{" "}
              bilan kiring
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground mb-6 max-w-xl lg:mx-0 mx-auto leading-relaxed">
              DTM, SAT, Milliy Sertifikat va Attestatsiya uchun real testlar, batafsil tahlil va shaxsiy statistika — hammasi bir joyda.
            </p>

            {/* Exam type badges */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
              {badges.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 bg-background border border-border text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
                  <CheckCircle className="w-3 h-3 text-primary" />
                  {b}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <Link
                href="/tests"
                className="inline-flex items-center justify-center gap-2 bg-primary text-white px-7 py-3.5 rounded-2xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5"
              >
                Testlarni boshlash
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-background border border-border text-sm font-semibold px-7 py-3.5 rounded-2xl hover:bg-muted transition-all shadow-sm"
              >
                Bepul ro'yxatdan o'tish
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex gap-8 justify-center lg:justify-start">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center lg:text-left">
                  <div className="text-2xl font-black text-primary">{value}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center lg:justify-start mt-0.5">
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — book visual */}
          <HeroBookVisual />
        </div>
      </div>
    </section>
  );
}
