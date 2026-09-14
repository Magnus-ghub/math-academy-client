"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  BookmarkIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calculator,
  BookOpen,
  MoreHorizontal,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { GET_TEST, GET_QUESTIONS } from "@/lib/graphql/test";
import { SUBMIT_TEST, CHECK_MY_ATTEMPT } from "@/lib/graphql/result";
import { MathText } from "@/components/MathText";
import { DesmosCalculator } from "@/components/DesmosCalculator";
import { ReferenceSheet } from "@/components/ReferenceSheet";
import { RequestRetakeModal } from "@/components/RequestRetakeModal";
import { PracticeResultScreen } from "@/components/PracticeResultScreen";
import { SprInput } from "@/components/SprInput";
import { parseSprAnswer } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth.store";

const MODULE_QUESTIONS = 22;
const MODULE_TIME = 35 * 60; // 35 minutes in seconds

type Module = 1 | 2;

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

function SatExamPageContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRetake = searchParams.get("retake") === "1";
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [startTime] = useState(Date.now());
  const [practiceDuration, setPracticeDuration] = useState(0);

  // Core state
  const [module, setModule] = useState<Module>(1);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(MODULE_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Vaqt tugab avtomatik yuborilganda ishlatiladigan doSubmit'ga har renderda
  // eng so'nggi javoblarni ko'rsatib turadi — aks holda setInterval ichidagi
  // chaqiruv modul boshlangan paytdagi (deyarli bo'sh) javoblarni "eslab
  // qolib", talaba keyinchalik bergan javoblarini e'tiborsiz qoldirib yuboradi.
  const doSubmitRef = useRef<() => void>(() => {});

  // UI overlays
  const [showCalc, setShowCalc] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Flow modals
  const [showModuleFinish, setShowModuleFinish] = useState(false); // confirm end of module 1
  const [showModuleBreak, setShowModuleBreak] = useState(false);   // break screen
  const [showSubmitModal, setShowSubmitModal] = useState(false);    // confirm final submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [showRetakeRequest, setShowRetakeRequest] = useState(false);

  const { data: attemptData, loading: attemptLoading } = useQuery<{ checkMyAttempt: any }>(
    CHECK_MY_ATTEMPT,
    {
      variables: { testId: id },
      skip: !id || !isAuthenticated || isRetake,
      fetchPolicy: "network-only",
    },
  );

  const { data: testData, loading: testLoading } = useQuery<{ getTest: any }>(GET_TEST, {
    variables: { testId: id },
    skip: !id,
    fetchPolicy: "network-only",
  });

  const { data: questionsData, loading: questionsLoading } = useQuery<{ getQuestions: any[] }>(
    GET_QUESTIONS,
    { variables: { testId: id }, skip: !id, fetchPolicy: "network-only" }
  );

  const [submitTest] = useMutation(SUBMIT_TEST, {
    onCompleted: (data: any) => {
      router.push(`/dashboard/results/${data.submitTest.id}`);
    },
    onError: () => {
      setIsSubmitting(false);
      setSubmitError(true);
      toast.error("Submission failed. Please try again.");
    },
  });

  const test = testData?.getTest;
  // Sort questions by orderIndex and split into modules
  const allQuestions = [...(questionsData?.getQuestions || [])].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
  const m1Questions = allQuestions.slice(0, MODULE_QUESTIONS);
  const m2Questions = allQuestions.slice(MODULE_QUESTIONS, MODULE_QUESTIONS * 2);
  const moduleQuestions = module === 1 ? m1Questions : m2Questions;
  const currentQ = moduleQuestions[idx];
  const totalLoaded = allQuestions.length;

  const isAnswered = (q: any) => {
    const ans = answers[q.id];
    if (ans === undefined) return false;
    if (!q.options || q.options.length === 0) return String(ans).trim() !== "";
    return true;
  };
  const answeredInM1 = m1Questions.filter(isAnswered).length;
  const answeredInM2 = m2Questions.filter(isAnswered).length;
  const flaggedInModule = moduleQuestions.filter((q) => flagged.has(q.id)).length;
  const answeredInModule = moduleQuestions.filter(isAnswered).length;
  const unansweredInModule = MODULE_QUESTIONS - answeredInModule;

  useEffect(() => {
    // hasHydrated bo'lguncha kutamiz — aks holda yangi tabda (masalan admin
    // "Ko'rish" preview'ni target="_blank" bilan ochganda) localStorage'dan
    // auth holati hali tiklanmagan bo'ladi, isAuthenticated bir lahza
    // noto'g'ri "false" ko'rinadi va foydalanuvchi soxta ravishda /login'ga
    // (undan esa proxy.ts orqali /admin'ga) uloqtirib yuboriladi.
    if (hasHydrated && !isAuthenticated) router.push("/login");
  }, [hasHydrated, isAuthenticated]);

  // Timer — resets when module changes
  useEffect(() => {
    if (isFinished || showModuleBreak) return;
    setTimeLeft(MODULE_TIME);
  }, [module]);

  useEffect(() => {
    if (isFinished || showModuleBreak) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (module === 1) handleEndModule1(true);
          else doSubmitRef.current();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [module, isFinished, showModuleBreak]);

  // Klaviaturaning chap/o'ng strelkalari — Back/Next tugmalariga bog'langan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isFinished ||
        showModuleBreak ||
        showCalc ||
        showRef ||
        showMore ||
        showGrid ||
        showModuleFinish ||
        showSubmitModal
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        setIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight" && idx !== MODULE_QUESTIONS - 1) {
        setIdx((i) => Math.min(MODULE_QUESTIONS - 1, i + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, showModuleBreak, showCalc, showRef, showMore, showGrid, showModuleFinish, showSubmitModal, idx]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const isWarning = timeLeft < 300 && timeLeft > 0;

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const handleEndModule1 = (auto = false) => {
    clearInterval(timerRef.current!);
    if (!auto) setShowModuleFinish(false);
    setShowModuleBreak(true);
    setIdx(0);
  };

  const handleStartModule2 = () => {
    setShowModuleBreak(false);
    setModule(2);
    setIdx(0);
  };

  const doSubmit = () => {
    if (isSubmitting || (isFinished && !submitError)) return;
    setIsFinished(true);
    setSubmitError(false);
    clearInterval(timerRef.current!);
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60);

    if (isRetake) {
      // Qayta ishlash — natija hech qayerga yuborilmaydi, faqat mahalliy hisoblanadi
      setPracticeDuration(duration);
      return;
    }

    setIsSubmitting(true);
    submitTest({
      variables: {
        input: {
          testId: id,
          answers: allQuestions.map((q: any) => {
            const isSpr = !q.options || q.options.length === 0;
            let selectedAnswer: number;
            if (isSpr) {
              selectedAnswer = parseSprAnswer(String(answers[q.id] ?? ""));
            } else {
              selectedAnswer = typeof answers[q.id] === "number" ? (answers[q.id] as number) : -1;
            }
            return { questionId: q.id, selectedAnswer, timeSpent: 0 };
          }),
          duration,
        },
      },
    });
  };
  doSubmitRef.current = doSubmit;

  // ── LOADING ──
  if (testLoading || questionsLoading || attemptLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8f9fa] gap-4">
        <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#1e3a5f] font-medium text-sm">Loading your test...</p>
      </div>
    );
  }

  const existingAttempt = attemptData?.checkMyAttempt;

  if (existingAttempt) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8f9fa] text-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[#1e3a5f]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Bu testni topshirgansiz</h1>
        <p className="text-gray-500 max-w-sm">
          Har bir test uchun faqat <strong>1 ta urinish</strong> beriladi. Natijangizni ko'rishingiz mumkin.
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← Orqaga
          </button>
          <button
            onClick={() => router.push(`/dashboard/results/${existingAttempt.id}`)}
            className="px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#162d4a] transition-colors"
          >
            Natijani ko'rish →
          </button>
        </div>
        <button
          onClick={() => setShowRetakeRequest(true)}
          className="text-sm text-gray-500 hover:text-[#1e3a5f] underline underline-offset-2 transition-colors"
        >
          Xato bilan topshirib qo'ydingizmi? Qayta topshirishni so'rang
        </button>
        {showRetakeRequest && (
          <RequestRetakeModal testId={id} onClose={() => setShowRetakeRequest(false)} />
        )}
      </div>
    );
  }

  if (!test || totalLoaded === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
        <p>Test not found or no questions available.</p>
        <button onClick={() => router.back()} className="text-sm text-[#1e3a5f] hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  // ── FINISHED ──
  if (isFinished) {
    if (isRetake) {
      return (
        <div className="h-screen flex flex-col bg-[#f8f9fa]">
          <PracticeResultScreen
            questions={allQuestions}
            answers={answers}
            duration={practiceDuration}
            testAnalysis={test?.testAnalysis}
            isSat
            onClose={() => router.push("/dashboard/tests")}
          />
        </div>
      );
    }
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-5 bg-[#f8f9fa]">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Test Submitted!</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {submitError ? "Submission failed." : "Calculating your score..."}
          </p>
        </div>
        <div className="flex gap-6 text-sm text-gray-600">
          <span>Module 1: <strong>{answeredInM1}/22</strong> answered</span>
          <span>Module 2: <strong>{answeredInM2}/22</strong> answered</span>
        </div>
        {submitError ? (
          <button
            onClick={doSubmit}
            className="px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#162d4a] transition-colors"
          >
            Try again
          </button>
        ) : (
          <p className="text-sm text-gray-400 animate-pulse">Redirecting to results...</p>
        )}
      </div>
    );
  }

  // ── MODULE BREAK ──
  if (showModuleBreak) {
    return (
      <div className="h-screen flex flex-col bg-[#f8f9fa]">
        {/* Break header */}
        <div className="bg-[#1e3a5f] px-6 py-4 flex items-center gap-3">
          <span className="text-white font-bold text-lg">SAT</span>
          <span className="text-white/40">|</span>
          <span className="text-white/80 text-sm">Math</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8 max-w-lg mx-auto w-full">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-[#1e3a5f]" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">Module 1 Complete</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              You have finished Module 1. Take a short break if needed, then continue to Module 2.
              Your Module 2 timer will start when you click <strong>Begin Module 2</strong>.
            </p>
          </div>

          {/* Module 1 stats */}
          <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Module 1 Summary</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Answered</span>
                <span className="font-semibold text-green-600">{answeredInM1} / 22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Unanswered</span>
                <span className="font-semibold text-gray-700">{22 - answeredInM1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Marked for Review</span>
                <span className="font-semibold text-amber-600">
                  {m1Questions.filter((q) => flagged.has(q.id)).length}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handleStartModule2}
              className="w-full bg-[#1e3a5f] text-white font-semibold py-3.5 rounded-xl hover:bg-[#162d4a] transition-colors"
            >
              Begin Module 2 →
            </button>
            <p className="text-center text-xs text-gray-400">
              Module 2 · 22 Questions · 35 Minutes
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN EXAM ──
  const isLastInModule = idx === MODULE_QUESTIONS - 1;

  return (
    <>
      {/* ══ HEADER ══ */}
      <header className="shrink-0 bg-[#1e3a5f] text-white px-4 py-0 h-14 flex items-center">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
          {isRetake && (
            <button
              onClick={() => {
                // Admin preview'ni yangi tabda ochadi (target="_blank") — bunday
                // tabda oldingi sahifa umuman bo'lmaydi, shu holatda router.back()
                // hech narsa qilmaydi. Talaba retake'ni esa shu tab ichida
                // router.push bilan ochadi, shu holatda tarixda oldingi sahifa bor.
                if (window.history.length > 1) router.back();
                else router.push("/admin/tests");
              }}
              className="shrink-0 p-2 rounded-xl hover:bg-white/10 text-white/70 transition-colors"
              title="Chiqish — natija saqlanmaydi"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-black text-xl tracking-tight">SAT</span>
            <span className="text-white/30 text-lg">|</span>
            <div className="text-xs leading-tight">
              <p className="font-semibold text-white/90">
                Section 2, Module {module}: Math
              </p>
              <p className="text-white/50">22 Questions · 35 Minutes</p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
              isWarning ? "bg-red-500/20 text-red-200 animate-pulse" : "text-white/90"
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            {formatTime(timeLeft)}
          </div>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMore && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
                <div className="absolute right-0 top-10 z-50 w-48 bg-white text-gray-700 rounded-xl shadow-xl border border-gray-100 py-1 text-sm">
                  <button
                    onClick={() => { setShowCalc(true); setShowMore(false); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Calculator className="w-4 h-4 text-gray-400" />
                    Calculator
                  </button>
                  <button
                    onClick={() => { setShowRef(true); setShowMore(false); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    Reference Sheet
                  </button>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={() => {
                      setShowMore(false);
                      if (module === 1) setShowModuleFinish(true);
                      else setShowSubmitModal(true);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-red-500 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    {module === 1 ? "End Module 1" : "Submit Test"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div className="relative flex-1 overflow-y-auto bg-[#f8f9fa] pb-24">
        <div className="relative max-w-3xl mx-auto px-4 py-6">
          {currentQ && (
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Orqa fondagi logo — katta, juda hira */}
              <Image
                src="/logo.jpg"
                alt=""
                fill
                aria-hidden
                className="object-contain opacity-[0.09] pointer-events-none select-none"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-4 text-center text-lg font-bold tracking-wide text-primary/15 pointer-events-none select-none"
              >
                SAIDXONOV ACADEMY
              </span>

              {/* Question header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1e3a5f]">
                    Question {idx + 1}
                  </span>
                  <span className="text-gray-400 text-xs">of {MODULE_QUESTIONS}</span>
                </div>

                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all border ${
                    flagged.has(currentQ.id)
                      ? "bg-amber-50 border-amber-300 text-amber-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <BookmarkIcon
                    className={`w-3.5 h-3.5 ${flagged.has(currentQ.id) ? "fill-amber-500 text-amber-500" : ""}`}
                  />
                  Mark for Review
                </button>
              </div>

              {/* Question content */}
              <div className="px-6 py-6">
                <div className="text-base leading-relaxed text-gray-800 mb-5 font-semibold">
                  <MathText text={currentQ.questionText} />
                </div>

                {currentQ.questionImage && (
                  <img
                    src={currentQ.questionImage}
                    alt="question"
                    className="mb-6 mx-auto block rounded-xl max-h-72 object-contain border border-gray-200"
                  />
                )}

                {/* Answer choices */}
                {(!currentQ.options || currentQ.options.length === 0 || currentQ.options.every((o: string) => !o?.trim())) ? (
                  /* SPR — Student-Produced Response */
                  <div className="mt-6">
                    <SprInput
                      value={String(answers[currentQ.id] ?? "")}
                      maxLength={6}
                      onChange={(val) =>
                        setAnswers((prev) => {
                          if (val === "") {
                            const next = { ...prev };
                            delete next[currentQ.id];
                            return next;
                          }
                          return { ...prev, [currentQ.id]: val };
                        })
                      }
                    />
                  </div>
                ) : (
                  /* MCQ — Multiple Choice */
                  <div className="space-y-3 mt-2">
                    {(currentQ.options ?? []).map((opt: string, oi: number) => {
                      const isSelected = answers[currentQ.id] === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: oi }))}
                          className={`w-full flex flex-col gap-2.5 px-4 py-3.5 rounded-xl border-2 text-left transition-all group ${
                            isSelected
                              ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                              : "border-gray-200 hover:border-[#1e3a5f]/40 hover:bg-gray-50"
                          }`}
                        >
                          {currentQ.optionImages?.[oi] && (
                            <img
                              src={currentQ.optionImages[oi]}
                              alt=""
                              className="max-h-32 object-contain rounded-lg border border-gray-200"
                            />
                          )}
                          <div className="flex items-start gap-3.5">
                            <div
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                                isSelected
                                  ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                                  : "border-gray-300 text-gray-500 group-hover:border-[#1e3a5f]/60"
                              }`}
                            >
                              {OPTION_LETTERS[oi]}
                            </div>
                            <span className="text-sm font-semibold text-gray-700 leading-relaxed pt-0.5">
                              <MathText text={opt} />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Back */}
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#162d4a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* Question navigator */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="font-medium">
                {answeredInModule} of {MODULE_QUESTIONS} answered
              </span>
              {flaggedInModule > 0 && (
                <span className="text-amber-600">· {flaggedInModule} marked</span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showGrid ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Toolbar icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowCalc(!showCalc)}
              title="Calculator"
              className={`p-2 rounded-lg transition-colors ${showCalc ? "bg-[#1e3a5f] text-white" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <Calculator className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowRef(true)}
              title="Reference"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

          {/* Next / End Module */}
          {isLastInModule ? (
            <button
              onClick={() => module === 1 ? setShowModuleFinish(true) : setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors"
            >
              {module === 1 ? "Next Module" : "Submit"}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIdx((i) => Math.min(MODULE_QUESTIONS - 1, i + 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Question grid dropdown */}
        {showGrid && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap gap-1.5 justify-center">
                {moduleQuestions.map((q: any, i: number) => {
                  const isAnswered_q = isAnswered(q);
                  const isFlagged = flagged.has(q.id);
                  const isCurrent = i === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => { setIdx(i); setShowGrid(false); }}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border-2 ${
                        isCurrent
                          ? "border-[#1e3a5f] bg-[#1e3a5f] text-white scale-110"
                          : isAnswered_q && isFlagged
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : isAnswered_q
                          ? "border-[#1e3a5f]/40 bg-[#1e3a5f]/10 text-[#1e3a5f]"
                          : isFlagged
                          ? "border-amber-300 bg-amber-50 text-amber-600"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-[#1e3a5f]/10 border border-[#1e3a5f]/40" />
                  Answered
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-50 border border-amber-300" />
                  Marked for Review
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-white border border-gray-200" />
                  Unanswered
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ DESMOS CALCULATOR ══ */}
      {showCalc && <DesmosCalculator onClose={() => setShowCalc(false)} />}

      {/* ══ REFERENCE SHEET ══ */}
      {showRef && <ReferenceSheet onClose={() => setShowRef(false)} />}

      {/* ══ MODAL: End Module 1 ══ */}
      {showModuleFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1e3a5f]">End Module 1?</h3>
                <p className="text-xs text-gray-400">You'll move on to Module 2</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Answered</span>
                <span className={`font-semibold ${answeredInM1 === 22 ? "text-green-600" : "text-gray-800"}`}>
                  {answeredInM1} / 22
                </span>
              </div>
              {unansweredInModule > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Unanswered</span>
                  <span className="font-semibold text-red-500">{unansweredInModule}</span>
                </div>
              )}
              {flaggedInModule > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Marked for Review</span>
                  <span className="font-semibold text-amber-600">{flaggedInModule}</span>
                </div>
              )}
              <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">
                You cannot return to Module 1 once you proceed.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModuleFinish(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Keep Working
              </button>
              <button
                onClick={() => handleEndModule1()}
                className="flex-1 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors"
              >
                Go to Module 2
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Submit Test ══ */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#1e3a5f]">Submit Test?</h3>
                <p className="text-xs text-gray-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Module 1 answered</span>
                <span className="font-semibold text-gray-800">{answeredInM1} / 22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Module 2 answered</span>
                <span className="font-semibold text-gray-800">{answeredInM2} / 22</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-500 font-medium">Total answered</span>
                <span className={`font-bold ${(answeredInM1 + answeredInM2) === 44 ? "text-green-600" : "text-gray-800"}`}>
                  {answeredInM1 + answeredInM2} / 44
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Keep Working
              </button>
              <button
                onClick={() => { setShowSubmitModal(false); doSubmit(); }}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                Submit ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SatExamPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex flex-col items-center justify-center bg-[#f8f9fa] gap-4">
          <div className="w-10 h-10 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#1e3a5f] font-medium text-sm">Loading your test...</p>
        </div>
      }
    >
      <SatExamPageContent />
    </Suspense>
  );
}
