"use client";

import { useQuery } from "@apollo/client/react";
import { Trophy, Clock, CheckCircle, Target } from "lucide-react";
import Link from "next/link";
import { GET_MY_RESULTS } from "@/lib/graphql/result";

const typeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary",
  SAT: "bg-blue-100 text-blue-700",
  MILLIY_SERTIFIKAT: "bg-green-100 text-green-700",
  ATTESTATSIYA: "bg-purple-100 text-purple-700",
  MAJBURIY_BLOK: "bg-orange-100 text-orange-700",
  DTM_GROUP: "bg-primary/20 text-primary",
  SAT_GROUP: "bg-blue-200 text-blue-700",
  MILLIY_GROUP: "bg-green-200 text-green-700",
  ATTESTATSIYA_GROUP: "bg-purple-200 text-purple-700",
  MAJBURIY_BLOK_GROUP: "bg-orange-200 text-orange-700",
};

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function scoreLabel(score: number) {
  if (score >= 80) return "A'lo";
  if (score >= 60) return "Yaxshi";
  return "Qoniqarli";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-500";
}

export default function ResultsPage() {
  const { data, loading } = useQuery<{ getMyResults: any[] }>(GET_MY_RESULTS);
  const results = data?.getMyResults || [];

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Natijalarim</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Natijalarim</h1>
        <p className="text-muted-foreground text-sm">{results.length} ta test ishlangan</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-16 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground mb-1">Hali natijalar yo'q</p>
          <p className="text-sm text-muted-foreground mb-5">Birinchi testingizni ishlang!</p>
          <Link href="/dashboard/tests">
            <button className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              Testlarni ko'rish →
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result: any) => (
            <Link key={result.id} href={`/dashboard/results/${result.id}`}>
              <div className="bg-background border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-3 h-full">

                {/* Test type + date */}
                <div className="flex items-center justify-between">
                  {result.testType ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[result.testType] ?? "bg-muted text-muted-foreground"}`}>
                      {result.testType.replace("_GROUP", " G").replace("_", " ")}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Test
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(result.createdAt).toLocaleDateString("uz-UZ")}
                  </span>
                </div>

                {/* Test title */}
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">
                  {result.testTitle ?? "Test"}
                </h3>

                {/* Score ring + percent */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
                        <circle
                          cx="22" cy="22" r="18" fill="none"
                          stroke="currentColor" strokeWidth="4"
                          strokeDasharray={`${(result.score / 100) * 113} 113`}
                          strokeLinecap="round"
                          className={scoreColor(result.score)}
                        />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${scoreColor(result.score)}`}>
                        {Math.round(result.score)}%
                      </span>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${scoreColor(result.score)}`}>
                        {scoreLabel(result.score)}
                      </p>
                      <p className="text-xs text-muted-foreground">{result.correctAnswers}/{result.totalQuestions} to'g'ri</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${scoreBg(result.score)}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {result.correctAnswers}/{result.totalQuestions}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.duration} daq
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Target className="w-3 h-3" />
                    {result.resultStatus === "COMPLETED" ? "Tugallangan" : result.resultStatus}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
