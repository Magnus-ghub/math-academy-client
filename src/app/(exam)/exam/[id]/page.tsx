"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
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
import { RequestRetakeModal } from "@/components/RequestRetakeModal";
import { FloatingCalculator } from "@/components/FloatingCalculator";
import { PracticeResultScreen } from "@/components/PracticeResultScreen";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { GET_TEST, GET_QUESTIONS } from "@/lib/graphql/test";
import { SUBMIT_TEST, CHECK_MY_ATTEMPT } from "@/lib/graphql/result";
import { MathText } from "@/components/MathText";
import { SprInput, SprInputHandle } from "@/components/SprInput";
import { AnswerKeyboard } from "@/components/AnswerKeyboard";
import { parseSprAnswer, splitTwoPartText } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth.store";

// Bir nechta MATCHING savol (bir xil "section") bitta umumiy javob bankini
// ko'rsatib, bitta navigatsiya qadamiga birlashtiriladi — SINGLE/TWO_PART
// savollar esa xuddi avvalgidek, bittadan qadam.
type Step =
  | { kind: "single"; question: any }
  | { kind: "matching"; questions: any[] };

function buildSteps(questions: any[]): Step[] {
  const steps: Step[] = [];
  for (const q of questions) {
    const last = steps[steps.length - 1];
    if (q.questionType === "MATCHING" && q.section) {
      if (last && last.kind === "matching" && last.questions[0].section === q.section) {
        last.questions.push(q);
        continue;
      }
      steps.push({ kind: "matching", questions: [q] });
    } else {
      steps.push({ kind: "single", question: q });
    }
  }
  return steps;
}

function ExamPageContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRetake = searchParams.get("retake") === "1";
  const { isAuthenticated, hasHydrated } = useAuthStore();

  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [answersB, setAnswersB] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [startTime] = useState(Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  // TWO_PART (Milliy Sertifikat) savolida ikkita input (a/b) bor — bitta
  // umumiy AnswerKeyboard shulardan qaysi biri faol bo'lsa o'shanga yoziladi,
  // shunda ikkalasi uchun alohida-alohida ikkita klaviatura chiqmaydi.
  const [activeSprPart, setActiveSprPart] = useState<"a" | "b" | null>(null);
  const sprRefA = useRef<SprInputHandle>(null);
  const sprRefB = useRef<SprInputHandle>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    questionId: string;
    number: number;
  } | null>(null);
  const [showRetakeRequest, setShowRetakeRequest] = useState(false);
  const [practiceDuration, setPracticeDuration] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const examActiveRef = useRef(false);
  // Vaqt tugab avtomatik yuborilganda ishlatiladigan doSubmit'ga har renderda
  // eng so'nggi javoblarni (answers/answersB/questions) ko'rsatib turadi —
  // aks holda setInterval ichidagi chaqiruv taймер birinchi ishga tushgan
  // paytdagi (deyarli bo'sh) javoblarni "eslab qolib", talaba keyinchalik
  // bergan javoblarini e'tiborsiz qoldirib yuboradi.
  const doSubmitRef = useRef<() => void>(() => {});

  const { data: attemptData, loading: attemptLoading } = useQuery<{ checkMyAttempt: any }>(
    CHECK_MY_ATTEMPT,
    {
      variables: { testId: id },
      skip: !id || !isAuthenticated || isRetake,
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
    onError: () => {
      toast.error("Yuborishda xatolik, qayta urinib ko'ring");
      setSubmitError(true);
    },
  });

  const test = testData?.getTest;
  const questions = questionsData?.getQuestions || [];
  const totalQuestions = questions.length;
  const isWarning = timeLeft < 300 && timeLeft > 0;
  const isAttestatsiya = test?.testType === "ATTESTATSIYA";
  const isMilliySertifikat = test?.testType === "MILLIY_SERTIFIKAT";

  // TWO_PART savolda javob "a" qismi answers'da, "b" qismi answersB'da —
  // ikkalasidan kamida bittasi to'ldirilsa, savol "javoblangan" hisoblanadi.
  const isAnswered = (question: any): boolean => {
    if (question.questionType === "TWO_PART") {
      const a = answers[question.id];
      const b = answersB[question.id];
      return (a !== undefined && a !== "") || (b !== undefined && b !== "");
    }
    return answers[question.id] !== undefined;
  };
  const answeredCount = questions.filter(isAnswered).length;
  const stepAnswered = (s: Step): boolean =>
    s.kind === "matching"
      ? s.questions.every((mq) => answers[mq.id] !== undefined)
      : isAnswered(s.question);
  const stepFlagged = (s: Step): boolean =>
    s.kind === "matching" ? s.questions.some((mq) => flagged.has(mq.id)) : flagged.has(s.question.id);
  // MATCHING guruhi bir nechta savolni bitta qadamga birlashtirgani uchun,
  // umumiy 45 ta savoldan "43 ta" bo'lib qolmasligi uchun har doim haqiqiy
  // savol raqami (yoki guruh uchun oralig'i, masalan "33-35") ko'rsatiladi —
  // qadam pozitsiyasi (i+1) emas.
  const stepLabel = (s: Step): string =>
    s.kind === "matching"
      ? `${s.questions[0].orderIndex}-${s.questions[s.questions.length - 1].orderIndex}`
      : String(s.question.orderIndex ?? "");

  const steps = buildSteps(questions);
  const totalSteps = steps.length;
  const step = steps[currentIndex];
  const q = step?.kind === "single" ? step.question : undefined;
  // TWO_PART savolda "a)"/"b)" shartlari umumiy shartdan ajratilib, har biri
  // o'z javob maydoni ustida ko'rsatiladi. Ajratib bo'lmasa (eski format),
  // twoPart.partA bo'sh qoladi — pastda butun matn + bare "a)"/"b)" belgiga qaytiladi.
  const twoPart =
    q?.questionType === "TWO_PART" ? splitTwoPartText(q.questionText) : null;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

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
    // hasHydrated bo'lguncha kutamiz — aks holda yangi tabda (masalan admin
    // "Ko'rish" preview'ni target="_blank" bilan ochganda) localStorage'dan
    // auth holati hali tiklanmagan bo'ladi, isAuthenticated bir lahza
    // noto'g'ri "false" ko'rinadi va foydalanuvchi soxta ravishda /login'ga
    // (undan esa proxy.ts orqali /admin'ga) uloqtirib yuboriladi.
    if (hasHydrated && !isAuthenticated) router.push("/login");
  }, [hasHydrated, isAuthenticated]);

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

  // browser back + tab yopishni bloklash (faqat exam aktiv bo'lganda).
  // Amaliyot (retake) rejimida bu himoya o'rnatilmaydi — natija baholanmaydi,
  // shuning uchun orqaga qaytishni bloklash shart emas, aks holda "Chiqish"
  // tugmasi ham (u ham popstate orqali ishlaydi) ishlamay qoladi.
  useEffect(() => {
    if (isRetake) return;

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
  }, [isRetake]);

  // Klaviaturaning chap/o'ng strelkalari — Oldingi/Keyingi tugmalariga bog'langan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!examActiveRef.current || showConfirm || showGrid || showCalc || reportTarget) return;

      if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "ArrowRight" && !isLast) {
        setCurrentIndex((i) => Math.min(totalSteps - 1, i + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showConfirm, showGrid, showCalc, reportTarget, isLast, totalSteps]);

  useEffect(() => {
    if (test?.duration && timeLeft === 0) {
      setTimeLeft(test.duration * 60);
    }
  }, [test]);

  // Boshqa savolga o'tganda klaviatura oldingi savolda ochiq qolib ketmasin.
  useEffect(() => {
    setActiveSprPart(null);
  }, [currentIndex]);

  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          doSubmitRef.current();
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
    if (isFinished && !submitError) return;
    setIsFinished(true);
    setSubmitError(false);
    clearInterval(timerRef.current!);
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60);

    if (isRetake) {
      // Qayta ishlash — natija hech qayerga yuborilmaydi, faqat mahalliy hisoblanadi
      setPracticeDuration(duration);
      return;
    }

    submitTest({
      variables: {
        input: {
          testId: id,
          answers: questions.map((q: any) =>
            q.questionType === "TWO_PART"
              ? {
                  questionId: q.id,
                  selectedAnswer: parseSprAnswer(String(answers[q.id] ?? "")),
                  selectedAnswerB: parseSprAnswer(String(answersB[q.id] ?? "")),
                  timeSpent: 0,
                }
              : {
                  questionId: q.id,
                  selectedAnswer: answers[q.id] ?? -1,
                  timeSpent: 0,
                },
          ),
          duration,
        },
      },
    });
  };
  doSubmitRef.current = doSubmit;

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
        <button
          onClick={() => setShowRetakeRequest(true)}
          className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
        >
          Xato bilan topshirib qo'ydingizmi? Qayta topshirishni so'rang
        </button>
        {showRetakeRequest && (
          <RequestRetakeModal testId={id} onClose={() => setShowRetakeRequest(false)} />
        )}
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
    if (isRetake) {
      return (
        <PracticeResultScreen
          questions={questions}
          answers={answers}
          answersB={answersB}
          duration={practiceDuration}
          testAnalysis={test?.testAnalysis}
          onClose={() => router.push("/dashboard/tests")}
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Test yakunlandi!</h1>
        <p className="text-muted-foreground">
          {answeredCount} / {totalQuestions} savol javoblandi
        </p>
        {submitError ? (
          <>
            <p className="text-sm text-red-500">Natijani yuborishda xatolik yuz berdi.</p>
            <button
              onClick={doSubmit}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Qayta urinish
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground animate-pulse">
            Natija hisoblanmoqda...
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* ── HEADER ── */}
      <header className="shrink-0 bg-background border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
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
              className="shrink-0 p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              title="Chiqish — natija saqlanmaydi"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm truncate">{test.testTitle}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground">
                {test.testType?.replace("_", " ")}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
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

          {/* Calculator (Attestatsiya va Milliy Sertifikat) */}
          {(isAttestatsiya || isMilliySertifikat) && (
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
          {/* Submit — desktop only, faqat oxirgi savolda */}
          {isLast && (
            <button
              onClick={() => setShowConfirm(true)}
              className="hidden md:flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Tugatish
            </button>
          )}
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden max-w-5xl mx-auto w-full">
        {/* ── LEFT: Single question ── */}
        <main className={`flex-1 overflow-y-auto px-4 py-6 flex flex-col ${activeSprPart ? "pb-95 md:pb-6" : ""}`}>
          {step && (
            <div className="flex-1">
              {/* Question card */}
              <div
                className={`relative overflow-hidden bg-background rounded-2xl border transition-colors ${
                  step.kind === "single" && isAnswered(step.question)
                    ? "border-primary/30"
                    : "border-border"
                }`}
              >
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

                <div className="relative p-5">
                {/* Question header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {stepLabel(step)} / {totalQuestions}
                  </span>
                  {step.kind === "single" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setReportTarget({
                            questionId: step.question.id,
                            number: currentIndex + 1,
                          })
                        }
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                        title="E'tiroz bildirish"
                      >
                        <span className="text-[13px] font-medium leading-none">
                          E'tiroz
                        </span>
                        <TriangleAlert className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleFlag(step.question.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          flagged.has(step.question.id)
                            ? "bg-amber-100 text-amber-600"
                            : "hover:bg-muted text-muted-foreground"
                        }`}
                        title="Belgilash"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {step.kind === "matching" ? (
                  <>
                    {/* PDF'dagi ko'rinishga mos: umumiy shart header sifatida yuqorida,
                        pastda ikki ustun — chapda rasm+savollar, o'ngda javob banki jadvali.
                        Admin shart/rasmni guruhdagi istalgan savolga biriktirgan bo'lishi
                        mumkin, shuning uchun birinchi topilgani olinadi. */}
                    {(() => {
                      const groupPrompt = step.questions.find((mq: any) => mq.groupPrompt)?.groupPrompt;
                      const groupImage = step.questions.find((mq: any) => mq.questionImage)?.questionImage;
                      // PDF'dagi "Topshiriqlar (33-35) va javob (A-F) larni o'zaro
                      // moslashtiring" sarlavhasi — bu DB'da alohida saqlanmaydi,
                      // chunki mavjud ma'lumotdan (savol raqamlari va variantlar
                      // soni) to'liq hisoblab chiqarish mumkin.
                      const firstNum = step.questions[0].orderIndex;
                      const lastNum = step.questions[step.questions.length - 1].orderIndex;
                      const lastLetter = String.fromCharCode(65 + step.questions[0].options.length - 1);
                      const instruction = `Topshiriqlar (${firstNum}-${lastNum}) va javob (A-${lastLetter}) larni o'zaro moslashtiring.`;
                      return (
                        <div className="mb-5 rounded-2xl border border-border overflow-hidden">
                          <div className="px-4 py-2.5 bg-primary/10 border-b border-border">
                            <p className="text-sm font-bold text-primary">{instruction}</p>
                          </div>
                          {groupPrompt && (
                            <div className="px-4 py-3 bg-muted/40 border-b border-border">
                              <p className="text-sm font-semibold leading-relaxed">
                                <MathText text={groupPrompt} />
                              </p>
                            </div>
                          )}
                          <div className="flex flex-col md:flex-row">
                            {/* Chap ustun — rasm va alohida savollar */}
                            <div className="flex-1 p-4 md:border-r border-border">
                              {groupImage && (
                                <img
                                  src={groupImage}
                                  alt="savol rasmi"
                                  className="mb-4 mx-auto block rounded-xl max-h-56 object-contain border border-border"
                                />
                              )}
                              <div className="space-y-4">
                                {step.questions.map((mq: any) => (
                                  <div key={mq.id} className="border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-sm font-semibold">
                                        {mq.orderIndex}. <MathText text={mq.questionText} />
                                      </p>
                                      <div className="shrink-0 ml-2 flex items-center gap-1">
                                        <button
                                          onClick={() => setReportTarget({ questionId: mq.id, number: mq.orderIndex })}
                                          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                          title="E'tiroz bildirish"
                                        >
                                          <TriangleAlert className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => toggleFlag(mq.id)}
                                          className={`p-1.5 rounded-lg transition-colors ${
                                            flagged.has(mq.id)
                                              ? "bg-amber-100 text-amber-600"
                                              : "hover:bg-muted text-muted-foreground"
                                          }`}
                                          title="Belgilash"
                                        >
                                          <Flag className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                    <select
                                      value={answers[mq.id] ?? ""}
                                      onChange={(e) =>
                                        setAnswers((prev) => ({ ...prev, [mq.id]: Number(e.target.value) }))
                                      }
                                      className="w-full px-4 py-3 rounded-xl border-2 border-border text-sm font-semibold bg-background focus:border-primary focus:outline-none"
                                    >
                                      <option value="" disabled>
                                        Javobni tanlang...
                                      </option>
                                      {step.questions[0].options.map((_: string, oi: number) => (
                                        <option key={oi} value={oi}>
                                          {String.fromCharCode(65 + oi)}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* O'ng ustun — umumiy javob banki. Kenglik kontentga moslashadi
                                (eng uzun variant qancha joy olsa, shuncha), qattiq kenglik
                                berilmaydi. overflow-visible — .math-text'ning overflow-x-auto
                                qoidasi tufayli KaTeX kasrlar balandligi kesilib qolmasligi
                                uchun aniq bekor qilinadi. */}
                            <div className="p-4 md:w-fit md:max-w-60 md:shrink-0">
                              <div className="space-y-3">
                                {step.questions[0].options.map((opt: string, oi: number) => (
                                  <div key={oi} className="flex items-center gap-2 text-base overflow-visible">
                                    <span className="font-bold shrink-0">{String.fromCharCode(65 + oi)})</span>
                                    <span className="font-semibold whitespace-nowrap overflow-visible">
                                      <MathText text={opt} className="overflow-visible" />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <>
                {/* Question text — TWO_PART'da faqat umumiy shart (a/b shartlari pastda,
                    har biri o'z javob maydoni ustida alohida ko'rsatiladi) */}
                <div className="text-base font-semibold mb-5 leading-relaxed">
                  <MathText text={twoPart ? twoPart.stem : q.questionText} />
                </div>

                {/* Question image */}
                {q.questionImage && (
                  <img
                    src={q.questionImage}
                    alt="savol rasmi"
                    className="mb-5 mx-auto block rounded-xl max-h-64 object-contain border border-border"
                  />
                )}

                {q.questionType === "TWO_PART" ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-semibold mb-2 leading-relaxed">
                        {twoPart?.partA ? <MathText text={twoPart.partA} /> : "a)"}
                      </p>
                      <SprInput
                        ref={sprRefA}
                        value={String(answers[q.id] ?? "")}
                        onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                        maxLength={12}
                        useVirtualKeyboard={isMilliySertifikat}
                        onFocus={() => setActiveSprPart("a")}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2 leading-relaxed">
                        {twoPart?.partB ? <MathText text={twoPart.partB} /> : "b)"}
                      </p>
                      <SprInput
                        ref={sprRefB}
                        value={answersB[q.id] ?? ""}
                        onChange={(v) => setAnswersB((prev) => ({ ...prev, [q.id]: v }))}
                        maxLength={12}
                        useVirtualKeyboard={isMilliySertifikat}
                        onFocus={() => setActiveSprPart("b")}
                      />
                    </div>
                    {isMilliySertifikat && activeSprPart && (
                      <AnswerKeyboard
                        onInsert={(t) => (activeSprPart === "a" ? sprRefA : sprRefB).current?.insertAtCursor(t)}
                        onBackspace={() => (activeSprPart === "a" ? sprRefA : sprRefB).current?.backspaceAtCursor()}
                        onMoveCursor={(d) => (activeSprPart === "a" ? sprRefA : sprRefB).current?.moveCursor(d)}
                        onClose={() => setActiveSprPart(null)}
                        onDone={() => setActiveSprPart(null)}
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {q.options.map((opt: string, oi: number) => (
                      <button
                        key={oi}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                        }
                        className={`w-full flex flex-col gap-2 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                          answers[q.id] === oi
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        {q.optionImages?.[oi] && (
                          <img
                            src={q.optionImages[oi]}
                            alt=""
                            className="max-h-32 object-contain rounded-lg border border-border"
                          />
                        )}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              answers[q.id] === oi
                                ? "border-primary bg-primary text-white"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {String.fromCharCode(65 + oi)}
                          </div>
                          <span className="text-sm font-semibold">
                            <MathText text={opt} />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                  </>
                )}
                </div>
              </div>

              {/* ── NAVIGATION ── */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={isFirst}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

                {/* Mobile: Yakunlash — faqat oxirgi savolda */}
                {isLast && (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <p>Yakunlash</p>
                  </button>
                )}

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
                        Math.min(totalSteps - 1, i + 1),
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
                              flagged.has(sq.id)
                                ? "bg-amber-100 text-amber-700"
                                : answers[sq.id] !== undefined
                                  ? "bg-primary text-white"
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
                {steps.map((st, i) => (
                  <button
                    key={st.kind === "matching" ? st.questions[0].id : st.question.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`aspect-square rounded-lg font-bold transition-all hover:scale-105 ring-offset-1 ${
                      st.kind === "matching" ? "text-[10px]" : "text-xs"
                    } ${
                      i === currentIndex ? "ring-2 ring-primary scale-105" : ""
                    } ${
                      stepFlagged(st)
                        ? "bg-amber-100 text-amber-700"
                        : stepAnswered(st)
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {stepLabel(st)}
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
                                flagged.has(sq.id)
                                  ? "bg-amber-100 text-amber-700"
                                  : answers[sq.id] !== undefined
                                    ? "bg-primary text-white"
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
                  {steps.map((st, i) => (
                    <button
                      key={st.kind === "matching" ? st.questions[0].id : st.question.id}
                      onClick={() => {
                        setCurrentIndex(i);
                        setShowGrid(false);
                      }}
                      className={`aspect-square rounded-lg font-bold transition-all ring-offset-1 ${
                        st.kind === "matching" ? "text-[10px]" : "text-xs"
                      } ${
                        i === currentIndex
                          ? "ring-2 ring-primary scale-105"
                          : ""
                      } ${
                        stepFlagged(st)
                          ? "bg-amber-100 text-amber-700"
                          : stepAnswered(st)
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stepLabel(st)}
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
      {showCalc && (isAttestatsiya || isMilliySertifikat) && (
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

export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <ExamPageContent />
    </Suspense>
  );
}
