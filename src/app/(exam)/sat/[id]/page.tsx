"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter, useParams } from "next/navigation";
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
  Maximize2,
  Minimize2,
} from "lucide-react";
import { GET_TEST, GET_QUESTIONS } from "@/lib/graphql/test";
import { SUBMIT_TEST, CHECK_MY_ATTEMPT } from "@/lib/graphql/result";
import { MathText } from "@/components/MathText";
import { DesmosCalculator } from "@/components/DesmosCalculator";
import { RequestRetakeModal } from "@/components/RequestRetakeModal";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth.store";

const MODULE_QUESTIONS = 22;
const MODULE_TIME = 35 * 60; // 35 minutes in seconds

type Module = 1 | 2;

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

// ── SAT Reference Sheet SVG shapes ──────────────────────────

function RefCircle() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      <circle cx="45" cy="40" r="28" fill="none" stroke="#222" strokeWidth="1.5"/>
      <circle cx="45" cy="40" r="2.5" fill="#222"/>
      <line x1="45" y1="40" x2="73" y2="40" stroke="#222" strokeWidth="1"/>
      <text x="57" y="35" fontSize="11" fill="#222" fontStyle="italic">r</text>
    </svg>
  );
}

function RefRectangle() {
  return (
    <svg viewBox="0 0 90 70" className="w-full h-full">
      <rect x="8" y="12" width="64" height="38" fill="none" stroke="#222" strokeWidth="1.5"/>
      <text x="40" y="9" fontSize="11" fill="#222" textAnchor="middle" fontStyle="italic">ℓ</text>
      <text x="78" y="34" fontSize="11" fill="#222" fontStyle="italic">w</text>
    </svg>
  );
}

function RefTriangle() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      <polygon points="8,70 82,70 35,12" fill="none" stroke="#222" strokeWidth="1.5"/>
      <line x1="35" y1="12" x2="35" y2="70" stroke="#222" strokeWidth="1" strokeDasharray="4,3"/>
      <rect x="35" y="62" width="8" height="8" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="45" y="79" fontSize="11" fill="#222" fontStyle="italic">b</text>
      <text x="22" y="44" fontSize="11" fill="#222" fontStyle="italic">h</text>
    </svg>
  );
}

function RefPythagorean() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      <polygon points="10,68 80,68 10,14" fill="none" stroke="#222" strokeWidth="1.5"/>
      <rect x="10" y="60" width="8" height="8" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="44" y="79" fontSize="11" fill="#222" textAnchor="middle" fontStyle="italic">a</text>
      <text x="4"  y="44" fontSize="11" fill="#222" fontStyle="italic">b</text>
      <text x="48" y="38" fontSize="11" fill="#222" fontStyle="italic">c</text>
    </svg>
  );
}

function RefSpecialTriangles() {
  return (
    <svg viewBox="0 0 160 90" className="w-full h-full">
      {/* 30-60-90 */}
      <polygon points="8,78 72,78 8,18" fill="none" stroke="#222" strokeWidth="1.5"/>
      <rect x="8" y="70" width="8" height="8" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="14" y="30" fontSize="9" fill="#222">60°</text>
      <text x="20" y="76" fontSize="9" fill="#222">30°</text>
      <text x="36" y="86" fontSize="9" fill="#222" fontStyle="italic">x</text><text x="46" y="86" fontSize="9" fill="#222">√3</text>
      <text x="0"  y="52" fontSize="9" fill="#222" fontStyle="italic">x</text>
      <text x="38" y="44" fontSize="9" fill="#222">2</text><text x="44" y="44" fontSize="9" fill="#222" fontStyle="italic">x</text>
      {/* 45-45-90 */}
      <polygon points="88,78 152,78 152,18" fill="none" stroke="#222" strokeWidth="1.5"/>
      <rect x="144" y="70" width="8" height="8" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="90"  y="72" fontSize="9" fill="#222">45°</text>
      <text x="136" y="30" fontSize="9" fill="#222">45°</text>
      <text x="114" y="86" fontSize="9" fill="#222" fontStyle="italic">s</text>
      <text x="155" y="52" fontSize="9" fill="#222" fontStyle="italic">s</text>
      <text x="108" y="44" fontSize="9" fill="#222" fontStyle="italic">s</text><text x="116" y="44" fontSize="9" fill="#222">√2</text>
    </svg>
  );
}

function RefBox() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      {/* Front face */}
      <rect x="18" y="30" width="46" height="36" fill="none" stroke="#222" strokeWidth="1.5"/>
      {/* Top face */}
      <polygon points="18,30 36,14 82,14 64,30" fill="none" stroke="#222" strokeWidth="1.5"/>
      {/* Right face */}
      <polygon points="64,30 82,14 82,50 64,66" fill="none" stroke="#222" strokeWidth="1.5"/>
      <text x="38" y="78" fontSize="10" fill="#222" fontStyle="italic">ℓ</text>
      <text x="72" y="36" fontSize="10" fill="#222" fontStyle="italic">w</text>
      <text x="6"  y="50" fontSize="10" fill="#222" fontStyle="italic">h</text>
    </svg>
  );
}

function RefCylinder() {
  return (
    <svg viewBox="0 0 90 86" className="w-full h-full">
      <ellipse cx="45" cy="20" rx="28" ry="10" fill="none" stroke="#222" strokeWidth="1.5"/>
      <ellipse cx="45" cy="66" rx="28" ry="10" fill="none" stroke="#222" strokeWidth="1.5"/>
      <line x1="17" y1="20" x2="17" y2="66" stroke="#222" strokeWidth="1.5"/>
      <line x1="73" y1="20" x2="73" y2="66" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="20" x2="73" y2="20" stroke="#222" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="57" y="17" fontSize="10" fill="#222" fontStyle="italic">r</text>
      <text x="76" y="46" fontSize="10" fill="#222" fontStyle="italic">h</text>
    </svg>
  );
}

function RefSphere() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      <circle cx="45" cy="40" r="30" fill="none" stroke="#222" strokeWidth="1.5"/>
      <ellipse cx="45" cy="40" rx="30" ry="10" fill="none" stroke="#222" strokeWidth="1" strokeDasharray="4,3"/>
      <circle cx="45" cy="40" r="2.5" fill="#222"/>
      <line x1="45" y1="40" x2="45" y2="10" stroke="#222" strokeWidth="1"/>
      <text x="48" y="27" fontSize="11" fill="#222" fontStyle="italic">r</text>
    </svg>
  );
}

function RefCone() {
  return (
    <svg viewBox="0 0 90 84" className="w-full h-full">
      <ellipse cx="45" cy="68" rx="28" ry="10" fill="none" stroke="#222" strokeWidth="1.5"/>
      <line x1="17" y1="68" x2="45" y2="14" stroke="#222" strokeWidth="1.5"/>
      <line x1="73" y1="68" x2="45" y2="14" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="14" x2="45" y2="68" stroke="#222" strokeWidth="1" strokeDasharray="3,2"/>
      <rect x="45" y="62" width="7" height="7" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="48" y="44" fontSize="10" fill="#222" fontStyle="italic">h</text>
      <text x="55" y="76" fontSize="10" fill="#222" fontStyle="italic">r</text>
    </svg>
  );
}

function RefPyramid() {
  return (
    <svg viewBox="0 0 90 84" className="w-full h-full">
      {/* Base */}
      <polygon points="20,70 70,70 82,54 32,54" fill="none" stroke="#222" strokeWidth="1.5"/>
      {/* Apex to corners */}
      <line x1="45" y1="14" x2="20" y2="70" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="14" x2="70" y2="70" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="14" x2="82" y2="54" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="14" x2="32" y2="54" stroke="#222" strokeWidth="1" strokeDasharray="3,2"/>
      {/* Height */}
      <line x1="45" y1="14" x2="45" y2="62" stroke="#222" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="44" y="78" fontSize="10" fill="#222" fontStyle="italic">ℓ</text>
      <text x="73" y="65" fontSize="10" fill="#222" fontStyle="italic">w</text>
      <text x="48" y="40" fontSize="10" fill="#222" fontStyle="italic">h</text>
    </svg>
  );
}

/* ── SPR Input — real SAT Digital style ──────────────────────────────── */
function SprInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ALLOWED = /^-?[\d./]*$/;
  const MAX_LEN = 6;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v.length <= MAX_LEN && ALLOWED.test(v)) onChange(v);
  };

  return (
    <div className="mt-6">
      {/* Input box — SAT style */}
      <div className="flex flex-col items-start gap-4">
        <div className="relative" style={{ width: 130 }}>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            maxLength={MAX_LEN}
            value={value}
            onChange={handleChange}
            style={{
              width: 130,
              height: 52,
              fontFamily: "monospace",
              fontSize: 22,
              fontWeight: 600,
              textAlign: "center",
              border: "2px solid #6b7280",
              background: "#fff",
              outline: "none",
              letterSpacing: "0.1em",
              color: "#111827",
              display: "block",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1e3a5f")}
            onBlur={(e) => (e.target.style.borderColor = "#6b7280")}
          />
          {/* bottom underline like real SAT */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "#6b7280",
            }}
          />
        </div>

        {/* Clear */}
        {value.trim() !== "" && (
          <button
            onClick={() => onChange("")}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Answer Preview — like real SAT */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-sm font-bold text-gray-700 mb-1">Answer Preview:</p>
        <div style={{ minHeight: 36, fontSize: 20 }}>
          {(() => {
            const frac = value.match(/^(-?\d+)\/(\d+)$/);
            if (frac) return <MathText text={`$$\\frac{${frac[1]}}{${frac[2]}}$$`} />;
            return <span style={{ fontFamily: "monospace", fontSize: 22 }}>{value}</span>;
          })()}
        </div>
      </div>

      {/* Accepted formats */}
      <p className="mt-3 text-xs text-gray-400">
        Formatlar:{" "}
        <span className="font-mono">3.5</span> ·{" "}
        <span className="font-mono">7/2</span> ·{" "}
        <span className="font-mono">-4</span>
      </p>
    </div>
  );
}

export default function SatExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [startTime] = useState(Date.now());

  // Core state
  const [module, setModule] = useState<Module>(1);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(MODULE_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UI overlays
  const [showCalc, setShowCalc] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [refExpanded, setRefExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Flow modals
  const [showModuleFinish, setShowModuleFinish] = useState(false); // confirm end of module 1
  const [showModuleBreak, setShowModuleBreak] = useState(false);   // break screen
  const [showSubmitModal, setShowSubmitModal] = useState(false);    // confirm final submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showRetakeRequest, setShowRetakeRequest] = useState(false);

  const { data: attemptData, loading: attemptLoading } = useQuery<{ checkMyAttempt: any }>(
    CHECK_MY_ATTEMPT,
    {
      variables: { testId: id },
      skip: !id || !isAuthenticated,
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
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated]);

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
          else doSubmit();
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
    if (isSubmitting || isFinished) return;
    setIsSubmitting(true);
    setIsFinished(true);
    clearInterval(timerRef.current!);
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60);
    const parseSpr = (raw: string): number => {
      const s = raw.trim();
      if (!s) return -1;
      const fraction = s.match(/^(-?\d+)\/(\d+)$/);
      if (fraction) {
        const den = parseInt(fraction[2], 10);
        if (den === 0) return -1;
        return Math.round((parseInt(fraction[1], 10) / den) * 100);
      }
      const n = parseFloat(s);
      return isNaN(n) ? -1 : Math.round(n * 100);
    };

    submitTest({
      variables: {
        input: {
          testId: id,
          answers: allQuestions.map((q: any) => {
            const isSpr = !q.options || q.options.length === 0;
            let selectedAnswer: number;
            if (isSpr) {
              selectedAnswer = parseSpr(String(answers[q.id] ?? ""));
            } else {
              selectedAnswer = typeof answers[q.id] === "number" ? (answers[q.id] as number) : 0;
            }
            return { questionId: q.id, selectedAnswer, timeSpent: 0 };
          }),
          duration,
        },
      },
    });
  };

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
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-5 bg-[#f8f9fa]">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Test Submitted!</h1>
          <p className="text-gray-500 mt-1 text-sm">Calculating your score...</p>
        </div>
        <div className="flex gap-6 text-sm text-gray-600">
          <span>Module 1: <strong>{answeredInM1}/22</strong> answered</span>
          <span>Module 2: <strong>{answeredInM2}/22</strong> answered</span>
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Redirecting to results...</p>
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
      <div className="flex-1 overflow-y-auto bg-[#f8f9fa] pb-24">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {currentQ && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                <div className="text-base leading-relaxed text-gray-800 mb-5 font-medium">
                  <MathText text={currentQ.questionText} />
                </div>

                {currentQ.questionImage && (
                  <img
                    src={currentQ.questionImage}
                    alt="question"
                    className="mb-6 rounded-xl max-h-72 object-contain border border-gray-200"
                  />
                )}

                {/* Answer choices */}
                {(!currentQ.options || currentQ.options.length === 0 || currentQ.options.every((o: string) => !o?.trim())) ? (
                  /* SPR — Student-Produced Response */
                  <SprInput
                    value={String(answers[currentQ.id] ?? "")}
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
                ) : (
                  /* MCQ — Multiple Choice */
                  <div className="space-y-3 mt-2">
                    {(currentQ.options ?? []).map((opt: string, oi: number) => {
                      const isSelected = answers[currentQ.id] === oi;
                      return (
                        <button
                          key={oi}
                          onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: oi }))}
                          className={`w-full flex items-start gap-3.5 px-4 py-3.5 rounded-xl border-2 text-left transition-all group ${
                            isSelected
                              ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                              : "border-gray-200 hover:border-[#1e3a5f]/40 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                              isSelected
                                ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                                : "border-gray-300 text-gray-500 group-hover:border-[#1e3a5f]/60"
                            }`}
                          >
                            {OPTION_LETTERS[oi]}
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed pt-0.5">
                            <MathText text={opt} />
                          </span>
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
      {showRef && !refExpanded && (
        /* ── Mini floating panel (default) ── */
        <div className="fixed right-4 top-16 z-50 w-80 max-h-[calc(100vh-80px)] flex flex-col rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a2e] text-white shrink-0">
            <span className="text-sm font-semibold">Reference</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRefExpanded(true)}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title="Expand"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowRef(false)}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrollable compact content */}
          <div className="overflow-y-auto flex-1 px-3 py-3 space-y-3">
            {/* Row 1 */}
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center">
                <div className="w-14 h-11"><RefCircle /></div>
                <p className="text-[10px] text-center leading-tight mt-0.5"><i>A</i>=π<i>r</i>² <i>C</i>=2π<i>r</i></p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-11"><RefRectangle /></div>
                <p className="text-[10px] text-center leading-tight mt-0.5"><i>A</i>=<i>ℓw</i></p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-11"><RefTriangle /></div>
                <p className="text-[10px] text-center leading-tight mt-0.5"><i>A</i>=½<i>bh</i></p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-11"><RefPythagorean /></div>
                <p className="text-[10px] text-center leading-tight mt-0.5"><i>c</i>²=<i>a</i>²+<i>b</i>²</p>
              </div>
            </div>

            {/* Special triangles — full width */}
            <div className="flex flex-col items-center border border-gray-100 rounded-lg p-2">
              <div className="w-full h-14"><RefSpecialTriangles /></div>
              <p className="text-[10px] font-semibold text-gray-600 mt-0.5">Special Right Triangles</p>
            </div>

            {/* 3D shapes */}
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center">
                <div className="w-14 h-11"><RefBox /></div>
                <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=<i>ℓwh</i></p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-11"><RefCylinder /></div>
                <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=π<i>r</i>²<i>h</i></p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-11"><RefSphere /></div>
                <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=4/3π<i>r</i>³</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-11"><RefCone /></div>
                <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=⅓π<i>r</i>²<i>h</i></p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <div className="w-14 h-11"><RefPyramid /></div>
                <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=⅓<i>ℓwh</i></p>
              </div>
            </div>

            {/* Notes */}
            <div className="border-t border-gray-100 pt-2 space-y-1">
              <p className="text-[10px] text-gray-500">• Arc degrees in a circle = 360</p>
              <p className="text-[10px] text-gray-500">• Arc radians in a circle = 2π</p>
              <p className="text-[10px] text-gray-500">• Triangle angle sum = 180°</p>
            </div>
          </div>
        </div>
      )}

      {showRef && refExpanded && (
        /* ── Full-screen expanded view ── */
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-3 bg-[#1a1a2e] text-white shrink-0">
            <h2 className="font-semibold text-base">Reference</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRefExpanded(false)}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
                title="Shrink"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setShowRef(false); setRefExpanded(false); }}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 px-8 py-8">
            <div className="grid grid-cols-7 gap-6 mb-8">
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16"><RefCircle /></div>
                <p className="text-xs text-center leading-snug mt-1"><i>A</i> = π<i>r</i>²<br /><i>C</i> = 2π<i>r</i></p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16"><RefRectangle /></div>
                <p className="text-xs text-center leading-snug mt-1"><i>A</i> = <i>ℓw</i></p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16"><RefTriangle /></div>
                <p className="text-xs text-center leading-snug mt-1"><i>A</i> = ½<i>bh</i></p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16"><RefPythagorean /></div>
                <p className="text-xs text-center leading-snug mt-1"><i>c</i>² = <i>a</i>² + <i>b</i>²</p>
              </div>
              <div className="col-span-2 flex flex-col items-center gap-1">
                <div className="w-full h-16"><RefSpecialTriangles /></div>
                <p className="text-xs text-center font-semibold mt-1">Special Right Triangles</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16"><RefBox /></div>
                <p className="text-xs text-center leading-snug mt-1"><i>V</i> = <i>ℓwh</i></p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-6 mb-8">
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16"><RefCylinder /></div>
                <p className="text-xs text-center leading-snug mt-1"><i>V</i> = π<i>r</i>²<i>h</i></p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16"><RefSphere /></div>
                <p className="text-xs text-center leading-snug mt-1"><i>V</i> = 4/3 π<i>r</i>³</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16"><RefCone /></div>
                <p className="text-xs text-center leading-snug mt-1"><i>V</i> = ⅓ π<i>r</i>²<i>h</i></p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16"><RefPyramid /></div>
                <p className="text-xs text-center leading-snug mt-1"><i>V</i> = ⅓ <i>ℓwh</i></p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-2">
              <p className="text-sm text-gray-700">The number of degrees of arc in a circle is 360.</p>
              <p className="text-sm text-gray-700">The number of radians of arc in a circle is 2π.</p>
              <p className="text-sm text-gray-700">The sum of the measures in degrees of the angles of a triangle is 180.</p>
            </div>
          </div>
        </div>
      )}

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
