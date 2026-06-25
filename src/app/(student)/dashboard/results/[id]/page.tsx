"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { CheckCircle, XCircle, Clock, ChevronLeft, TriangleAlert, Award } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GET_RESULT } from "@/lib/graphql/result";
import { GET_QUESTIONS } from "@/lib/graphql/test";
import { ReportQuestionModal } from "@/components/ReportQuestionModal";
import { MathText } from "@/components/MathText";

// ─── Attestatsiya toifa tizimi ────────────────────────────────────────────────
interface Toifa {
  label: string;
  color: string;
  bg: string;
  border: string;
  ustama?: string;
}

function getAttestatsiyaToifa(points: number): Toifa | null {
  if (points >= 86) return { label: "Oliy toifa", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300", ustama: "+ 70% ustama" };
  if (points >= 80) return { label: "Oliy toifa", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300" };
  if (points >= 71) return { label: "Birinchi toifa", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300" };
  if (points >= 61) return { label: "Ikkinchi toifa", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-300" };
  if (points >= 56) return { label: "Mutaxassis", color: "text-green-700", bg: "bg-green-50", border: "border-green-300" };
  return null;
}

// ─── Attestatsiya grid view ───────────────────────────────────────────────────
const ATTEST_SECTIONS = [
  { name: "Matematika",         from: 1,  to: 35 },
  { name: "Kasbiy standart",    from: 36, to: 40 },
  { name: "Pedagogik mahorat",  from: 41, to: 50 },
];

function AttestatsiyaGrid({ questions, answers }: { questions: any[]; answers: any[] }) {
  const answerMap = new Map<string, boolean>(answers.map((a: any) => [a.questionId, a.isCorrect]));
  const byOrder = new Map<number, any>(questions.map((q: any) => [q.orderIndex, q]));

  return (
    <div className="bg-background rounded-2xl border border-border p-5 mb-6 space-y-6">
      {ATTEST_SECTIONS.map((sec) => {
        const range = Array.from({ length: sec.to - sec.from + 1 }, (_, i) => sec.from + i);
        const sectionQs = range.map((idx) => byOrder.get(idx)).filter(Boolean);
        const correct = sectionQs.filter((q) => answerMap.get(q.id) === true).length;

        return (
          <div key={sec.name}>
            <div className="flex flex-col items-center mb-3">
              <p className="text-sm font-bold">{sec.name}</p>
              <p className="text-xs text-muted-foreground">{correct}/{sectionQs.length} to'g'ri</p>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {range.map((orderIdx) => {
                const q = byOrder.get(orderIdx);
                const isCorrect = q ? answerMap.get(q.id) : undefined;
                return (
                  <div
                    key={orderIdx}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm ${
                      isCorrect === true
                        ? "bg-green-100 text-green-700"
                        : isCorrect === false
                        ? "bg-red-100 text-red-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {orderIdx}
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResultDetailPage() {
  const { id } = useParams();
  const [reportTarget, setReportTarget] = useState<{ questionId: string; number: number } | null>(null);

  const { data: resultData, loading: resultLoading } = useQuery<{ getResult: any }>(GET_RESULT, {
    variables: { resultId: id },
  });

  const result = resultData?.getResult;
  const isAttestatsiya = result?.testType === "ATTESTATSIYA";

  const { data: questionsData } = useQuery<{ getQuestions: any[] }>(GET_QUESTIONS, {
    variables: { testId: result?.testId },
    skip: !result?.testId,
  });

  const questions = questionsData?.getQuestions || [];

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

  // Attestatsiya: 50 savol × 2 ball = 100 ball max
  const attestPoints = isAttestatsiya ? result.correctAnswers * 2 : null;
  const toifa = isAttestatsiya && attestPoints !== null ? getAttestatsiyaToifa(attestPoints) : null;

  const scoreColor = result.score >= 80 ? "text-green-600" : result.score >= 60 ? "text-amber-500" : "text-red-500";
  const scoreBg   = result.score >= 80 ? "bg-green-100"  : result.score >= 60 ? "bg-amber-50"   : "bg-red-100";
  const scoreBar  = result.score >= 80 ? "bg-green-500"  : result.score >= 60 ? "bg-amber-400"  : "bg-red-500";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <Link href="/dashboard/results">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Natijalarga qaytish
        </button>
      </Link>

      {/* Score card */}
      <div className="bg-background rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {new Date(result.createdAt).toLocaleDateString("uz-UZ")}
            </p>
            <h1 className="text-xl font-bold">
              {isAttestatsiya ? "Attestatsiya natijasi" : "Test natijasi"}
            </h1>
          </div>

          {isAttestatsiya ? (
            <div className={`px-4 py-3 rounded-2xl text-center ${scoreBg}`}>
              <p className={`text-2xl font-black ${scoreColor}`}>{attestPoints}</p>
              <p className={`text-xs font-medium ${scoreColor}`}>ball / 100</p>
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

        {/* Toifa badge — faqat Attestatsiya */}
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
                    {attestPoints! >= 86
                      ? "86 ball va undan yuqori"
                      : attestPoints! >= 80
                      ? "80–86 ball"
                      : attestPoints! >= 71
                      ? "71–79 ball"
                      : attestPoints! >= 61
                      ? "61–70 ball"
                      : "56–60 ball"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-muted-foreground">Toifaga kiritilmadi</p>
                  <p className="text-xs text-muted-foreground">Minimal ball: 56 (28 ta to'g'ri)</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all ${scoreBar}`}
            style={{ width: `${result.score}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{result.correctAnswers}</p>
            <p className="text-xs text-muted-foreground">To'g'ri</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-500">
              {result.totalQuestions - result.correctAnswers}
            </p>
            <p className="text-xs text-muted-foreground">Noto'g'ri</p>
          </div>
          <div className="text-center p-3 bg-primary/5 rounded-xl">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{result.duration}</p>
            <p className="text-xs text-muted-foreground">Daqiqa</p>
          </div>
        </div>
      </div>

      {/* Attestatsiya: section grid */}
      {isAttestatsiya && questions.length > 0 && result.answers?.length > 0 && (
        <AttestatsiyaGrid questions={questions} answers={result.answers} />
      )}

      {/* Answers review */}
      {result.answers && result.answers.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-4">Javoblar tahlili</h2>
          <div className="space-y-3">
            {result.answers.map((answer: any, i: number) => {
              const question = questions.find((q: any) => q.id === answer.questionId);
              return (
                <div
                  key={answer.questionId}
                  className={`bg-background rounded-2xl border-2 p-5 ${
                    answer.isCorrect ? "border-green-200" : "border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      answer.isCorrect ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {answer.isCorrect
                        ? <CheckCircle className="w-4 h-4 text-green-600" />
                        : <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-end mb-1">
                        <button
                          onClick={() => setReportTarget({ questionId: answer.questionId, number: i + 1 })}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          <TriangleAlert className="w-3 h-3" />
                          Etiroz
                        </button>
                      </div>
                      <p className="text-sm font-medium mb-3 leading-relaxed">
                        {i + 1}. {question
                          ? <MathText text={question.questionText} />
                          : "Savol yuklanmoqda..."}
                      </p>
                      {question?.questionImage && (
                        <img
                          src={question.questionImage}
                          alt="savol rasmi"
                          className="mb-3 rounded-xl max-h-56 object-contain border border-border"
                        />
                      )}
                      {question?.options && (
                        <div className="space-y-2">
                          {question.options.map((opt: string, j: number) => {
                            const isSelected = j === answer.selectedAnswer;
                            const isCorrectOpt = j === question.correctAnswer;
                            return (
                              <div
                                key={j}
                                className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${
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
                                  {["A", "B", "C", "D"][j]}
                                </span>
                                <MathText text={opt} />
                              </div>
                            );
                          })}
                        </div>
                      )}
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

      {reportTarget && result && (
        <ReportQuestionModal
          questionId={reportTarget.questionId}
          testId={result.testId}
          questionNumber={reportTarget.number}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
