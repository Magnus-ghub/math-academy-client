import { Calculator, BookOpen, Award, GraduationCap, type LucideIcon } from "lucide-react";
import { TestType } from "@/lib/enums/test.enum";

interface TestTypeStyle {
  icon: LucideIcon;
  label: string;
  color: string;
  cardBg: string;
  ring: string;
  badge: string;
  badgeBordered: string;
  glow: string;
}

export const testTypeStyles: Record<TestType, TestTypeStyle> = {
  [TestType.MILLIY_SERTIFIKAT]: {
    icon: Award,
    label: "Milliy Sertifikat",
    color: "text-amber-600 bg-amber-500/15",
    cardBg: "bg-linear-to-br from-amber-500/10 via-amber-500/4 to-transparent border-amber-500/20",
    ring: "hover:border-amber-500/50",
    badge: "bg-amber-500/12 text-amber-700",
    badgeBordered: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40",
    glow: "from-amber-500/40 to-transparent",
  },
  [TestType.ATTESTATSIYA]: {
    icon: GraduationCap,
    label: "Attestatsiya",
    color: "text-violet-600 bg-violet-500/15",
    cardBg: "bg-linear-to-br from-violet-500/10 via-violet-500/4 to-transparent border-violet-500/20",
    ring: "hover:border-violet-500/50",
    badge: "bg-violet-500/12 text-violet-700",
    badgeBordered: "bg-violet-500/10 text-violet-700 border-violet-500/30 dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-500/40",
    glow: "from-violet-500/40 to-transparent",
  },
  [TestType.SAT]: {
    icon: BookOpen,
    label: "SAT",
    color: "text-sky-600 bg-sky-500/15",
    cardBg: "bg-linear-to-br from-sky-500/10 via-sky-500/4 to-transparent border-sky-500/20",
    ring: "hover:border-sky-500/50",
    badge: "bg-sky-500/12 text-sky-700",
    badgeBordered: "bg-sky-500/10 text-sky-700 border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/40",
    glow: "from-sky-500/40 to-transparent",
  },
  [TestType.DTM]: {
    icon: Calculator,
    label: "DTM",
    color: "text-emerald-600 bg-emerald-500/15",
    cardBg: "bg-linear-to-br from-emerald-500/10 via-emerald-500/4 to-transparent border-emerald-500/20",
    ring: "hover:border-emerald-500/50",
    badge: "bg-emerald-500/12 text-emerald-700",
    badgeBordered: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40",
    glow: "from-emerald-500/40 to-transparent",
  },
};
