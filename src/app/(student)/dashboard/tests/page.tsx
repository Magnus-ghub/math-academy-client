"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Clock, FileQuestion, Lock, Trophy, X, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GET_TESTS } from "@/lib/graphql/test";
import { GET_LEADERBOARD, GET_MY_RESULTS } from "@/lib/graphql/result";
import PaymentModal from "@/components/PaymentModal";
import { StartTestModal } from "@/components/StartTestModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const MEDAL_EMOJI = ["🥇", "🥈", "🥉"];

function abbrev(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[1][0]}.`;
}

function scoreColor(s: number) {
  if (s >= 80) return "text-green-600";
  if (s >= 60) return "text-amber-500";
  return "text-red-500";
}

// ─── Leaderboard Modal ───────────────────────────────────────────────────────

function LeaderboardModal({
  testId,
  testTitle,
  onClose,
}: {
  testId: string;
  testTitle: string;
  onClose: () => void;
}) {
  const { data, loading } = useQuery<{ getLeaderboard: any[] }>(GET_LEADERBOARD, {
    variables: { testId },
  });
  const entries = data?.getLeaderboard ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-bold text-foreground text-sm">Top natijalar</p>
              <p className="text-xs text-muted-foreground truncate max-w-60">{testTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Hali natijalar yo'q</p>
            </div>
          ) : (
            entries.map((e: any) => (
              <div
                key={e.rank}
                className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                  e.rank <= 3 ? "bg-amber-500/5" : "hover:bg-muted/50"
                }`}
              >
                <div className="w-7 shrink-0 text-center">
                  {e.rank <= 3 ? (
                    <span className="text-lg leading-none">{MEDAL_EMOJI[e.rank - 1]}</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">{e.rank}</span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                  {e.userImage
                    ? <img src={e.userImage} alt={e.userName} className="w-full h-full object-cover" />
                    : (e.userName?.[0] ?? "U").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{e.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.correctAnswers}/{e.totalQuestions} to'g'ri · {e.duration} daq
                  </p>
                </div>
                <span className={`text-base font-black shrink-0 ${scoreColor(e.score)}`}>
                  {Math.round(e.score)}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Top 3 in card ───────────────────────────────────────────────────────────

function TestTopStudents({ testId, onViewAll }: { testId: string; onViewAll: () => void }) {
  const { data, loading } = useQuery<{ getLeaderboard: any[] }>(GET_LEADERBOARD, {
    variables: { testId },
  });
  const top3 = data?.getLeaderboard?.slice(0, 3) ?? [];

  if (loading) {
    return (
      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-muted rounded animate-pulse" />)}
      </div>
    );
  }
  if (top3.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Trophy className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Top natijalar
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onViewAll(); }}
          className="text-[10px] font-semibold text-primary hover:underline"
        >
          Barchasini ko'rish →
        </button>
      </div>
      <div className="space-y-1.5">
        {top3.map((e: any) => (
          <div key={e.rank} className="flex items-center gap-2">
            <span className="text-sm leading-none w-5 shrink-0">{MEDAL_EMOJI[e.rank - 1]}</span>
            <span className="text-xs text-foreground font-medium truncate flex-1">
              {abbrev(e.userName)}
            </span>
            <span className={`text-xs font-bold shrink-0 ${scoreColor(e.score)}`}>
              {Math.round(e.score)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── constants ───────────────────────────────────────────────────────────────

const testTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary border-primary/20",
  SAT: "bg-accent/10 text-accent border-accent/20",
  MILLIY_SERTIFIKAT: "bg-green-100/80 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
  ATTESTATSIYA: "bg-purple-100/80 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700",
};

const dtmTypeLabels: Record<string, string> = {
  MAJBURIY: "DTM Majburiy",
  ASOSIY: "DTM Asosiy",
  FULL: "Full DTM",
};

const getTestLabel = (test: any): string => {
  if (test.testType === "DTM" && test.dtmType) return dtmTypeLabels[test.dtmType] ?? "DTM";
  const labels: Record<string, string> = {
    DTM: "DTM", SAT: "SAT", MILLIY_SERTIFIKAT: "Milliy", ATTESTATSIYA: "Attestatsiya",
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudentTestsPage() {
  const [typeFilter, setTypeFilter] = useState("Barchasi");
  const [dtmFilter, setDtmFilter] = useState("");
  const [paymentTest, setPaymentTest] = useState<any>(null);
  const [startModal, setStartModal] = useState<any>(null);
  const [leaderboardModal, setLeaderboardModal] = useState<{ testId: string; testTitle: string } | null>(null);

  const router = useRouter();
  const { data, loading } = useQuery<{ getTests: any[] }>(GET_TESTS, {
    fetchPolicy: "cache-and-network",
  });
  const tests = data?.getTests || [];

  const { data: myResultsData } = useQuery<{ getMyResults: any[] }>(GET_MY_RESULTS);
  const attemptedTestIds = new Set(
    (myResultsData?.getMyResults ?? []).map((r: any) => r.testId)
  );
  const resultByTestId = new Map(
    (myResultsData?.getMyResults ?? []).map((r: any) => [r.testId, r.id])
  );

  const handleMainFilter = (key: string) => {
    setTypeFilter(key);
    setDtmFilter("");
  };

  const filtered = tests.filter((t) => {
    if (t.testAccess === "GROUP") return false;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <p>Testlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((test: any) => (
            <div
              key={test.id}
              className={`bg-background rounded-2xl border-2 p-5 flex flex-col hover:shadow-md transition-all hover:-translate-y-0.5 ${
                testTypeColors[test.testType] || "border-border"
              }`}
            >
              {/* Badges */}
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${testTypeColors[test.testType]}`}>
                  {getTestLabel(test)}
                </span>
                {test.testAccess === "PUBLIC" ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 border border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-700 px-3 py-1.5 rounded-full">
                    ✓ Bepul
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700 px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    {test.testAccess === "PREMIUM"
                      ? test.testPrice
                        ? `${test.testPrice.toLocaleString("uz-UZ")} UZS`
                        : "Premium"
                      : "Guruh"}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold mb-1.5 text-foreground">{test.testTitle}</h3>

              {/* Description — bo'sh bo'lsa ham joy band qilib turadi */}
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-8">
                {test.testDesc}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileQuestion className="w-3 h-3" />
                  {test.totalQuestions} savol
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {test.duration} daq
                </div>
                <span>{test.totalAttempts} urinish</span>
                {test.testPdfUrl && (
                  <a
                    href={`${API_BASE}${test.testPdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
                  >
                    <FileText className="w-3 h-3" />
                    PDF
                  </a>
                )}
              </div>

              {/* Top 3 leaderboard */}
              <TestTopStudents
                testId={test.id}
                onViewAll={() => setLeaderboardModal({ testId: test.id, testTitle: test.testTitle })}
              />

              {/* Spacer */}
              <div className="flex-1" />

              {/* Start button */}
              {test.testAccess === "PUBLIC" && attemptedTestIds.has(test.id) ? (
                <Link href={`/dashboard/results/${resultByTestId.get(test.id)}`}>
                  <button className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors">
                    ✓ Natijani ko'rish
                  </button>
                </Link>
              ) : test.testAccess === "PUBLIC" ? (
                <button
                  onClick={() => setStartModal(test)}
                  className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  {test.testType === "SAT" ? "Start SAT →" : "Boshlash →"}
                </button>
              ) : (
                <button
                  onClick={() => setPaymentTest(test)}
                  className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/30 transition-colors"
                >
                  {test.testAccess === "PREMIUM" ? "🔒 Premium" : "🔒 Guruh"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {startModal && (
        <StartTestModal
          test={startModal}
          onStart={() => {
            const dest = startModal.testType === "SAT" ? `/sat/${startModal.id}` : `/exam/${startModal.id}`;
            setStartModal(null);
            router.push(dest);
          }}
          onCancel={() => setStartModal(null)}
        />
      )}
      {paymentTest && (
        <PaymentModal test={paymentTest} onClose={() => setPaymentTest(null)} />
      )}
      {leaderboardModal && (
        <LeaderboardModal
          testId={leaderboardModal.testId}
          testTitle={leaderboardModal.testTitle}
          onClose={() => setLeaderboardModal(null)}
        />
      )}
    </div>
  );
}
