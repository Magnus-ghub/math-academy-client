"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import {
  CreditCard, Users as UsersIcon, Clock, CheckCircle2, XCircle, MessageCircle, ImageIcon, Ban,
} from "lucide-react";
import { GET_MY_PAYMENTS, CANCEL_MY_PENDING_PAYMENT } from "@/lib/graphql/payment";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const statusStyles: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  PENDING: { label: "Kutilmoqda", className: "bg-yellow-100 text-yellow-700", icon: Clock },
  CONFIRMED: { label: "Tasdiqlangan", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  FAILED: { label: "Rad etilgan", className: "bg-red-100 text-red-600", icon: XCircle },
  CANCELLED: { label: "Bekor qilingan", className: "bg-gray-100 text-gray-500", icon: Ban },
};

const providerLabels: Record<string, string> = {
  CLICK: "Click",
  MANUAL: "Qo'lda (admin)",
};

const typeLabels: Record<string, string> = {
  GROUP: "Guruh a'zoligi",
  TOPUP: "Balans to'ldirish",
  ADJUSTMENT: "Balans tuzatildi",
};

export default function PaymentsHistoryPage() {
  const { data, loading, refetch } = useQuery<{ getMyPayments: any[] }>(GET_MY_PAYMENTS, {
    fetchPolicy: "cache-and-network",
  });
  const payments = data?.getMyPayments ?? [];

  const [cancelPayment, { loading: cancelling }] = useMutation(CANCEL_MY_PENDING_PAYMENT, {
    onCompleted: () => {
      refetch();
      toast.success("So'rov bekor qilindi");
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">To'lovlarim</h1>
        <p className="text-muted-foreground text-sm">Barcha to'lovlaringiz tarixi</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p>Hali to'lovlar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p: any) => {
            const status = statusStyles[p.paymentStatus] ?? statusStyles.PENDING;
            const StatusIcon = status.icon;
            return (
              <div key={p.id} className="bg-background rounded-2xl border border-border p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {p.paymentType === "GROUP" ? (
                      <UsersIcon className="w-5 h-5 text-primary" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {p.testTitle || typeLabels[p.paymentType] || "To'lov"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {providerLabels[p.paymentProvider] ?? p.paymentProvider} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString("uz-UZ")}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{p.amount?.toLocaleString("uz-UZ")} so'm</p>
                    <span
                      className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.className}`}
                    >
                      <StatusIcon className="w-2.5 h-2.5" />
                      {status.label}
                    </span>
                  </div>
                </div>

                {(p.studentNote || p.receiptUrl) && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
                    {p.studentNote && (
                      <p className="text-xs text-muted-foreground flex-1 min-w-40">💭 {p.studentNote}</p>
                    )}
                    {p.receiptUrl && (
                      <a
                        href={`${API_BASE}${p.receiptUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors shrink-0"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Yuborilgan chek
                      </a>
                    )}
                  </div>
                )}

                {p.adminReply && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-start gap-2">
                    <MessageCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">Admin javobi</p>
                      <p className="text-sm">{p.adminReply}</p>
                    </div>
                  </div>
                )}

                {p.paymentStatus === "PENDING" && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <button
                      onClick={() => cancelPayment({ variables: { paymentId: p.id } })}
                      disabled={cancelling}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-60 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      So'rovni bekor qilish
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
