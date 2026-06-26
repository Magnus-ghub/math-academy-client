import Link from "next/link";
import { Calculator, BookOpen, Award, GraduationCap } from "lucide-react";

const testTypes = [
  {
    icon: Award,
    title: "Milliy Sertifikat",
    description: "Milliy Sertifikat imtihoniga maxsus tayyorlangan test to'plamlari.",
    color: "bg-green-500/10 text-green-600",
    border: "border-green-200 hover:border-green-500",
    href: "/tests?type=MILLIY_SERTIFIKAT",
    count: "40+ test",
  },
  {
    icon: GraduationCap,
    title: "Attestatsiya",
    description: "O'qituvchilar uchun attestatsiya imtihoniga tayyorgarlik testlari.",
    color: "bg-purple-500/10 text-purple-600",
    border: "border-purple-200 hover:border-purple-500",
    href: "/tests?type=ATTESTATSIYA",
    count: "20+ test",
  },
  {
    icon: BookOpen,
    title: "SAT",
    description: "SAT imtihoniga yo'naltirilgan matematika testlari. Xalqaro standartlar asosida.",
    color: "bg-accent/10 text-accent",
    border: "border-accent/20 hover:border-accent",
    href: "/tests?type=SAT",
    count: "30+ test",
  },
  {
    icon: Calculator,
    title: "DTM",
    description: "Davlat Test Markazi imtihoniga to'liq tayyorgarlik. Majburiy matematika bloki va fan testlari.",
    color: "bg-primary/10 text-primary",
    border: "border-primary/20 hover:border-primary",
    href: "/tests?type=DTM",
    count: "50+ test",
  },
];

export default function TestTypesSection() {
  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
            Test turlari
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto hidden sm:block">
            Qaysi imtihonga tayyorlanayotgan bo'lsangiz — bizda siz uchun maxsus testlar bor
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {testTypes.map((type) => (
            <Link href={type.href} key={type.title}>
              <div className={`bg-background rounded-2xl border-2 p-4 md:p-6 h-full transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${type.border}`}>
                <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 ${type.color}`}>
                  <type.icon className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 leading-tight">{type.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4 leading-relaxed hidden sm:block">
                  {type.description}
                </p>
                <span className="text-[10px] md:text-xs font-semibold px-2 py-1 md:px-3 rounded-full bg-muted">
                  {type.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}