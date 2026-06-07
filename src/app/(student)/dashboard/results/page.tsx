"use client";

import { useQuery } from "@apollo/client/react";
import { Trophy, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { GET_MY_RESULTS } from "@/lib/graphql/result";

export default function ResultsPage() {
  const { data, loading } = useQuery<{ getMyResults: any[] }>(GET_MY_RESULTS);
  const results = data?.getMyResults || [];

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Natijalarim</h1>
        <p className="text-muted-foreground text-sm">
          {results.length} ta test ishlangan
        </p>
      </div>

      {results.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Hali natijalar yo'q</p>
          <Link href="/dashboard/tests">
            <button className="mt-4 bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              Testni boshlash
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result: any) => (
            <Link key={result.id} href={`/dashboard/results/${result.id}`}>
              <div className="bg-background rounded-2xl border border-border p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {result.testId}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.createdAt).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {result.correctAnswers}/{result.totalQuestions}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {result.duration} daq
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-black ${
                      result.score >= 80 ? "text-green-600" :
                      result.score >= 60 ? "text-accent" : "text-red-500"
                    }`}>
                      {Math.round(result.score)}%
                    </div>
                    <div className={`text-xs font-medium ${
                      result.score >= 80 ? "text-green-600" :
                      result.score >= 60 ? "text-accent" : "text-red-500"
                    }`}>
                      {result.score >= 80 ? "A'lo" : result.score >= 60 ? "Yaxshi" : "Qoniqarli"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      result.score >= 80 ? "bg-green-500" :
                      result.score >= 60 ? "bg-accent" : "bg-red-500"
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}