import { BookOpen, Trophy, Users, Clock } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Ishlangan testlar", value: "0", icon: BookOpen, color: "text-primary bg-primary/10", href: "/dashboard/results" },
  { label: "O'rtacha ball", value: "0%", icon: Trophy, color: "text-accent bg-accent/10", href: "/dashboard/results" },
  { label: "Guruhlar", value: "0", icon: Users, color: "text-green-600 bg-green-100", href: "/dashboard/groups" },
  { label: "Sarflangan vaqt", value: "0 daq", icon: Clock, color: "text-purple-600 bg-purple-100", href: "/dashboard/results" },
];

const quickLinks = [
  { href: "/dashboard/tests", label: "Testlarni boshlash", desc: "DTM, SAT, Milliy Sertifikat", color: "bg-primary text-white" },
  { href: "/dashboard/groups", label: "Guruh testlari", desc: "Haftalik maxsus testlar", color: "bg-accent text-white" },
  { href: "/dashboard/results", label: "Natijalarim", desc: "Tahlil va statistika", color: "bg-muted text-foreground" },
  { href: "/dashboard/profile", label: "Profilim", desc: "Ma'lumotlarni tahrirlash", color: "bg-muted text-foreground" },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Xush kelibsiz! 👋</h1>
        <p className="text-muted-foreground">Bugun ham matematika bilan mashg'ul bo'ling.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-background rounded-2xl border border-border p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-lg font-bold mb-4">Tez kirish</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className={`rounded-2xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 ${link.color}`}>
              <p className="font-bold mb-1">{link.label}</p>
              <p className={`text-sm ${link.color.includes("text-white") ? "text-white/80" : "text-muted-foreground"}`}>
                {link.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent results placeholder */}
      <h2 className="text-lg font-bold mb-4">So'nggi natijalar</h2>
      <div className="bg-background rounded-2xl border border-border p-8 text-center text-muted-foreground">
        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Hali natijalar yo'q</p>
        <p className="text-sm mt-1">Birinchi testni ishlang!</p>
        <Link href="/dashboard/tests">
          <button className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            Testni boshlash
          </button>
        </Link>
      </div>
    </div>
  );
}