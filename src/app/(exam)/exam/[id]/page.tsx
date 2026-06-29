"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  Clock,
  Flag,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  LayoutGrid,
  X,
  Calculator,
} from "lucide-react";
import { ReportQuestionModal } from "@/components/ReportQuestionModal";
import { FloatingCalculator } from "@/components/FloatingCalculator";
import { useRouter, useParams } from "next/navigation";
import { GET_TEST, GET_QUESTIONS } from "@/lib/graphql/test";
import { SUBMIT_TEST, CHECK_MY_ATTEMPT } from "@/lib/graphql/result";
import { MathText } from "@/components/MathText";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth.store";

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [startTime] = useState(Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    questionId: string;
    number: number;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const examActiveRef = useRef(false);

  const { data: attemptData, loading: attemptLoading } = useQuery<{ checkMyAttempt: any }>(
    CHECK_MY_ATTEMPT,
    {
      variables: { testId: id },
      skip: !id || !isAuthenticated,
      fetchPolicy: "network-only",
    },
  );

  const { data: testData, loading: testLoading } = useQuery<{ getTest: any }>(
    GET_TEST,
    {
      variables: { testId: id },
      skip: !id,
      fetchPolicy: "network-only",
    },
  );

  const { data: questionsData, loading: questionsLoading } = useQuery<{
    getQuestions: any[];
  }>(GET_QUESTIONS, {
    variables: { testId: id },
    skip: !id,
    fetchPolicy: "network-only",
  });

  const [submitTest] = useMutation(SUBMIT_TEST, {
    onCompleted: (data: any) => {
      router.push(`/dashboard/results/${data.submitTest.id}`);
    },
    onError: () => toast.error("Yuborishda xatolik, qayta urinib ko'ring"),
  });

  const test = testData?.getTest;
  const questions = questionsData?.getQuestions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const isWarning = timeLeft < 300 && timeLeft > 0;
  const isAttestatsiya = test?.testType === "ATTESTATSIYA";

  const q = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  // Attestatsiya: orderIndex bo'yicha 3 ta bo'lim (doim bir xil)
  const ATTEST_SECTIONS = [
    { name: "Matematika", from: 1, to: 35 },
    { name: "Kasbiy standart", from: 36, to: 40 },
    { name: "Pedagogik mahorat", from: 41, to: 50 },
  ];
  const qByOrder = new Map<number, { q: any; idx: number }>(
    questions.map((q: any, idx: number) => [q.orderIndex, { q, idx }]),
  );

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

  // ref ni har render'dan keyin yangilab turadi
  useEffect(() => {
    examActiveRef.current =
      !isFinished &&
      !testLoading &&
      !questionsLoading &&
      !attemptLoading &&
      !attemptData?.checkMyAttempt &&
      !!test &&
      totalQuestions > 0;
  });

  // browser back + tab yopishni bloklash (faqat exam aktiv bo'lganda)
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (examActiveRef.current) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (examActiveRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (test?.duration && timeLeft === 0) {
      setTimeLeft(test.duration * 60);
    }
  }, [test]);

  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          doSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [isFinished, timeLeft > 0]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const doSubmit = () => {
    if (isFinished) return;
    setIsFinished(true);
    clearInterval(timerRef.current!);
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60);
    submitTest({
      variables: {
        input: {
          testId: id,
          answers: questions.map((q: any) => ({
            questionId: q.id,
            selectedAnswer: answers[q.id] ?? 0,
            timeSpent: 0,
          })),
          duration,
        },
      },
    });
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  if (testLoading || questionsLoading || attemptLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const existingAttempt = attemptData?.checkMyAttempt;

  if (existingAttempt) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold">Bu testni topshirgansiz</h1>
        <p className="text-muted-foreground max-w-sm">
          Har bir test uchun faqat <strong>1 ta urinish</strong> beriladi. Natijangizni ko'rishingiz mumkin.
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            ← Orqaga
          </button>
          <button
            onClick={() => router.push(`/dashboard/results/${existingAttempt.id}`)}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Natijani ko'rish →
          </button>
        </div>
      </div>
    );
  }

  if (!test || totalQuestions === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
        <p>Test topilmadi yoki savollar yo'q</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-primary hover:underline"
        >
          ← Orqaga
        </button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Test yakunlandi!</h1>
        <p className="text-muted-foreground">
          {answeredCount} / {totalQuestions} savol javoblandi
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">
          Natija hisoblanmoqda...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── HEADER ── */}
      <header className="shrink-0 bg-background border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm truncate">{test.testTitle}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground">
                {test.testType?.replace("_", " ")}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:flex flex-col gap-1 w-36 shrink-0">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{
                  width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {totalQuestions > 0
                ? Math.round((answeredCount / totalQuestions) * 100)
                : 0}
              %
            </p>
          </div>

          {/* Calculator (Attestatsiya only) */}
          {isAttestatsiya && (
            <button
              onClick={() => setShowCalc((v) => !v)}
              className={`shrink-0 p-2 rounded-xl transition-colors ${
                showCalc
                  ? "bg-primary text-white"
                  : "hover:bg-muted text-muted-foreground"
              }`}
              title="Kalkulyator"
            >
              <Calculator className="w-4 h-4" />
            </button>
          )}
          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base shrink-0 transition-colors ${
              isWarning
                ? "bg-red-100 text-red-600 animate-pulse"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          {/* Submit — desktop only */}
          <button
            onClick={() => setShowConfirm(true)}
            className="hidden md:flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Tugatish
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden max-w-5xl mx-auto w-full">
        {/* ── LEFT: Single question ── */}
        <main className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
          {q && (
            <div className="flex-1">
              {/* Question card */}
              <div
                className={`bg-background rounded-2xl border p-5 transition-colors ${
                  answers[q.id] !== undefined
                    ? "border-primary/30"
                    : "border-border"
                }`}
              >
                {/* Question header */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${
                      answers[q.id] !== undefined
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentIndex + 1} / {totalQuestions}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setReportTarget({
                          questionId: q.id,
                          number: currentIndex + 1,
                        })
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all duration-200"
                      title="E'tiroz bildirish"
                    >
                      <span className="text-[13px] font-medium leading-none">
                        E'tiroz
                      </span>
                      <TriangleAlert className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toggleFlag(q.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        flagged.has(q.id)
                          ? "bg-amber-100 text-amber-600"
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                      title="Belgilash"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question text */}
                <div className="text-base font-medium mb-5 leading-relaxed">
                  <MathText text={q.questionText} />
                </div>

                {/* Question image */}
                {q.questionImage && (
                  <img
                    src={q.questionImage}
                    alt="savol rasmi"
                    className="mb-5 rounded-xl max-h-64 object-contain border border-border"
                  />
                )}

                {/* Options */}
                <div className="space-y-2.5">
                  {q.options.map((opt: string, oi: number) => (
                    <button
                      key={oi}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                      }
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                        answers[q.id] === oi
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          answers[q.id] === oi
                            ? "border-primary bg-primary text-white"
                            : "border-muted-foreground/40"
                        }`}
                      >
                        {["A", "B", "C", "D"][oi]}
                      </div>
                      <span className="text-sm">
                        <MathText text={opt} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── NAVIGATION ── */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={isFirst}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Oldingi</span>
                </button>

                {/* Mobile grid toggle — only visible on mobile */}
                <button
                  onClick={() => setShowGrid(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-xs">
                    {answeredCount}/{totalQuestions}
                  </span>
                </button>

                <div className="flex-1" />

                {/* Mobile: Tugatish (har doim ko'rinadi) */}
                <button
                  onClick={() => setShowConfirm(true)}
                  className="md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <p>Yakunlash</p>
                </button>

                {/* Keyingi / Tugatish (oxirgi savolda) */}
                {isLast ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Tugatish
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setCurrentIndex((i) =>
                        Math.min(totalQuestions - 1, i + 1),
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <span className="hidden sm:inline">Keyingi</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT: Question grid (desktop only) ── */}
        <aside className="hidden md:flex w-52 shrink-0 border-l border-border bg-background px-3 py-4 flex-col gap-4 overflow-y-auto">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Savollar
            </p>
            {isAttestatsiya ? (
              ATTEST_SECTIONS.map((sec) => {
                const range = Array.from(
                  { length: sec.to - sec.from + 1 },
                  (_, i) => sec.from + i,
                );
                return (
                  <div key={sec.name}>
                    <p className="text-[11px] font-semibold text-center text-muted-foreground mb-1.5">
                      {sec.name}
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {range.map((orderIdx) => {
                        const entry = qByOrder.get(orderIdx);
                        if (!entry) return null;
                        const { q: sq, idx: i } = entry;
                        return (
                          <button
                            key={sq.id}
                            onClick={() => setCurrentIndex(i)}
                            className={`aspect-square rounded-lg text-xs font-bold transition-all hover:scale-105 ring-offset-1 ${
                              i === currentIndex
                                ? "ring-2 ring-primary scale-105"
                                : ""
                            } ${
                              answers[sq.id] !== undefined
                                ? "bg-primary text-white"
                                : flagged.has(sq.id)
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {orderIdx}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((sq: any, i: number) => (
                  <button
                    key={sq.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`aspect-square rounded-lg text-xs font-bold transition-all hover:scale-105 ring-offset-1 ${
                      i === currentIndex ? "ring-2 ring-primary scale-105" : ""
                    } ${
                      answers[sq.id] !== undefined
                        ? "bg-primary text-white"
                        : flagged.has(sq.id)
                          ? "bg-amber-100 text-amber-700"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              Javoblangan
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
              Belgilangan
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted border border-border" />
              Javoblanmagan
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded ring-2 ring-primary bg-muted" />
              Joriy savol
            </div>
          </div>

          {/* Stats */}
          <div className="mt-auto border-t border-border pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Javoblangan</span>
              <span className="font-medium text-foreground">
                {answeredCount}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Qoldi</span>
              <span className="font-medium text-foreground">
                {totalQuestions - answeredCount}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Belgilangan</span>
              <span className="font-medium text-amber-600">{flagged.size}</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ── MOBILE GRID BOTTOM SHEET ── */}
      {showGrid && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setShowGrid(false)}
          />
          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background rounded-t-2xl border-t border-border shadow-2xl">
            {/* Handle + header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <div>
                <p className="text-sm font-semibold">Savollar</p>
                <p className="text-xs text-muted-foreground">
                  {answeredCount} ta j
                </p>
              </div>
              <button
                onClick={() => setShowGrid(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid */}
            <div className="px-4 py-3 max-h-72 overflow-y-auto space-y-3">
              {isAttestatsiya ? (
                ATTEST_SECTIONS.map((sec) => {
                  const range = Array.from(
                    { length: sec.to - sec.from + 1 },
                    (_, i) => sec.from + i,
                  );
                  return (
                    <div key={sec.name}>
                      <p className="text-[11px] font-semibold text-center text-muted-foreground mb-1.5">
                        {sec.name}
                      </p>
                      <div className="grid grid-cols-8 gap-1.5">
                        {range.map((orderIdx) => {
                          const entry = qByOrder.get(orderIdx);
                          if (!entry) return null;
                          const { q: sq, idx: i } = entry;
                          return (
                            <button
                              key={sq.id}
                              onClick={() => {
                                setCurrentIndex(i);
                                setShowGrid(false);
                              }}
                              className={`aspect-square rounded-lg text-xs font-bold transition-all ring-offset-1 ${
                                i === currentIndex
                                  ? "ring-2 ring-primary scale-105"
                                  : ""
                              } ${
                                answers[sq.id] !== undefined
                                  ? "bg-primary text-white"
                                  : flagged.has(sq.id)
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {orderIdx}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="grid grid-cols-7 gap-1.5">
                  {questions.map((sq: any, i: number) => (
                    <button
                      key={sq.id}
                      onClick={() => {
                        setCurrentIndex(i);
                        setShowGrid(false);
                      }}
                      className={`aspect-square rounded-lg text-xs font-bold transition-all ring-offset-1 ${
                        i === currentIndex
                          ? "ring-2 ring-primary scale-105"
                          : ""
                      } ${
                        answers[sq.id] !== undefined
                          ? "bg-primary text-white"
                          : flagged.has(sq.id)
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 pb-4 pt-2 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary" />
                Javoblangan
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
                Belgilangan
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-muted border border-border" />
                Javoblanmagan
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── CALCULATOR ── */}
      {showCalc && isAttestatsiya && (
        <FloatingCalculator onClose={() => setShowCalc(false)} />
      )}

      {/* ── REPORT MODAL ── */}
      {reportTarget && (
        <ReportQuestionModal
          questionId={reportTarget.questionId}
          testId={id}
          questionNumber={reportTarget.number}
          onClose={() => setReportTarget(null)}
        />
      )}

      {/* ── CONFIRM MODAL ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Testni tugatish</h3>
                <p className="text-xs text-muted-foreground">Tasdiqlang</p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 mb-5 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Javoblangan</span>
                <span className="font-semibold text-green-600">
                  {answeredCount} / {totalQuestions}
                </span>
              </div>
              {totalQuestions - answeredCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Javoblanmagan</span>
                  <span className="font-semibold text-red-500">
                    {totalQuestions - answeredCount} ta
                  </span>
                </div>
              )}
              {flagged.size > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Belgilangan</span>
                  <span className="font-semibold text-amber-600">
                    {flagged.size} ta
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Davom ettirish
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  doSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Tugatish ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
