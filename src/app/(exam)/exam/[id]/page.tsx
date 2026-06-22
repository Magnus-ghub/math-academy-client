"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Clock, Flag, CheckCircle, AlertTriangle, ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { GET_TEST, GET_QUESTIONS } from "@/lib/graphql/test";
import { SUBMIT_TEST } from "@/lib/graphql/result";
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

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: testData, loading: testLoading } = useQuery<{ getTest: any }>(GET_TEST, {
    variables: { testId: id },
    skip: !id,
  });

  const { data: questionsData, loading: questionsLoading } = useQuery<{ getQuestions: any[] }>(GET_QUESTIONS, {
    variables: { testId: id },
    skip: !id,
  });

  const [submitTest] = useMutation(SUBMIT_TEST, {
    onCompleted: (data: any) => {
      router.push(`/dashboard/results/${data.submitTest.id}`);
    },
    onError: () => toast.error("Yuborishda xatolik, qayta urinib ko'ring"),
  });

  const test = testData?.getTest;
  const questions = questionsData?.getQuestions || [];

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

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
    const m = Math.floor(s / 60).toString().padStart(2, "0");
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

  const scrollToQuestion = (qId: string) => {
    questionRefs.current[qId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const isWarning = timeLeft < 300 && timeLeft > 0;

  if (testLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!test || totalQuestions === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 text-muted-foreground">
        <p>Test topilmadi yoki savollar yo'q</p>
        <button onClick={() => router.back()} className="text-sm text-primary hover:underline">← Orqaga</button>
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
        <p className="text-sm text-muted-foreground animate-pulse">Natija hisoblanmoqda...</p>
      </div>
    );
  }

  return (
    <>
      {/* ── HEADER ── */}
      <header className="shrink-0 bg-background border-b border-border px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Test info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm truncate">{test.testTitle}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground">{test.testType?.replace("_", " ")}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{answeredCount}/{totalQuestions} javoblandi</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:flex flex-col gap-1 w-40 shrink-0">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0}%
            </p>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base shrink-0 transition-colors ${
            isWarning ? "bg-red-100 text-red-600 animate-pulse" : "bg-primary/10 text-primary"
          }`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>

          {/* Submit */}
          <button
            onClick={() => setShowConfirm(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tugatish</span>
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden max-w-screen-xl mx-auto w-full">

        {/* ── LEFT: Questions (scrollable) ── */}
        <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {questions.map((q: any, i: number) => (
            <div
              key={q.id}
              ref={(el) => { questionRefs.current[q.id] = el; }}
              className={`bg-background rounded-2xl border p-5 scroll-mt-4 transition-colors ${
                answers[q.id] !== undefined ? "border-primary/30" : "border-border"
              }`}
            >
              {/* Question header */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  answers[q.id] !== undefined ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}-savol
                </span>
                <button
                  onClick={() => toggleFlag(q.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    flagged.has(q.id) ? "bg-amber-100 text-amber-600" : "hover:bg-muted text-muted-foreground"
                  }`}
                  title="Belgilash"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Question text */}
              <div className="text-sm font-medium mb-4 leading-relaxed">
                <MathText text={q.questionText} />
              </div>

              {/* Question image */}
              {q.questionImage && (
                <img
                  src={q.questionImage}
                  alt="savol rasmi"
                  className="mb-4 rounded-xl max-h-56 object-contain border border-border"
                />
              )}

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt: string, oi: number) => (
                  <button
                    key={oi}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      answers[q.id] === oi
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      answers[q.id] === oi ? "border-primary bg-primary text-white" : "border-muted-foreground/40"
                    }`}>
                      {["A", "B", "C", "D"][oi]}
                    </div>
                    <span className="text-sm"><MathText text={opt} /></span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Bottom submit */}
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <CheckCircle className="w-5 h-5" />
            Testni tugatish
          </button>
        </main>

        {/* ── RIGHT: Question numbers (fixed, no scroll) ── */}
        <aside className="w-52 shrink-0 border-l border-border bg-background px-3 py-4 flex flex-col gap-4 overflow-hidden">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Savollar</p>
            <div className="grid grid-cols-4 gap-1.5">
              {questions.map((q: any, i: number) => (
                <button
                  key={q.id}
                  onClick={() => scrollToQuestion(q.id)}
                  className={`aspect-square rounded-lg text-xs font-bold transition-all hover:scale-105 ${
                    answers[q.id] !== undefined
                      ? "bg-primary text-white"
                      : flagged.has(q.id)
                      ? "bg-amber-100 text-amber-700"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
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
              <div className="w-3 h-3 rounded bg-muted" />
              Javoblanmagan
            </div>
          </div>

          {/* Stats */}
          <div className="mt-auto border-t border-border pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Javoblangan</span>
              <span className="font-medium text-foreground">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Qoldi</span>
              <span className="font-medium text-foreground">{totalQuestions - answeredCount}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Belgilangan</span>
              <span className="font-medium text-amber-600">{flagged.size}</span>
            </div>
          </div>
        </aside>
      </div>

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
                <span className="font-semibold text-green-600">{answeredCount} / {totalQuestions}</span>
              </div>
              {totalQuestions - answeredCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Javoblanmagan</span>
                  <span className="font-semibold text-red-500">{totalQuestions - answeredCount} ta</span>
                </div>
              )}
              {flagged.size > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Belgilangan</span>
                  <span className="font-semibold text-amber-600">{flagged.size} ta</span>
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
                onClick={() => { setShowConfirm(false); doSubmit(); }}
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
