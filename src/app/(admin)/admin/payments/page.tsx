"use client";

import { useState } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import {
  Search, CheckCircle, XCircle, Clock, Bell, MessageCircle, ImageIcon, Wallet,
  TrendingUp, Coins, Percent, Users, Hourglass, Award, Ban,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  GET_ALL_PAYMENTS,
  GET_PAYMENT_STATS,
  CONFIRM_MANUAL_PAYMENT,
  REJECT_MANUAL_PAYMENT,
  PAYMENT_REPORTED_SUBSCRIPTION,
} from "@/lib/graphql/payment";
import { toast } from "sonner";

interface PaymentStats {
  netRevenue: number;
  totalTopupConfirmed: number;
  totalClickCommission: number;
  outstandingBalance: number;
  uniquePayingUsers: number;
  pendingCount: number;
  avgConfirmHours?: number;
  providerBreakdown: { provider: string; count: number; amount: number }[];
  dailyRevenue: { date: string; amount: number }[];
  topTests: { testId: string; testTitle: string; count: number; revenue: number }[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda",
  CONFIRMED: "Tasdiqlangan",
  FAILED: "Rad etilgan",
  CANCELLED: "Talaba bekor qildi",
};

const providerColors: Record<string, string> = {
  CLICK: "bg-blue-100 text-blue-700",
  MANUAL: "bg-gray-100 text-gray-700",
  BALANCE: "bg-purple-100 text-purple-700",
};

const typeLabels: Record<string, string> = {
  PREMIUM: "Test",
  GROUP: "Guruh",
  TOPUP: "Balans to'ldirish",
  ADJUSTMENT: "Admin tuzatishi",
};

const PAGE_SIZE = 10;

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [amountDrafts, setAmountDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const { data, loading, refetch } = useQuery<{ getAllPayments: any[] }>(GET_ALL_PAYMENTS, {
    fetchPolicy: "cache-and-network",
  });
  const payments = data?.getAllPayments || [];

  const { data: statsData, loading: statsLoading } = useQuery<{
    getPaymentStats: PaymentStats;
  }>(GET_PAYMENT_STATS, { fetchPolicy: "cache-and-network" });
  const stats = statsData?.getPaymentStats;

  useSubscription(PAYMENT_REPORTED_SUBSCRIPTION, {
    onData: ({ client }) => {
      toast("Yangi to'lov so'rovi keldi!", {
        icon: <Bell className="w-4 h-4 text-amber-500" />,
        duration: 5000,
      });
      client.refetchQueries({ include: [GET_ALL_PAYMENTS] });
    },
  });

  const [confirmPayment] = useMutation(CONFIRM_MANUAL_PAYMENT, {
    onCompleted: () => {
      refetch();
      toast.success("To'lov tasdiqlandi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const [rejectPayment] = useMutation(REJECT_MANUAL_PAYMENT, {
    onCompleted: () => {
      refetch();
      toast.success("To'lov rad etildi");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const handleConfirm = (payment: any) => {
    const draft = amountDrafts[payment.id];
    const confirmedAmount = draft !== undefined && draft !== "" ? Number(draft) : payment.amount;
    confirmPayment({
      variables: {
        paymentId: payment.id,
        confirmedAmount,
        adminReply: replyDrafts[payment.id] || undefined,
      },
    });
  };

  const handleReject = (payment: any) => {
    rejectPayment({
      variables: { paymentId: payment.id, adminReply: replyDrafts[payment.id] || undefined },
    });
  };

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.userId?.toLowerCase().includes(q) ||
      p.testTitle?.toLowerCase().includes(q) ||
      p.userName?.toLowerCase().includes(q) ||
      p.userLastName?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || p.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusCounts = {
    total: payments.length,
    pending: payments.filter((p) => p.paymentStatus === "PENDING").length,
    confirmed: payments.filter((p) => p.paymentStatus === "CONFIRMED").length,
    failed: payments.filter((p) => p.paymentStatus === "FAILED").length,
    cancelled: payments.filter((p) => p.paymentStatus === "CANCELLED").length,
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">To'lovlar</h1>
          <p className="text-muted-foreground text-sm">{payments.length} ta to'lov</p>
        </div>
      </div>

      {/* Revenue */}
      <div className="rounded-2xl bg-linear-to-br from-primary via-primary to-indigo-950 p-5 mb-4 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs">Sof daromad (test/guruh xaridlari, balans to'ldirish kirmaydi)</p>
            {statsLoading ? (
              <div className="h-8 w-40 bg-white/20 rounded-lg animate-pulse mt-1" />
            ) : (
              <p className="text-white font-black text-2xl tracking-tight">
                {(stats?.netRevenue ?? 0).toLocaleString("uz-UZ")} so'm
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Business metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "To'ldirilgan balans",
            value: stats ? `${stats.totalTopupConfirmed.toLocaleString("uz-UZ")} so'm` : null,
            icon: TrendingUp,
            color: "text-primary bg-primary/10",
          },
          {
            label: "Ishlatilmagan balans",
            value: stats ? `${stats.outstandingBalance.toLocaleString("uz-UZ")} so'm` : null,
            icon: Coins,
            color: "text-amber-600 bg-amber-100",
          },
          {
            label: "Click komissiyasi",
            value: stats ? `${stats.totalClickCommission.toLocaleString("uz-UZ")} so'm` : null,
            icon: Percent,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "To'lov qilgan talabalar",
            value: stats ? String(stats.uniquePayingUsers) : null,
            icon: Users,
            color: "text-purple-600 bg-purple-100",
          },
        ].map((m) => (
          <div key={m.label} className="bg-background rounded-2xl border border-border p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${m.color}`}>
              <m.icon className="w-4 h-4" />
            </div>
            {m.value === null ? (
              <div className="h-6 w-16 bg-muted rounded animate-pulse mb-1" />
            ) : (
              <p className="text-lg font-bold leading-tight">{m.value}</p>
            )}
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
        {[
          { label: "Jami", value: statusCounts.total, icon: Clock, color: "text-primary bg-primary/10" },
          { label: "Kutilmoqda", value: statusCounts.pending, icon: Clock, color: "text-yellow-600 bg-yellow-100" },
          { label: "Tasdiqlangan", value: statusCounts.confirmed, icon: CheckCircle, color: "text-green-600 bg-green-100" },
          { label: "Rad etilgan", value: statusCounts.failed, icon: XCircle, color: "text-red-600 bg-red-100" },
          { label: "Bekor qilingan", value: statusCounts.cancelled, icon: Ban, color: "text-gray-500 bg-gray-100" },
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

      {!statsLoading && stats && stats.pendingCount > 0 && stats.avgConfirmHours != null && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 px-1">
          <Hourglass className="w-3.5 h-3.5" />
          O'rtacha tasdiqlash vaqti: <span className="font-semibold text-foreground">
            {stats.avgConfirmHours < 1
              ? `${Math.round(stats.avgConfirmHours * 60)} daqiqa`
              : `${stats.avgConfirmHours.toFixed(1)} soat`}
          </span>
        </div>
      )}

      {/* Daily revenue trend + breakdown */}
      {stats && (stats.dailyRevenue.some((d) => d.amount > 0) || stats.providerBreakdown.length > 0 || stats.topTests.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Daily revenue bar chart */}
          <div className="bg-background rounded-2xl border border-border p-5">
            <p className="text-sm font-semibold mb-4">Oxirgi 14 kunlik daromad</p>
            <div className="flex items-end gap-1.5 h-32">
              {(() => {
                const max = Math.max(...stats.dailyRevenue.map((d) => d.amount), 1);
                return stats.dailyRevenue.map((d) => {
                  const [, m, day] = d.date.split("-");
                  const heightPct = Math.max((d.amount / max) * 100, d.amount > 0 ? 6 : 2);
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 group">
                      <div
                        title={`${day}.${m}: ${d.amount.toLocaleString("uz-UZ")} so'm`}
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-md transition-colors ${
                          d.amount > 0 ? "bg-primary group-hover:bg-primary/80" : "bg-muted"
                        }`}
                      />
                      <span className="text-[9px] text-muted-foreground shrink-0">{day}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <div className="space-y-4">
            {/* Provider breakdown */}
            {stats.providerBreakdown.length > 0 && (
              <div className="bg-background rounded-2xl border border-border p-5">
                <p className="text-sm font-semibold mb-3">Balans qanday to'ldirilmoqda</p>
                <div className="space-y-2.5">
                  {(() => {
                    const total = stats.providerBreakdown.reduce((s, p) => s + p.amount, 0) || 1;
                    const dotColor: Record<string, string> = { CLICK: "bg-blue-500", MANUAL: "bg-gray-500" };
                    return stats.providerBreakdown.map((p) => {
                      const pct = Math.round((p.amount / total) * 100);
                      return (
                        <div key={p.provider}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="flex items-center gap-1.5 font-medium">
                              <span className={`w-2 h-2 rounded-full ${dotColor[p.provider] ?? "bg-purple-500"}`} />
                              {p.provider === "CLICK" ? "Click" : "Qo'lda"} ({p.count})
                            </span>
                            <span className="text-muted-foreground">{pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${dotColor[p.provider] ?? "bg-purple-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Top tests */}
            {stats.topTests.length > 0 && (
              <div className="bg-background rounded-2xl border border-border p-5">
                <p className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  Eng ko'p sotilgan testlar
                </p>
                <div className="space-y-2">
                  {stats.topTests.map((t, i) => (
                    <div key={t.testId} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-muted-foreground font-semibold shrink-0">{i + 1}</span>
                      <span className="flex-1 truncate">{t.testTitle}</span>
                      <span className="text-muted-foreground shrink-0">{t.count}x</span>
                      <span className="font-semibold shrink-0">{t.revenue.toLocaleString("uz-UZ")} so'm</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ism, ID yoki test nomi bo'yicha..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "CONFIRMED", "FAILED", "CANCELLED"].map((status) => (
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

      {/* Cards */}
      {paginated.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <p>To'lovlar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((payment: any) => {
            const isReviewable = payment.paymentStatus === "PENDING" && payment.paymentProvider === "MANUAL";
            return (
              <div key={payment.id} className="bg-background rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {(payment.userName?.[0] ?? "?").toUpperCase()}
                    </div>
                    <span className="text-sm font-medium truncate">
                      {[payment.userName, payment.userLastName].filter(Boolean).join(" ") || "Noma'lum talaba"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(payment.createdAt).toLocaleDateString("uz-UZ")}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[payment.paymentStatus]}`}>
                    {statusLabels[payment.paymentStatus]}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${providerColors[payment.paymentProvider]}`}>
                    {payment.paymentProvider}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {typeLabels[payment.paymentType] ?? payment.paymentType}
                  </span>
                </div>

                <p className="font-semibold text-sm mb-1">
                  {payment.testTitle ||
                    (payment.paymentType === "GROUP"
                      ? "Guruh a'zoligi"
                      : payment.paymentType === "TOPUP"
                        ? "Balans to'ldirish"
                        : "To'lov")}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {payment.paymentStatus === "CONFIRMED" ? "Qabul qilingan summa" : "So'ralgan summa"}:{" "}
                  <span className="font-semibold text-foreground">{payment.amount?.toLocaleString("uz-UZ")} so'm</span>
                  {!!payment.platformFee && (
                    <span className="text-xs text-muted-foreground">
                      {" "}(Click komissiyasi: {payment.platformFee.toLocaleString("uz-UZ")} so'm, sof:{" "}
                      {(payment.amount - payment.platformFee).toLocaleString("uz-UZ")} so'm)
                    </span>
                  )}
                </p>

                {payment.studentNote && (
                  <p className="text-xs text-muted-foreground mb-2">💭 {payment.studentNote}</p>
                )}

                {payment.receiptUrl && (
                  <a
                    href={`${API_BASE}${payment.receiptUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Chekni ko'rish
                  </a>
                )}

                {isReviewable && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground shrink-0">Qabul qilingan summa:</label>
                      <input
                        type="number"
                        placeholder={String(payment.amount)}
                        value={amountDrafts[payment.id] ?? ""}
                        onChange={(e) => setAmountDrafts((d) => ({ ...d, [payment.id]: e.target.value }))}
                        className="w-32 border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-xs text-muted-foreground">so'm</span>
                    </div>
                    <textarea
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={2}
                      placeholder="Izoh (ixtiyoriy) — talabaga Telegram orqali yuboriladi..."
                      value={replyDrafts[payment.id] ?? ""}
                      onChange={(e) => setReplyDrafts((d) => ({ ...d, [payment.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConfirm(payment)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => handleReject(payment)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rad etish
                      </button>
                    </div>
                  </div>
                )}

                {payment.adminReply && !isReviewable && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">Admin javobi</p>
                      <p className="text-sm">{payment.adminReply}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-1 py-4">
          <p className="text-xs text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
            >
              ← Oldingi
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
            >
              Keyingi →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
