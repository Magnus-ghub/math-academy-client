"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Clock, FileQuestion, Lock, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { GET_PUBLIC_TESTS } from "@/lib/graphql/test";
import { useAuthStore } from "@/lib/store/auth.store";

const testTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary border-primary/20",
  SAT: "bg-accent/10 text-accent border-accent/20",
  MILLIY_SERTIFIKAT: "bg-green-50 text-green-700 border-green-200",
  ATTESTATSIYA: "bg-purple-50 text-purple-700 border-purple-200",
};

const types = ["Barchasi", "DTM", "SAT", "MILLIY_SERTIFIKAT", "ATTESTATSIYA"];

export default function TestsPage() {
  const [typeFilter, setTypeFilter] = useState("Barchasi");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleStart = (test: any) => {
    const dest = `/dashboard/tests/${test.id}`;
    if (isAuthenticated) {
      router.push(dest);
    } else {
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  };

  const { data, loading } = useQuery<{ getPublicTests: any[] }>(GET_PUBLIC_TESTS);
  const tests = data?.getPublicTests || [];

  const filtered = tests.filter((t) => {
    const matchType = typeFilter === "Barchasi" || t.testType === typeFilter;
    const matchSearch = t.testTitle.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Barcha testlar</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Imtihon turiga qarab test tanlang va tayyorgarlikni boshlang
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Test nomi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
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
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-8 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{filtered.length}</strong> ta test</span>
        <span><strong className="text-foreground">{filtered.filter(t => t.testAccess === "PUBLIC").length}</strong> ta bepul</span>
        <span><strong className="text-foreground">{filtered.filter(t => t.testAccess !== "PUBLIC").length}</strong> ta premium</span>
      </div>

      {/* Tests */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium">Testlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((test: any) => (
            <div
              key={test.id}
              className={`bg-background rounded-2xl border-2 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${
                testTypeColors[test.testType] || "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${testTypeColors[test.testType]}`}>
                  {test.testType.replace("_", " ")}
                </span>
                {test.testAccess !== "PUBLIC" && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    Premium
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

              <button
                onClick={() => test.testAccess === "PUBLIC" ? handleStart(test) : router.push("/login")}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  test.testAccess === "PUBLIC"
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {test.testAccess === "PUBLIC" ? "Boshlash →" : "🔒 Kirish kerak"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}