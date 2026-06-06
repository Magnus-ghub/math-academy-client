"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  OTHER: "Boshqa",
};

const mockReports = Array.from({ length: 12 }, (_, i) => ({
  id: `report-${i + 1}`,
  userName: `Foydalanuvchi ${i + 1}`,
  reportReason: Object.keys(reasonLabels)[i % 5],
  reportStatus: ["PENDING", "REVIEWED", "RESOLVED", "REJECTED"][i % 4],
  reportText: `Savol ${i + 1} da xato bor deb o'ylayman.`,
  testId: `test-${i % 5 + 1}`,
  questionId: `question-${i + 1}`,
  createdAt: new Date(2026, 0, i + 1).toLocaleDateString("uz-UZ"),
}));

export default function AdminReportsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const filtered = mockReports.filter((r) => {
    const matchSearch = r.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.reportStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reportlar</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} ta report</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Foydalanuvchi bo'yicha..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "REVIEWED", "RESOLVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
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

      {/* List */}
      <div className="space-y-3">
        {filtered.map((report) => (
          <div key={report.id} className="bg-background rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">
                    {report.userName[0]}
                  </div>
                  <span className="font-medium text-sm">{report.userName}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{report.createdAt}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[report.reportStatus]}`}>
                    {statusLabels[report.reportStatus]}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {reasonLabels[report.reportReason]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{report.reportText}</p>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Test: {report.testId}</span>
                  <span>Savol: {report.questionId}</span>
                </div>
              </div>
              {report.reportStatus === "PENDING" && (
                <div className="flex gap-2 shrink-0">
                  <button className="p-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}