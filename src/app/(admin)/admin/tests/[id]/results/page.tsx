"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { ChevronLeft, FileSpreadsheet, FileText } from "lucide-react";
import { GET_ALL_RESULTS_FOR_TEST } from "@/lib/graphql/result";
import { exportResultsToExcel, exportResultsToPdf } from "@/lib/export/resultExport";

const statusColors: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ABANDONED: "bg-gray-100 text-gray-600",
  TIME_UP: "bg-orange-100 text-orange-700",
};

const statusLabels: Record<string, string> = {
  COMPLETED: "Yakunlangan",
  IN_PROGRESS: "Jarayonda",
  ABANDONED: "Tashlab ketilgan",
  TIME_UP: "Vaqt tugadi",
};

export default function AdminTestResultsPage() {
  const { id } = useParams<{ id: string }>();

  const { data, loading } = useQuery<{ getAllResultsForTest: any[] }>(GET_ALL_RESULTS_FOR_TEST, {
    variables: { testId: id },
  });

  const results = data?.getAllResultsForTest || [];
  const testTitle = results[0]?.testTitle ?? "Test";

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/tests"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 w-fit"
      >
        <ChevronLeft className="w-4 h-4" /> Testlarga qaytish
      </Link>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{testTitle} — Natijalar</h1>
          <p className="text-muted-foreground text-sm">{results.length} ta urinish</p>
        </div>
        <div className="flex gap-2">
          <button
            disabled={results.length === 0}
            onClick={() => exportResultsToExcel(results, testTitle)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-40"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel yuklab olish
          </button>
          <button
            disabled={results.length === 0}
            onClick={() => exportResultsToPdf(results, testTitle)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            <FileText className="w-4 h-4" /> PDF yuklab olish
          </button>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Talaba</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Telefon</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Holat</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Ball</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">To&apos;g&apos;ri javob</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Davomiylik</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Sana</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Hali hech kim bu testni topshirmagan
                  </td>
                </tr>
              ) : (
                results.map((r: any, i: number) => (
                  <tr
                    key={r.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
                      i % 2 === 0 ? "" : "bg-muted/10"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {r.userName?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{r.userName || "—"}</p>
                          {r.userLastName && (
                            <p className="text-xs text-muted-foreground">{r.userLastName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{r.userPhone || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[r.resultStatus] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabels[r.resultStatus] ?? r.resultStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{Number(r.score).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {r.correctAnswers}/{r.totalQuestions}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.duration} daq</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.finishedAt ?? r.createdAt).toLocaleDateString("uz-UZ")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
