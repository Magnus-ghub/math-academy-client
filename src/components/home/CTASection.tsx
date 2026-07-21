import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Bugun boshlang — bepul!
        </h2>
        <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
          Minglab talabalar bilan birga o'qing va imtihonda yuqori natija qozonin.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 font-semibold">
              Bepul boshlash
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/tests">
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 px-8">
              Testlarni ko'rish
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}