"use client";

import { useState } from "react";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { Search, CheckCircle, XCircle, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  GET_PENDING_REPORTS,
  RESOLVE_REPORT,
  REJECT_REPORT,
  REPORT_CREATED_SUBSCRIPTION,
} from "@/lib/graphql/report";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda",
  REVIEWED: "Ko'rib chiqilmoqda",
  RESOLVED: "Hal qilindi",
  REJECTED: "Rad etildi",
};

const reasonLabels: Record<string, string> = {
  WRONG_ANSWER: "Noto'g'ri javob",
  WRONG_QUESTION: "Noto'g'ri savol",
  TYPO: "Imlo xatosi",
  UNCLEAR: "Tushunarsiz",
  RETAKE_REQUEST: "Qayta topshirish so'rovi",
  OTHER: "Boshqa",
};

export default function AdminReportsPage() {
  const [search, setSearch] = useState("");

  const { data, loading, refetch } = useQuery<{ getPendingReports: any[] }>(
    GET_PENDING_REPORTS,
    { fetchPolicy: "cache-and-network" }
  );

  useSubscription(REPORT_CREATED_SUBSCRIPTION, {
    onData: ({ client }) => {
      toast("Yangi e'tiroz keldi!", {
        icon: <Bell className="w-4 h-4 text-amber-500" />,
        duration: 5000,
      });
      client.refetchQueries({ include: [GET_PENDING_REPORTS] });
    },
  });
  const reports = data?.getPendingReports || [];

  const [resolveReport] = useMutation(RESOLVE_REPORT, {
    onCompleted: () => {
      toast.success("Report hal qilindi");
      refetch();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const [rejectReport] = useMutation(REJECT_REPORT, {
    onCompleted: () => {
      toast.success("Report rad etildi");
      refetch();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.reportText?.toLowerCase().includes(q) ||
      r.reportReason?.toLowerCase().includes(q) ||
      r.testTitle?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reportlar</h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} ta kutilmoqda
          </p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Report bo'yicha qidirish..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <p>Kutilayotgan reportlar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((report: any) => (
            <div
              key={report.id}
              className="bg-background rounded-2xl border border-border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">
                      R
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(report.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[report.reportStatus]}`}>
                      {statusLabels[report.reportStatus]}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {reasonLabels[report.reportReason]}
                    </span>
                  </div>
                  {report.reportText && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {report.reportText}
                    </p>
                  )}
                  {report.reportReason === "RETAKE_REQUEST" && (
                    <p className="text-xs text-amber-600 mb-2">
                      "Hal qilindi" bosilsa, talabaning avvalgi urinishi o'chiriladi va u testni darhol qayta topshira oladi.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {report.testTitle && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                        Test: {report.testTitle}
                      </span>
                    )}
                    {report.questionOrder != null && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">
                        {report.questionOrder}-savol
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => resolveReport({ variables: { reportId: report.id } })}
                    className="p-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    title="Hal qilindi"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rejectReport({ variables: { reportId: report.id } })}
                    className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Rad etish"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}