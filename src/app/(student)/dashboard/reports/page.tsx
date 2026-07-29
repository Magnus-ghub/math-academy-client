"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Flag, MessageCircle } from "lucide-react";
import { GET_MY_REPORTS, MARK_REPORTS_SEEN } from "@/lib/graphql/report";

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

export default function MyReportsPage() {
  const { data, loading } = useQuery<{ getMyReports: any[] }>(GET_MY_REPORTS, {
    fetchPolicy: "cache-and-network",
  });
  const reports = data?.getMyReports || [];

  const [markReportsSeen] = useMutation(MARK_REPORTS_SEEN);
  useEffect(() => {
    markReportsSeen();
  }, [markReportsSeen]);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Mening e'tirozlarim</h1>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mening e'tirozlarim</h1>
        <p className="text-muted-foreground text-sm">
          Testlarda yuborgan e'tirozlaringiz va admin javoblari
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <Flag className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>Hali e'tiroz yubormagansiz</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report: any) => (
            <div
              key={report.id}
              className="bg-background rounded-2xl border border-border p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[report.reportStatus]}`}>
                  {statusLabels[report.reportStatus]}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {reasonLabels[report.reportReason]}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(report.createdAt).toLocaleDateString("uz-UZ")}
                </span>
              </div>

              {report.reportText && (
                <p className="text-sm text-muted-foreground mb-2">{report.reportText}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-1">
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

              {report.adminReply && (
                <div className="mt-3 pt-3 border-t border-border/50 flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">Admin javobi</p>
                    <p className="text-sm">{report.adminReply}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
