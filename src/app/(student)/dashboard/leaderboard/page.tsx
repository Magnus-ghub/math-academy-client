"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Trophy, Clock, Medal, Flame } from "lucide-react";
import { GET_PUBLIC_TESTS } from "@/lib/graphql/test";
import { GET_LEADERBOARD, GET_TOP_STUDENTS } from "@/lib/graphql/result";
import { useAuthStore } from "@/lib/store/auth.store";

type Period = "WEEK" | "MONTH";

interface TopStudent {
  rank: number;
  userId: string;
  userName: string;
  userImage?: string | null;
  avgScore: number;
  totalTests: number;
}

const MEDAL_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];

function TopStudentsBoard({ period }: { period: Period }) {
  const { data, loading } = useQuery<{ getTopStudents: TopStudent[] }>(GET_TOP_STUDENTS, {
    variables: { period },
  });
  const { user } = useAuthStore();
  const students = data?.getTopStudents ?? [];

  if (loading) return <div className="bg-muted rounded-2xl h-56 animate-pulse" />;

  if (students.length === 0) {
    return (
      <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
        <Flame className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-medium">Hali natijalar yo'q</p>
        <p className="text-sm mt-1">
          {period === "WEEK" ? "Bu hafta" : "Bu oy"} hech kim test topshirmagan
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-2xl border border-border overflow-hidden">
      {students.map((s) => {
        const isMe = s.userId === user?.id;
        return (
          <div
            key={s.userId}
            className={`flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0 ${
              isMe ? "bg-primary/5" : "hover:bg-muted/20"
            } transition-colors`}
          >
            {/* Rank */}
            <div className="w-7 text-center shrink-0">
              {s.rank <= 3 ? (
                <Medal className={`w-5 h-5 mx-auto ${MEDAL_COLORS[s.rank - 1]}`} />
              ) : (
                <span className="text-sm font-bold text-muted-foreground">{s.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
              {s.userImage ? (
                <img src={s.userImage} alt={s.userName} className="w-full h-full object-cover" />
              ) : (
                (s.userName?.[0] ?? "U").toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {s.userName}
                {isMe && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Siz</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{s.totalTests} ta test</p>
            </div>

            {/* Score */}
            <span className="text-base font-black text-primary shrink-0">{s.avgScore.toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

function TestLeaderboardList({ testId }: { testId: string }) {
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
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
            {entry.userImage ? (
              <img src={entry.userImage} alt={entry.userName} className="w-full h-full object-cover" />
            ) : (
              (entry.userName?.[0] ?? "U").toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {entry.userName}
              {entry.userId === user?.id && (
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Siz
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {entry.duration} daqiqa · {entry.correctAnswers}/{entry.totalQuestions} to'g'ri
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

type Tab = "WEEK" | "MONTH" | "TEST";

const TABS: { key: Tab; label: string }[] = [
  { key: "WEEK", label: "Haftalik" },
  { key: "MONTH", label: "Oylik" },
  { key: "TEST", label: "Test bo'yicha" },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("WEEK");
  const { data, loading } = useQuery<{ getPublicTests: any[] }>(GET_PUBLIC_TESTS, { skip: tab !== "TEST" });
  const tests = data?.getPublicTests || [];
  const [selectedTest, setSelectedTest] = useState<string>("");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reyting</h1>
        <p className="text-muted-foreground text-sm">Eng yaxshi natijalarga erishgan o'quvchilar</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "WEEK" && <TopStudentsBoard period="WEEK" />}
      {tab === "MONTH" && <TopStudentsBoard period="MONTH" />}

      {tab === "TEST" && (
        <>
          <div className="mb-6">
            {loading ? (
              <div className="w-full sm:w-80 h-10.5 bg-muted rounded-xl animate-pulse" />
            ) : (
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
            )}
          </div>

          {selectedTest ? (
            <TestLeaderboardList testId={selectedTest} />
          ) : (
            <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Test tanlang</p>
              <p className="text-sm mt-1">Reyting ko'rish uchun yuqoridan test tanlang</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
