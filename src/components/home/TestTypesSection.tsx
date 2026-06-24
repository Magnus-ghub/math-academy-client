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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Test turlari
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Qaysi imtihonga tayyorlanayotgan bo'lsangiz — bizda siz uchun maxsus testlar bor
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testTypes.map((type) => (
            <Link href={type.href} key={type.title}>
              <div className={`bg-background rounded-2xl border-2 p-6 h-full transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${type.border}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${type.color}`}>
                  <type.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {type.description}
                </p>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted">
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