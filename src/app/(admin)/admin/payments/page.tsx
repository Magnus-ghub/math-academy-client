"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda",
  CONFIRMED: "Tasdiqlangan",
  FAILED: "Rad etilgan",
};

const providerColors: Record<string, string> = {
  CLICK: "bg-blue-100 text-blue-700",
  MANUAL: "bg-gray-100 text-gray-700",
};

const mockPayments = Array.from({ length: 20 }, (_, i) => ({
  id: `pay-${i + 1}`,
  userId: `user-${i + 1}`,
  userName: `Foydalanuvchi ${i + 1}`,
  amount: (50000 + i * 10000).toLocaleString("uz-UZ"),
  paymentType: i % 2 === 0 ? "PREMIUM" : "GROUP",
  paymentProvider: i % 3 === 0 ? "MANUAL" : "CLICK",
  paymentStatus: ["PENDING", "CONFIRMED", "FAILED"][i % 3],
  createdAt: new Date(2026, 0, i + 1).toLocaleDateString("uz-UZ"),
}));

const PAGE_SIZE = 10;

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = mockPayments.filter((p) => {
    const matchSearch = p.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || p.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: mockPayments.length,
    pending: mockPayments.filter(p => p.paymentStatus === "PENDING").length,
    confirmed: mockPayments.filter(p => p.paymentStatus === "CONFIRMED").length,
    failed: mockPayments.filter(p => p.paymentStatus === "FAILED").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">To'lovlar</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} ta to'lov</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Jami", value: stats.total, icon: Clock, color: "text-primary bg-primary/10" },
          { label: "Kutilmoqda", value: stats.pending, icon: Clock, color: "text-yellow-600 bg-yellow-100" },
          { label: "Tasdiqlangan", value: stats.confirmed, icon: CheckCircle, color: "text-green-600 bg-green-100" },
          { label: "Rad etilgan", value: stats.failed, icon: XCircle, color: "text-red-600 bg-red-100" },
        ].map((stat) => (
          <div key={stat.label} className="bg-background rounded-2xl border border-border p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Foydalanuvchi nomi bo'yicha..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "CONFIRMED", "FAILED"].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status === "ALL" ? "Barchasi" : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Foydalanuvchi</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Summa</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Tur</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Provider</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Holat</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Sana</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((payment, i) => (
                <tr key={payment.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {payment.userName[0]}
                      </div>
                      <span className="text-sm font-medium">{payment.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">{payment.amount} so'm</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{payment.paymentType}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${providerColors[payment.paymentProvider]}`}>
                      {payment.paymentProvider}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.paymentStatus]}`}>
                      {statusLabels[payment.paymentStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{payment.createdAt}</td>
                  <td className="px-4 py-3">
                    {payment.paymentStatus === "PENDING" && (
                      <div className="flex gap-1">
                        <button className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors">
                          Tasdiqlash
                        </button>
                        <button className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-xs font-medium hover:bg-red-200 transition-colors">
                          Rad
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
            >
              ← Oldingi
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
            >
              Keyingi →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}