import { Users, BookOpen, CreditCard, Flag } from "lucide-react";

const stats = [
  { label: "Foydalanuvchilar", value: "0", icon: Users, color: "text-primary bg-primary/10" },
  { label: "Testlar", value: "0", icon: BookOpen, color: "text-accent bg-accent/10" },
  { label: "To'lovlar", value: "0", icon: CreditCard, color: "text-green-600 bg-green-100" },
  { label: "Reportlar", value: "0", icon: Flag, color: "text-red-500 bg-red-100" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background rounded-2xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder */}
      <div className="bg-background rounded-2xl border border-border p-8 text-center text-muted-foreground">
        <p>Statistika ma'lumotlari yuklanmoqda...</p>
      </div>
    </div>
  );
}