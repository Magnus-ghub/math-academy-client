"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Trophy, Clock, Medal } from "lucide-react";
import { GET_PUBLIC_TESTS } from "@/lib/graphql/test";
import { GET_LEADERBOARD } from "@/lib/graphql/result";
import { useAuthStore } from "@/lib/store/auth.store";

function LeaderboardList({ testId }: { testId: string }) {
  const { data, loading } = useQuery<{ getLeaderboard: any[] }>(GET_LEADERBOARD, {
    variables: { testId },
  });
  const { user } = useAuthStore();
  const entries = data?.getLeaderboard || [];

  if (loading) return <div className="bg-muted rounded-2xl h-48 animate-pulse" />;

  if (entries.length === 0) {
    return (
      <div className="bg-background rounded-2xl border border-border p-8 text-center text-muted-foreground">
        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Hali natijalar yo'q</p>
      </div>
    );
  }

  const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

  return (
    <div className="bg-background rounded-2xl border border-border overflow-hidden">
      {entries.map((entry: any, i: number) => (
        <div
          key={entry.id}
          className={`flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 ${
            entry.userId === user?.id ? "bg-primary/5" : "hover:bg-muted/20"
          } transition-colors`}
        >
          {/* Rank */}
          <div className="w-8 text-center">
            {i < 3 ? (
              <Medal className={`w-5 h-5 mx-auto ${medalColors[i]}`} />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
            )}
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {entry.userId?.[0]?.toUpperCase() || "U"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {entry.userId === user?.id ? "Siz" : `Foydalanuvchi`}
              {entry.userId === user?.id && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Siz
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {entry.duration} daqiqa
            </div>
          </div>

          {/* Score */}
          <div className={`text-xl font-black ${
            entry.score >= 80 ? "text-green-600" :
            entry.score >= 60 ? "text-accent" : "text-red-500"
          }`}>
            {Math.round(entry.score)}%
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const { data, loading } = useQuery<{ getPublicTests: any[] }>(GET_PUBLIC_TESTS);
  const tests = data?.getPublicTests || [];
  const [selectedTest, setSelectedTest] = useState<string>("");

  if (loading) {
    return <div className="bg-muted rounded-2xl h-48 animate-pulse" />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reyting 🏆</h1>
        <p className="text-muted-foreground text-sm">Test bo'yicha eng yaxshi natijalar</p>
      </div>

      {/* Test tanlash */}
      <div className="mb-6">
        <select
          className="w-full sm:w-80 border border-border rounded-xl px-3 py-2.5 text-sm bg-background"
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value)}
        >
          <option value="">Test tanlang...</option>
          {tests.map((test: any) => (
            <option key={test.id} value={test.id}>
              {test.testTitle}
            </option>
          ))}
        </select>
      </div>

      {selectedTest ? (
        <LeaderboardList testId={selectedTest} />
      ) : (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Test tanlang</p>
          <p className="text-sm mt-1">Reyting ko'rish uchun yuqoridan test tanlang</p>
        </div>
      )}
    </div>
  );
}