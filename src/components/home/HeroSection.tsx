import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Trophy, Users } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-accent/5">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            O'zbekistondagi #1 matematika platformasi
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Matematikani <span className="text-primary">professional</span>{" "}
            darajada o'rganing
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            DTM, SAT, Milliy Sertifikat va Attestatsiya imtihonlariga onlayn
            testlar orqali samarali tayyorlaning. Minglab talabalar bilan birga
            o'qing.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/tests">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8"
              >
                Testlarni ko'rish
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>

            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 px-8"
              >
                Bepul boshlash
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">45K+</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                Obunachi
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">35M+</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <BookOpen className="w-3 h-3" />
                Ko'rishlar
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">95%</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3" />
                Muvaffaqiyat
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
