"use client";

import { useQuery } from "@apollo/client/react";
import { Users, BookOpen, CreditCard, Flag, TrendingUp } from "lucide-react";
import { GET_ALL_USERS } from "@/lib/graphql/user";
import { GET_ALL_TESTS } from "@/lib/graphql/test";
import { GET_ALL_PAYMENTS } from "@/lib/graphql/payment";

export default function AdminDashboardPage() {
  const { data: usersData } = useQuery<{ getAllUsers: any[] }>(GET_ALL_USERS);
  const { data: testsData } = useQuery<{ getAllTests: any[] }>(GET_ALL_TESTS);
  const { data: paymentsData } = useQuery<{ getAllPayments: any[] }>(GET_ALL_PAYMENTS);

  const users = usersData?.getAllUsers || [];
  const tests = testsData?.getAllTests || [];
  const payments = paymentsData?.getAllPayments || [];

  const pendingPayments = payments.filter((p) => p.paymentStatus === "PENDING").length;
  const confirmedPayments = payments.filter((p) => p.paymentStatus === "CONFIRMED").length;
  const totalRevenue = payments
    .filter((p) => p.paymentStatus === "CONFIRMED")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const premiumUsers = users.filter((u) => u.userRole === "ACADEM_STUDENT").length;
  const publishedTests = tests.filter((t) => t.testStatus === "PUBLISHED").length;

  const stats = [
    { label: "Foydalanuvchilar", value: users.length, icon: Users, color: "text-primary bg-primary/10", sub: `${premiumUsers} premium` },
    { label: "Testlar", value: tests.length, icon: BookOpen, color: "text-accent bg-accent/10", sub: `${publishedTests} nashr` },
    { label: "To'lovlar", value: payments.length, icon: CreditCard, color: "text-green-600 bg-green-100", sub: `${pendingPayments} kutilmoqda` },
    { label: "Daromad", value: `${totalRevenue.toLocaleString()} so'm`, icon: TrendingUp, color: "text-purple-600 bg-purple-100", sub: `${confirmedPayments} tasdiqlangan` },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm">Loyiha umumiy ko'rinishi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background rounded-2xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending payments */}
      {pendingPayments > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-sm text-yellow-800">
                {pendingPayments} ta to'lov tasdiqlanishini kutmoqda
              </p>
              <p className="text-xs text-yellow-600">Manual to'lovlarni tasdiqlang</p>
            </div>
          </div>
          
          <a
            href="/admin/payments"
            className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-yellow-700 transition-colors"
          >
            Ko'rish →
          </a>
        </div>
      )}

      {/* Recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background rounded-2xl border border-border p-5">
          <h2 className="font-bold mb-4">So'nggi foydalanuvchilar</h2>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-sm">Foydalanuvchilar yo'q</p>
          ) : (
            <div className="space-y-3">
              {users.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {user.userName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.userName || "—"}</p>
                    <p className="text-xs text-muted-foreground">{user.userRole}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.userAuthType === "TELEGRAM"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {user.userAuthType === "TELEGRAM" ? "TG" : "G"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background rounded-2xl border border-border p-5">
          <h2 className="font-bold mb-4">So'nggi testlar</h2>
          {tests.length === 0 ? (
            <p className="text-muted-foreground text-sm">Testlar yo'q</p>
          ) : (
            <div className="space-y-3">
              {tests.slice(0, 5).map((test: any) => (
                <div key={test.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{test.testTitle}</p>
                    <p className="text-xs text-muted-foreground">{test.testType}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    test.testStatus === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {test.testStatus === "PUBLISHED" ? "Nashr" : "Qoralama"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}