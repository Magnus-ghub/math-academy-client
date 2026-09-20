"use client";

import { useRef, useState } from "react";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { CheckCircle, XCircle, Clock, ChevronLeft, TriangleAlert, Award, Bot, X, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GET_RESULT, GET_MILLIY_SERTIFIKAT_SCORE } from "@/lib/graphql/result";
import { GET_QUESTIONS, GET_TEST } from "@/lib/graphql/test";
import { ReportQuestionModal } from "@/components/ReportQuestionModal";
import { RequestRetakeModal } from "@/components/RequestRetakeModal";
import { MathText } from "@/components/MathText";
import { ReviewPrompt } from "@/components/ReviewPrompt";
import { getAttestatsiyaToifa } from "@/lib/attestatsiya";
import { getMilliySertifikatEstimatedGrade } from "@/lib/milliySertifikat";
import { splitTwoPartText } from "@/lib/utils";

// ─── YouTube helpers ──────────────────────────────────────────────────────────

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function YoutubeModal({ url, onClose }: { url: string; onClose: () => void }) {
  const vid = extractYoutubeId(url);
  const modalRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    rect: DOMRect;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = modalRef.current!.getBoundingClientRect();
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, rect };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ds = dragState.current;
    if (!ds) return;
    const dx = Math.min(Math.max(e.clientX - ds.startX, -ds.rect.left), window.innerWidth - ds.rect.right);
    const dy = Math.min(Math.max(e.clientY - ds.startY, -ds.rect.top), window.innerHeight - ds.rect.bottom);
    setPos({ x: ds.origX + dx, y: ds.origY + dy });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className="bg-black rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 bg-gray-900 cursor-move select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <span className="text-white text-sm font-medium">YouTube Tahlil</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        {vid ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="p-8 text-center text-white/60">
            <p className="mb-3">Video yuklashda xatolik</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-red-400 underline text-sm">
              YouTube da ochish
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Attestatsiya grid view ───────────────────────────────────────────────────
const ATTEST_SECTIONS = [
  { name: "Matematika",         from: 1,  to: 35 },
  { name: "Kasbiy standart",    from: 36, to: 40 },
  { name: "Pedagogik mahorat",  from: 41, to: 50 },
];

function AttestatsiyaGrid({ questions, answers }: { questions: any[]; answers: any[] }) {
  const answerMap = new Map<string, boolean>(answers.map((a: any) => [a.questionId, a.isCorrect]));
  const sorted = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);

  // Standart 50 savollik tuzilma (35+5+10) uchun mavzu bo'yicha bo'linadi.
  // Boshqa sonli testlarda mavzu chegaralari mos kelmasligi mumkin, shuning
  // uchun barcha savollar bitta ro'yxatda ko'rsatiladi.
  const sections =
    questions.length === 50
      ? ATTEST_SECTIONS.map((sec) => ({
          name: sec.name,
          questions: sorted.filter((q) => q.orderIndex >= sec.from && q.orderIndex <= sec.to),
        }))
      : [{ name: "Barcha savollar", questions: sorted }];

  return (
    <div className="bg-background rounded-2xl border border-border p-5 mb-6 space-y-6">
      {sections.map((sec) => {
        const correct = sec.questions.filter((q) => answerMap.get(q.id) === true).length;

        return (
          <div key={sec.name}>
            <div className="flex flex-col items-center mb-3">
              <p className="text-sm font-bold">{sec.name}</p>
              <p className="text-xs text-muted-foreground">{correct}/{sec.questions.length} to'g'ri</p>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {sec.questions.map((q) => {
                const isCorrect = answerMap.get(q.id);
                return (
                  <div
                    key={q.id}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm ${
                      isCorrect === true
                        ? "bg-green-100 text-green-700"
                        : isCorrect === false
                        ? "bg-red-100 text-red-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {q.orderIndex}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SAT modul ajratgichi — har modulda 22 tadan savol, raqamlash 1dan qayta boshlanadi ───
function SatModuleDivider({ module }: { module: number }) {
  return (
    <div className={`flex items-center gap-3 ${module === 1 ? "mb-3" : "mt-1 mb-3"}`}>
      <span className="text-xs font-bold uppercase tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-full shrink-0">
        Modul {module}
      </span>
      <span className="text-xs text-muted-foreground shrink-0">1-22 savollar</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Milliy Sertifikat — Rasch balli (talab bo'yicha, keshlanmaydi) ───────────
function MilliySertifikatScoreBlock({ resultId }: { resultId: string }) {
  const [fetchScore, { data, loading, called }] = useLazyQuery<
    { getMilliySertifikatScore: any },
    { resultId: string }
  >(GET_MILLIY_SERTIFIKAT_SCORE, { fetchPolicy: "network-only" });
  const scoreResult = data?.getMilliySertifikatScore;

  return (
    <div className="bg-background rounded-2xl border border-border p-5 mb-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-bold">Rasch balli (rasmiy)</p>
        <button
          onClick={() => fetchScore({ variables: { resultId } })}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          {loading ? "Yuklanmoqda..." : "Haqiqiy natijani ko'rish"}
        </button>
      </div>

      {called && !loading && scoreResult && (
        scoreResult.ready ? (
          <div className="flex items-center gap-3 mt-4">
            <div className="px-4 py-3 rounded-2xl text-center bg-primary/10 shrink-0">
              <p className="text-2xl font-black text-primary">{scoreResult.finalScore.toFixed(1)}</p>
              <p className="text-xs font-medium text-primary">ball</p>
            </div>
            <div>
              <p className="text-sm font-bold">
                {scoreResult.grade ? `${scoreResult.grade} daraja` : "Sertifikat talabini bajarmadingiz."}
              </p>
              <p className="text-xs text-muted-foreground">
                {scoreResult.respondentCount != null
                  ? `${scoreResult.respondentCount} ta talaba natijasi asosida hisoblangan`
                  : "Boshqa talabalar natijasi asosida hisoblangan"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-amber-600 mt-3">
            Hali yetarli ma'lumot yo'q — haqiqiy ball hisoblanishi uchun ko'proq talaba shu testni topshirishi kerak.
          </p>
        )
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResultDetailPage() {
  const { id } = useParams();
  const [reportTarget, setReportTarget] = useState<{ questionId: string; number: number } | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [testAnalysisOpen, setTestAnalysisOpen] = useState(false);
  const [openQuestionAnalysis, setOpenQuestionAnalysis] = useState<string | null>(null);
  const [showRetakeRequest, setShowRetakeRequest] = useState(false);
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { data: resultData, loading: resultLoading } = useQuery<{ getResult: any }>(GET_RESULT, {
    variables: { resultId: id },
  });

  const result = resultData?.getResult;
  const isAttestatsiya = result?.testType === "ATTESTATSIYA";
  const isSat = result?.testType === "SAT";
  const isMilliySertifikat = result?.testType === "MILLIY_SERTIFIKAT";

  const { data: questionsData, loading: questionsLoading } = useQuery<{ getQuestions: any[] }>(GET_QUESTIONS, {
    variables: { testId: result?.testId },
    skip: !result?.testId,
  });

  const { data: testData } = useQuery<{ getTest: any }>(GET_TEST, {
    variables: { testId: result?.testId },
    skip: !result?.testId,
  });

  const questions = questionsData?.getQuestions || [];
  const test = testData?.getTest;

  if (resultLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-muted rounded-2xl h-48 animate-pulse" />
        <div className="bg-muted rounded-2xl h-32 animate-pulse" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Natija topilmadi</p>
      </div>
    );
  }

  // MATCHING guruhidagi savollar bitta umumiy rasm va umumiy shart (groupPrompt)ga
  // ega bo'lishi mumkin, lekin admin ularni guruhning istalgan savoliga biriktirgan
  // bo'lishi mumkin — shu sabab har bir "section" uchun topilgan birinchisi butun
  // guruhga qo'llaniladi.
  const matchingSectionImages = new Map<string, string>();
  const matchingSectionPrompts = new Map<string, string>();
  for (const q of questions) {
    if (q.questionType === "MATCHING" && q.section) {
      if (q.questionImage && !matchingSectionImages.has(q.section)) {
        matchingSectionImages.set(q.section, q.questionImage);
      }
      if (q.groupPrompt && !matchingSectionPrompts.has(q.section)) {
        matchingSectionPrompts.set(q.section, q.groupPrompt);
      }
    }
  }

  const attestPoints = isAttestatsiya ? result.correctAnswers * 2 : null;
  const attestMaxPoints = isAttestatsiya ? result.totalQuestions * 2 : null;
  const attestPercentage =
    isAttestatsiya && result.totalQuestions > 0 ? (result.correctAnswers / result.totalQuestions) * 100 : null;
  const toifa = attestPercentage !== null ? getAttestatsiyaToifa(attestPercentage) : null;

  // Rasmiy Milliy Sertifikat bahosi (A+/A/B+/...) Rasch-uslubida kogortaga
  // nisbatan hisoblanadi (pastdagi MilliySertifikatScoreBlock, talab bo'yicha) —
  // bu yerda esa xom ball foizi asosida TAXMINIY daraja ko'rsatiladi, shuning
  // uchun aniq "taxminiy" deb belgilanadi.
  const milliyPercentage =
    isMilliySertifikat && result.rawPoints != null && result.totalPoints
      ? (result.rawPoints / result.totalPoints) * 100
      : null;
  const milliyGrade = milliyPercentage !== null ? getMilliySertifikatEstimatedGrade(milliyPercentage) : null;

  const scoreColor = result.score >= 80 ? "text-green-600" : result.score >= 60 ? "text-amber-500" : "text-red-500";
  const scoreBg   = result.score >= 80 ? "bg-green-100"  : result.score >= 60 ? "bg-amber-50"   : "bg-red-100";
  const scoreBar  = result.score >= 80 ? "bg-green-500"  : result.score >= 60 ? "bg-amber-400"  : "bg-red-500";

  const hasTestAnalysis = !!test?.testAnalysis;
  const hasTestYoutube  = !!test?.testYoutubeUrl;

  return (
    <div className="flex gap-4 items-start justify-center">
      {/* Savollar ko'p bo'lganda (Attestatsiya/Milliy Sertifikatda 40-50 ta)
          kerakli savolni pastga scroll qilib qidirish noqulay — shuning
          uchun chap tomonda bosilganda o'sha savolga sirg'alib o'tadigan,
          to'g'ri/noto'g'ri rang bilan ajratilgan raqamlar xaritasi.
          `fixed`+pixel bilan chap sidebar (StudentSidebar, 256px) ustiga
          chiqib ketgani uchun (ekran kengligiga qarab joy hisoblash
          ishonchsiz chiqdi) — endi admin panelidagidek `sticky`, hujjat
          oqimi ichidagi flex-ustun sifatida: sidebar kengligidan qat'i
          nazar avtomatik to'g'ri joylashadi, hech qanday pixel taxmin
          kerak emas. */}
      {result.answers && result.answers.length > 0 && (
        <nav className="hidden xl:grid grid-cols-4 gap-1 sticky top-4 shrink-0 w-36 max-h-[calc(100vh-2rem)] overflow-y-auto bg-background border border-border rounded-xl p-2 content-start shadow-sm">
          {result.answers.map((answer: any, i: number) => {
            const question = questions.find((q: any) => q.id === answer.questionId);
            const isTwoPart = question?.questionType === "TWO_PART";
            const isPartial = isTwoPart && answer.isCorrect !== answer.isCorrectB;
            const displayNumber = isSat && i >= 22 ? i - 22 + 1 : i + 1;
            return (
              <button
                key={answer.questionId}
                type="button"
                onClick={() => answerRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                title={`${displayNumber}-savol — ${answer.isCorrect ? "to'g'ri" : isPartial ? "qisman to'g'ri" : "noto'g'ri"}`}
                className={`aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-opacity hover:opacity-70 ${
                  answer.isCorrect
                    ? "bg-green-100 text-green-700"
                    : isPartial
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {displayNumber}
              </button>
            );
          })}
        </nav>
      )}

      <div className="max-w-2xl w-full">
      {/* Back */}
      <Link href="/dashboard/results">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Natijalarga qaytish
        </button>
      </Link>

      {/* Score card */}
      <div className="bg-background rounded-2xl border border-border p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {new Date(result.createdAt).toLocaleDateString("uz-UZ")}
            </p>
            <h1 className="text-xl font-bold">
              {isAttestatsiya
                ? "Attestatsiya natijasi"
                : isSat
                ? "SAT Math natijasi"
                : isMilliySertifikat
                ? "Milliy Sertifikat natijasi"
                : "Test natijasi"}
            </h1>
          </div>

          {isAttestatsiya ? (
            <div className={`px-4 py-3 rounded-2xl text-center ${scoreBg}`}>
              <p className={`text-2xl font-black ${scoreColor}`}>{attestPoints}</p>
              <p className={`text-xs font-medium ${scoreColor}`}>ball / {attestMaxPoints}</p>
            </div>
          ) : isSat ? (
            <div className={`px-4 py-3 rounded-2xl text-center ${scoreBg}`}>
              <p className={`text-2xl font-black ${scoreColor}`}>{result.satScore ?? "-"}</p>
              <p className={`text-xs font-medium ${scoreColor}`}>ball / 800</p>
            </div>
          ) : isMilliySertifikat ? (
            <div className={`px-4 py-3 rounded-2xl text-center ${scoreBg}`}>
              <p className={`text-2xl font-black ${scoreColor}`}>{result.rawPoints ?? "-"}</p>
              <p className={`text-xs font-medium ${scoreColor}`}>ball / {result.totalPoints ?? "-"}</p>
            </div>
          ) : (
            <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${scoreBg}`}>
              <span className={`text-2xl font-black ${scoreColor}`}>{Math.round(result.score)}%</span>
              <span className={`text-xs font-medium ${scoreColor}`}>
                {result.score >= 80 ? "A'lo" : result.score >= 60 ? "Yaxshi" : "Qoniqarli"}
              </span>
            </div>
          )}
        </div>

        {isAttestatsiya && (
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border mb-4 ${
            toifa ? `${toifa.bg} ${toifa.border}` : "bg-muted border-border"
          }`}>
            <Award className={`w-5 h-5 shrink-0 ${toifa ? toifa.color : "text-muted-foreground"}`} />
            <div>
              {toifa ? (
                <>
                  <p className={`text-sm font-bold ${toifa.color}`}>
                    {toifa.label} {toifa.ustama && <span className="text-xs font-medium">{toifa.ustama}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {attestPercentage! >= 86
                      ? "86% va undan yuqori"
                      : attestPercentage! >= 80
                      ? "80–85%"
                      : attestPercentage! >= 70
                      ? "70–79%"
                      : attestPercentage! >= 60
                      ? "60–69%"
                      : "56–59%"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-muted-foreground">Siz toifa imtihonidan o'ta olmadingiz</p>
                  <p className="text-xs text-muted-foreground">
                    Minimal: 56% ({Math.ceil(0.56 * result.totalQuestions)} ta to'g'ri, {result.totalQuestions} tadan)
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {isMilliySertifikat && (
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border mb-4 ${
            milliyGrade ? `${milliyGrade.bg} ${milliyGrade.border}` : "bg-muted border-border"
          }`}>
            <Award className={`w-5 h-5 shrink-0 ${milliyGrade ? milliyGrade.color : "text-muted-foreground"}`} />
            <div>
              <p className={`text-sm font-bold ${milliyGrade ? milliyGrade.color : "text-muted-foreground"}`}>
                {milliyGrade ? `${milliyGrade.label} daraja (taxminiy)` : "Sertifikat talabini bajarmadingiz. (taxminiy)"}
              </p>
              <p className="text-xs text-muted-foreground">
                Xom ball foiziga asoslangan taxminiy daraja — rasmiy baho pastdagi Rasch balli bo'limida
              </p>
            </div>
          </div>
        )}

        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all ${scoreBar}`} style={{ width: `${result.score}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{result.correctAnswers}</p>
            <p className="text-xs text-muted-foreground">To'g'ri</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-500">{result.totalQuestions - result.correctAnswers}</p>
            <p className="text-xs text-muted-foreground">Noto'g'ri</p>
          </div>
          <div className="text-center p-3 bg-primary/5 rounded-xl">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{result.duration}</p>
            <p className="text-xs text-muted-foreground">Daqiqa</p>
          </div>
        </div>
      </div>

      <ReviewPrompt />

      {/* ── Test-level analysis ── */}
      {(hasTestAnalysis || hasTestYoutube) && (
        <div className="bg-background rounded-2xl border border-border p-4 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
            Test tahlili
          </p>

          {hasTestYoutube && (
            <div className="flex flex-col items-center justify-center py-3 mb-3">
              <button
                onClick={() => setYoutubeUrl(test.testYoutubeUrl)}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-lg shadow-red-600/25 transition-all hover:scale-105"
              >
                <YoutubeIcon className="w-8 h-8 text-white" />
              </button>
              <span className="text-sm font-semibold text-red-600 mt-2">Video tahlilni ko'rish</span>
            </div>
          )}

          {hasTestAnalysis && (
            <div className="flex justify-center">
              <button
                onClick={() => setTestAnalysisOpen((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  testAnalysisOpen
                    ? "bg-primary text-white border-primary"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
              >
                <Bot className="w-4 h-4" />
                AI Tahlil
              </button>
            </div>
          )}

          {testAnalysisOpen && test?.testAnalysis && (
            <div className="mt-3 p-4 bg-primary/5 rounded-xl border border-primary/20 text-base leading-relaxed wrap-break-word overflow-x-auto">
              <MathText text={test.testAnalysis} />
              <p className="mt-3 text-[11px] text-red-500">AI tahlilda xatolik bo'lishi mumkin!</p>
            </div>
          )}
        </div>
      )}

      {/* Attestatsiya grid */}
      {isAttestatsiya && questions.length > 0 && result.answers?.length > 0 && (
        <AttestatsiyaGrid questions={questions} answers={result.answers} />
      )}

      {/* Milliy Sertifikat — Rasch balli (talab bo'yicha) */}
      {isMilliySertifikat && <MilliySertifikatScoreBlock resultId={result.id} />}

      {/* Answers review */}
      {result.answers && result.answers.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-4">Javoblar tahlili</h2>
          <div className="space-y-3">
            {result.answers.map((answer: any, i: number) => {
              const question = questions.find((q: any) => q.id === answer.questionId);
              const qAnalysisOpen = openQuestionAnalysis === answer.questionId;
              const isTwoPart = question?.questionType === "TWO_PART";
              const isMatching = question?.questionType === "MATCHING";
              // TWO_PART'da "a)"/"b)" shartlari umumiy shartdan ajratilib, har biri
              // o'z javobi ustida ko'rsatiladi. Ajratib bo'lmasa (eski format),
              // twoPart.partA/partB bo'sh qoladi — bare "a)"/"b)" belgiga qaytiladi.
              const twoPart = isTwoPart && question ? splitTwoPartText(question.questionText) : null;
              const isPartial = isTwoPart && answer.isCorrect !== answer.isCorrectB;
              const displayNumber = isSat && i >= 22 ? i - 22 + 1 : i + 1;
              return (
                <div key={answer.questionId} ref={(el) => { answerRefs.current[i] = el; }}>
                {isSat && i === 0 && <SatModuleDivider module={1} />}
                {isSat && i === 22 && <SatModuleDivider module={2} />}
                <div
                  className={`relative overflow-hidden bg-background rounded-2xl border-2 ${
                    answer.isCorrect ? "border-green-200" : isPartial ? "border-amber-200" : "border-red-200"
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

                  <div className="relative flex items-start gap-3 p-5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      answer.isCorrect ? "bg-green-100" : isPartial ? "bg-amber-100" : "bg-red-100"
                    }`}>
                      {answer.isCorrect
                        ? <CheckCircle className="w-4 h-4 text-green-600" />
                        : isPartial
                        ? <Info className="w-4 h-4 text-amber-600" />
                        : <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-end mb-1">
                        <button
                          onClick={() => setReportTarget({ questionId: answer.questionId, number: displayNumber })}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          <TriangleAlert className="w-3 h-3" />
                          Etiroz
                        </button>
                      </div>
                      {isMatching && question?.section && matchingSectionPrompts.has(question.section) && (
                        <p className="text-sm font-semibold mb-2 leading-relaxed wrap-break-word overflow-x-auto">
                          <MathText text={matchingSectionPrompts.get(question.section)!} />
                        </p>
                      )}
                      <p className="text-sm font-medium mb-3 leading-relaxed wrap-break-word overflow-x-auto">
                        {displayNumber}. {question
                          ? <MathText text={twoPart ? twoPart.stem : question.questionText} />
                          : questionsLoading
                            ? "Savol yuklanmoqda..."
                            : <span className="text-muted-foreground italic">Bu savol testdan olib tashlangan yoki o'zgartirilgan</span>}
                      </p>
                      {(() => {
                        const img = question?.questionImage
                          || (isMatching && question?.section ? matchingSectionImages.get(question.section) : undefined);
                        return img ? (
                          <img
                            src={img}
                            alt="savol rasmi"
                            className="mb-3 mx-auto block rounded-xl max-h-56 object-contain border border-border"
                          />
                        ) : null;
                      })()}
                      {question && (isTwoPart ? (
                        // TWO_PART (Milliy Sertifikat) — ikkita mustaqil javob (a, b),
                        // har biri alohida baholanadi, javoblar x100 kodlangan.
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-sm font-semibold mb-1.5 leading-relaxed">
                              {twoPart?.partA ? <MathText text={twoPart.partA} /> : "a)"}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Sizning javobingiz: </span>
                              <span className={`font-semibold ${answer.isCorrect ? "text-green-700" : "text-red-600"}`}>
                                {answer.selectedAnswerText?.trim()
                                  ? <MathText text={`$${answer.selectedAnswerText}$`} className="whitespace-nowrap!" />
                                  : answer.selectedAnswer === -1
                                  ? "Javob belgilanmagan"
                                  : answer.selectedAnswer / 100}
                              </span>
                            </p>
                            {!answer.isCorrect && (
                              <p>
                                <span className="text-muted-foreground">To'g'ri javob: </span>
                                <span className="font-semibold text-green-700">
                                  {question.correctAnswerText?.trim()
                                    ? <MathText text={`$${question.correctAnswerText}$`} className="whitespace-nowrap!" />
                                    : question.correctAnswer / 100}
                                </span>
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold mb-1.5 leading-relaxed">
                              {twoPart?.partB ? <MathText text={twoPart.partB} /> : "b)"}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Sizning javobingiz: </span>
                              <span className={`font-semibold ${answer.isCorrectB ? "text-green-700" : "text-red-600"}`}>
                                {answer.selectedAnswerBText?.trim()
                                  ? <MathText text={`$${answer.selectedAnswerBText}$`} className="whitespace-nowrap!" />
                                  : answer.selectedAnswerB == null || answer.selectedAnswerB === -1
                                  ? "Javob belgilanmagan"
                                  : answer.selectedAnswerB / 100}
                              </span>
                            </p>
                            {!answer.isCorrectB && question.correctAnswerB != null && (
                              <p>
                                <span className="text-muted-foreground">To'g'ri javob: </span>
                                <span className="font-semibold text-green-700">
                                  {question.correctAnswerBText?.trim()
                                    ? <MathText text={`$${question.correctAnswerBText}$`} className="whitespace-nowrap!" />
                                    : question.correctAnswerB / 100}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      ) : question.options && question.options.length > 0 ? (
                        <div className="space-y-2">
                          {question.options.map((opt: string, j: number) => {
                            const isSelected = j === answer.selectedAnswer;
                            const isCorrectOpt = j === question.correctAnswer;
                            return (
                              <div
                                key={j}
                                className={`flex items-center gap-2 p-2.5 rounded-xl text-sm wrap-break-word overflow-x-auto ${
                                  isSelected && answer.isCorrect
                                    ? "bg-green-50 text-green-700 font-medium"
                                    : isSelected && !answer.isCorrect
                                    ? "bg-red-50 text-red-600"
                                    : !answer.isCorrect && isCorrectOpt
                                    ? "bg-green-50 text-green-700 font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected && answer.isCorrect
                                    ? "border-green-500 bg-green-500 text-white"
                                    : isSelected && !answer.isCorrect
                                    ? "border-red-500 bg-red-500 text-white"
                                    : !answer.isCorrect && isCorrectOpt
                                    ? "border-green-500 bg-green-500 text-white"
                                    : "border-border"
                                }`}>
                                  {String.fromCharCode(65 + j)}
                                </span>
                                <MathText text={opt} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // SPR (raqam kiritish) savol turi — variantlar yo'q, javoblar
                        // backendda x100 qilib butun songa kodlangan (masalan 3.5 -> 350)
                        <div className="space-y-1.5 text-sm">
                          <p>
                            <span className="text-muted-foreground">Sizning javobingiz: </span>
                            <span className={`font-semibold ${answer.isCorrect ? "text-green-700" : "text-red-600"}`}>
                              {answer.selectedAnswer === -1 ? "Javob belgilanmagan" : answer.selectedAnswer / 100}
                            </span>
                          </p>
                          {!answer.isCorrect && (
                            <p>
                              <span className="text-muted-foreground">To'g'ri javob: </span>
                              <span className="font-semibold text-green-700">{question.correctAnswer / 100}</span>
                            </p>
                          )}
                        </div>
                      ))}

                      {/* Per-question analysis buttons */}
                      {(question?.analysis || question?.youtubeUrl) && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 flex-wrap">
                          {question.analysis && (
                            <button
                              onClick={() =>
                                setOpenQuestionAnalysis(qAnalysisOpen ? null : answer.questionId)
                              }
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                qAnalysisOpen
                                  ? "bg-primary text-white border-primary"
                                  : "border-border hover:border-primary hover:text-primary"
                              }`}
                            >
                              <Bot className="w-3 h-3" />
                              AI Tahlil
                            </button>
                          )}
                          {question.youtubeUrl && (
                            <button
                              onClick={() => setYoutubeUrl(question.youtubeUrl)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            >
                              <YoutubeIcon className="w-3 h-3" />
                              YouTube
                            </button>
                          )}
                        </div>
                      )}

                      {qAnalysisOpen && question?.analysis && (
                        <div className="mt-2 p-3 bg-primary/5 rounded-xl border border-primary/20 text-sm leading-relaxed wrap-break-word overflow-x-auto">
                          <MathText text={question.analysis} />
                          <p className="mt-2 text-[10px] text-red-500">AI tahlilda xatolik bo'lishi mumkin!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6 mb-4">
        <Link href="/dashboard/tests" className="flex-1">
          <button className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
            Boshqa test
          </button>
        </Link>
        <Link href="/dashboard/results" className="flex-1">
          <button className="w-full py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Barcha natijalar
          </button>
        </Link>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={() => setShowRetakeRequest(true)}
          className="text-sm text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
        >
          Xato bilan topshirib qo'ydingizmi? Qayta topshirishni so'rang
        </button>
      </div>

      {showRetakeRequest && result && (
        <RequestRetakeModal testId={result.testId} onClose={() => setShowRetakeRequest(false)} />
      )}

      {reportTarget && result && (
        <ReportQuestionModal
          questionId={reportTarget.questionId}
          testId={result.testId}
          questionNumber={reportTarget.number}
          onClose={() => setReportTarget(null)}
        />
      )}

      {youtubeUrl && (
        <YoutubeModal url={youtubeUrl} onClose={() => setYoutubeUrl(null)} />
      )}
      </div>
    </div>
  );
}
