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
  DTM_GROUP: "bg-primary/20 text-primary border-primary/30",
  SAT_GROUP: "bg-accent/20 text-accent border-accent/30",
  MILLIY_GROUP: "bg-green-100 text-green-700 border-green-300",
  ATTESTATSIYA_GROUP: "bg-purple-100 text-purple-700 border-purple-300",
};

const types = ["Barchasi", "DTM", "SAT", "MILLIY_SERTIFIKAT", "ATTESTATSIYA"];

export default function StudentTestsPage() {
  const [typeFilter, setTypeFilter] = useState("Barchasi");

  const { data, loading } = useQuery<{ getPublicTests: any[] }>(GET_PUBLIC_TESTS);
  const tests = data?.getPublicTests || [];

  const filtered = typeFilter === "Barchasi"
    ? tests
    : tests.filter((t) => t.testType === typeFilter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Testlar</h1>
        <p className="text-muted-foreground text-sm">Imtihon turiga qarab test tanlang</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              typeFilter === type
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {type === "MILLIY_SERTIFIKAT" ? "Milliy" : type}
          </button>
        ))}
      </div>

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
                  {test.testType.replace("_GROUP", " Guruh").replace("_", " ")}
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

              <Link href={`/dashboard/tests/${test.id}`}>
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