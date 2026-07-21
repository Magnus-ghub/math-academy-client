"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { Clock, FileQuestion, Lock, Search, Trophy, X, FileText, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { GET_PUBLIC_TESTS } from "@/lib/graphql/test";
import { GET_LEADERBOARD, GET_MY_RESULTS } from "@/lib/graphql/result";
import { useAuthStore } from "@/lib/store/auth.store";
import PaymentModal from "@/components/PaymentModal";
import { StartTestModal } from "@/components/StartTestModal";
import { RetakeExplainModal } from "@/components/RetakeExplainModal";
import { testTypeStyles } from "@/lib/testTypeStyles";

// ─── helpers ────────────────────────────────────────────────────────────────

const MEDAL_EMOJI = ["🥇", "🥈", "🥉"];
const MEDAL_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];

function abbrev(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[1][0]}.`;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

// ─── LeaderboardModal ────────────────────────────────────────────────────────

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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Top natijalar</p>
              <p className="text-xs text-gray-400 truncate max-w-60">{testTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Hali natijalar yo'q</p>
            </div>
          ) : (
            entries.map((e: any) => (
              <div
                key={e.rank}
                className={`flex items-center gap-3 px-5 py-3.5 ${
                  e.rank <= 3 ? "bg-amber-50/40" : "hover:bg-gray-50"
                } transition-colors`}
              >
                {/* Rank */}
                <div className="w-7 shrink-0 text-center">
                  {e.rank <= 3 ? (
                    <span className="text-lg leading-none">{MEDAL_EMOJI[e.rank - 1]}</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-400">{e.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                  {e.userImage ? (
                    <img src={e.userImage} alt={e.userName} className="w-full h-full object-cover" />
                  ) : (
                    (e.userName?.[0] ?? "U").toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{e.userName}</p>
                  <p className="text-xs text-gray-400">
                    {e.correctAnswers}/{e.totalQuestions} to'g'ri · {e.duration} daq
                  </p>
                </div>

                {/* Score */}
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

// ─── TestTopStudents (card ichida top 3) ────────────────────────────────────

function TestTopStudents({
  testId,
  onViewAll,
}: {
  testId: string;
  onViewAll: () => void;
}) {
  const { data, loading } = useQuery<{ getLeaderboard: any[] }>(GET_LEADERBOARD, {
    variables: { testId },
  });
  const top3 = data?.getLeaderboard?.slice(0, 3) ?? [];

  if (loading) {
    return (
      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (top3.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      {/* Section title */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Trophy className="w-3 h-3 text-amber-500" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Top natijalar
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewAll();
          }}
          className="text-[10px] font-semibold text-primary hover:underline"
        >
          Barchasini ko'rish →
        </button>
      </div>

      {/* Top 3 rows */}
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

const dtmTypeLabels: Record<string, string> = {
  MAJBURIY: "DTM Majburiy",
  ASOSIY: "DTM Asosiy",
  FULL: "Full DTM",
};

const getTestLabel = (test: any): string => {
  if (test.testType === "DTM" && test.dtmType) return dtmTypeLabels[test.dtmType] ?? "DTM";
  const labels: Record<string, string> = {
    MILLIY_SERTIFIKAT: "Milliy",
    ATTESTATSIYA: "Attestatsiya",
    SAT: "SAT",
    DTM: "DTM",
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

export default function TestsPage() {
  const [typeFilter, setTypeFilter] = useState("Barchasi");
  const [dtmFilter, setDtmFilter] = useState("");
  const [search, setSearch] = useState("");
  const [paymentTest, setPaymentTest] = useState<any>(null);
  const [startModal, setStartModal] = useState<any>(null);
  const [leaderboardModal, setLeaderboardModal] = useState<{ testId: string; testTitle: string } | null>(null);
  const [retakeTest, setRetakeTest] = useState<any>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleStart = (test: any) => {
    if (test.testAccess !== "PUBLIC") {
      setPaymentTest(test);
      return;
    }
    if (!isAuthenticated) {
      const dest = test.testType === "SAT" ? `/sat/${test.id}` : `/exam/${test.id}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
      return;
    }
    setStartModal(test);
  };

  const handleConfirmStart = (test: any) => {
    setStartModal(null);
    router.push(test.testType === "SAT" ? `/sat/${test.id}` : `/exam/${test.id}`);
  };

  const handleMainFilter = (key: string) => {
    setTypeFilter(key);
    setDtmFilter("");
  };

  const { data, loading } = useQuery<{ getPublicTests: any[] }>(GET_PUBLIC_TESTS, {
    fetchPolicy: "cache-and-network",
  });
  const tests = data?.getPublicTests || [];

  const { data: myResultsData } = useQuery<{ getMyResults: any[] }>(GET_MY_RESULTS, {
    skip: !isAuthenticated,
    fetchPolicy: "cache-and-network",
  });
  const attemptedTestIds = new Set(
    (myResultsData?.getMyResults ?? []).map((r: any) => r.testId)
  );
  const resultByTestId = new Map(
    (myResultsData?.getMyResults ?? []).map((r: any) => [r.testId, r.id])
  );

  const filtered = tests.filter((t) => {
    if (t.testAccess === "GROUP") return false;
    const matchType = typeFilter === "Barchasi" || t.testType === typeFilter;
    const matchDtm = typeFilter !== "DTM" || !dtmFilter || t.dtmType === dtmFilter;
    const matchSearch = t.testTitle.toLowerCase().includes(search.toLowerCase());
    return matchType && matchDtm && matchSearch;
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
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
      </div>

      {/* DTM sub-filter */}
      {typeFilter === "DTM" && (
        <div className="flex gap-2 flex-wrap mb-4 pl-1">
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

      {/* Stats */}
      <div className="flex gap-6 mb-8 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{filtered.length}</strong> ta test</span>
        <span><strong className="text-foreground">{filtered.filter(t => t.testAccess === "PUBLIC").length}</strong> ta bepul</span>
        <span><strong className="text-foreground">{filtered.filter(t => t.testAccess !== "PUBLIC").length}</strong> ta premium</span>
      </div>

      {/* Tests grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-medium">Testlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((test: any) => {
            const style = testTypeStyles[test.testType as keyof typeof testTypeStyles];
            return (
            <div
              key={test.id}
              className={`rounded-2xl border p-5 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${style?.cardBg ?? "bg-background border-border"} ${style?.ring ?? ""}`}
            >
              {/* Top row: type badge + access badge */}
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${style?.badge ?? "bg-muted text-foreground border border-border"}`}>
                  {getTestLabel(test)}
                </span>
                {test.testAccess === "PUBLIC" ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                    ✓ Bepul
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border px-2 py-1 rounded-full font-semibold">
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
                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000"}${test.testPdfUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground hover:bg-muted/70 transition-colors font-medium"
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
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => router.push(`/dashboard/results/${resultByTestId.get(test.id)}`)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors"
                  >
                    ✓ Natijani ko'rish
                  </button>
                  <button
                    onClick={() => setRetakeTest(test)}
                    title="Qayta ishlash"
                    className="shrink-0 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-muted text-muted-foreground border border-border hover:bg-muted/70 transition-colors flex items-center justify-center"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleStart(test)}
                  className={`w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    test.testAccess === "PUBLIC"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted text-muted-foreground border border-border hover:bg-muted/70"
                  }`}
                >
                  {test.testAccess === "PUBLIC" ? "Boshlash →" : test.testAccess === "PREMIUM" ? "🔒 Premium" : "🔒 Guruh"}
                </button>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {startModal && (
        <StartTestModal
          test={startModal}
          onStart={() => handleConfirmStart(startModal)}
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
      {retakeTest && (
        <RetakeExplainModal
          testId={retakeTest.id}
          testType={retakeTest.testType}
          onClose={() => setRetakeTest(null)}
        />
      )}
    </div>
  );
}
