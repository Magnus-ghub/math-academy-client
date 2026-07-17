"use client";

import Link from "next/link";
import { Calculator, BookOpen, Award, GraduationCap } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { GET_PUBLIC_TESTS } from "@/lib/graphql/test";

const testTypes = [
  {
    icon: Award,
    title: "Milliy Sertifikat",
    description: "Milliy Sertifikat imtihoniga maxsus tayyorlangan test to'plamlari.",
    color: "bg-green-500/10 text-green-600",
    border: "border-green-200 hover:border-green-500",
    href: "/tests?type=MILLIY_SERTIFIKAT",
    key: "MILLIY_SERTIFIKAT",
  },
  {
    icon: GraduationCap,
    title: "Attestatsiya",
    description: "O'qituvchilar uchun attestatsiya imtihoniga tayyorgarlik testlari.",
    color: "bg-purple-500/10 text-purple-600",
    border: "border-purple-200 hover:border-purple-500",
    href: "/tests?type=ATTESTATSIYA",
    key: "ATTESTATSIYA",
  },
  {
    icon: BookOpen,
    title: "SAT",
    description: "SAT imtihoniga yo'naltirilgan matematika testlari. Xalqaro standartlar asosida.",
    color: "bg-accent/10 text-accent",
    border: "border-accent/20 hover:border-accent",
    href: "/tests?type=SAT",
    key: "SAT",
  },
  {
    icon: Calculator,
    title: "DTM",
    description: "Davlat Test Markazi imtihoniga to'liq tayyorgarlik. Majburiy matematika bloki va fan testlari.",
    color: "bg-primary/10 text-primary",
    border: "border-primary/20 hover:border-primary",
    href: "/tests?type=DTM",
    key: "DTM",
  },
];

export default function TestTypesSection() {
  const { data } = useQuery<{ getPublicTests: { testType: string }[] }>(GET_PUBLIC_TESTS);

  const countByType = (key: string) =>
    data?.getPublicTests?.filter((t) => t.testType === key).length ?? null;

  const formatCount = (n: number) =>
    n > 9999 ? `${Math.floor(n / 1000)}K+` : `${n} ta`;

  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
            Test turlari
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-3xl mx-auto hidden sm:block whitespace-nowrap">
            Qaysi imtihonga tayyorlanayotgan bo'lsangiz — bizda siz uchun maxsus testlar bor
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {testTypes.map((type) => {
            const count = countByType(type.key);
            return (
              <Link href={type.href} key={type.title}>
                <div className={`bg-background rounded-2xl border-2 p-4 md:p-6 h-full transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1 ${type.border}`}>
                  <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 ${type.color}`}>
                    <type.icon className="w-4 h-4 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 leading-tight">{type.title}</h3>
                  <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4 leading-relaxed hidden sm:block">
                    {type.description}
                  </p>
                  {count !== null && (
                    <span className="text-[10px] md:text-xs font-semibold px-2 py-1 md:px-3 rounded-full bg-muted">
                      {formatCount(count)} test
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
