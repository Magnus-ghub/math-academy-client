"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Clock, FileQuestion, Lock } from "lucide-react";
import Link from "next/link";
import { GET_PUBLIC_TESTS } from "@/lib/graphql/test";

const testTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary border-primary/20",
  SAT: "bg-accent/10 text-accent border-accent/20",
  MILLIY_SERTIFIKAT: "bg-green-50 text-green-700 border-green-200",
  ATTESTATSIYA: "bg-purple-50 text-purple-700 border-purple-200",
};

const dtmTypeLabels: Record<string, string> = {
  MAJBURIY: "DTM Majburiy",
  ASOSIY: "DTM Asosiy",
  FULL: "Full DTM",
};

const getTestLabel = (test: any): string => {
  if (test.testType === "DTM" && test.dtmType) return dtmTypeLabels[test.dtmType] ?? "DTM";
  const labels: Record<string, string> = {
    DTM: "DTM",
    SAT: "SAT",
    MILLIY_SERTIFIKAT: "Milliy",
    ATTESTATSIYA: "Attestatsiya",
  };
  return labels[test.testType] ?? test.testType;
};

const mainTypes = [
  { key: "Barchasi", label: "Barchasi" },
  { key: "MILLIY_SERTIFIKAT", label: "Milliy" },
  { key: "ATTESTATSIYA", label: "Attestatsiya" },
  { key: "SAT", label: "SAT" },
  { key: "DTM", label: "DTM" },
];

const dtmSubTypes = [
  { key: "", label: "Barchasi" },
  { key: "MAJBURIY", label: "Majburiy blok" },
  { key: "ASOSIY", label: "Asosiy blok" },
  { key: "FULL", label: "Full DTM" },
];

export default function StudentTestsPage() {
  const [typeFilter, setTypeFilter] = useState("Barchasi");
  const [dtmFilter, setDtmFilter] = useState("");

  const { data, loading } = useQuery<{ getPublicTests: any[] }>(GET_PUBLIC_TESTS);
  const tests = data?.getPublicTests || [];

  const handleMainFilter = (key: string) => {
    setTypeFilter(key);
    setDtmFilter("");
  };

  const filtered = tests.filter((t) => {
    const matchType = typeFilter === "Barchasi" || t.testType === typeFilter;
    const matchDtm = typeFilter !== "DTM" || !dtmFilter || t.dtmType === dtmFilter;
    return matchType && matchDtm;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Testlar</h1>
        <p className="text-muted-foreground text-sm">Imtihon turiga qarab test tanlang</p>
      </div>

      {/* Main filter */}
      <div className="flex gap-2 flex-wrap mb-3">
        {mainTypes.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleMainFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              typeFilter === key
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* DTM sub-filter */}
      {typeFilter === "DTM" && (
        <div className="flex gap-2 flex-wrap mb-5 pl-1">
          {dtmSubTypes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDtmFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                dtmFilter === key
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {!typeFilter.startsWith("DTM") && <div className="mb-6" />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <p>Testlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((test: any) => (
            <div
              key={test.id}
              className={`bg-background rounded-2xl border-2 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 ${testTypeColors[test.testType] || "border-border"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${testTypeColors[test.testType]}`}>
                  {getTestLabel(test)}
                </span>
                {test.testAccess !== "PUBLIC" && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    {test.testAccess === "PREMIUM" ? "Premium" : "Guruh"}
                  </div>
                )}
              </div>

              <h3 className="font-bold mb-3 text-foreground">{test.testTitle}</h3>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <FileQuestion className="w-3 h-3" />
                  {test.totalQuestions} savol
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {test.duration} daq
                </div>
                <span>{test.totalAttempts} urinish</span>
              </div>

              <Link href={test.testAccess === "PUBLIC" ? `/exam/${test.id}` : "#"}>
                <button className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  test.testAccess === "PUBLIC"
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}>
                  {test.testAccess === "PUBLIC" ? "Boshlash →" : "🔒 Kirish kerak"}
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
