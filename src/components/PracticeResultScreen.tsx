"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, Clock, Info, ShieldOff, Bot } from "lucide-react";
import { MathText } from "@/components/MathText";
import { parseSprAnswer, splitTwoPartText } from "@/lib/utils";

interface Question {
  id: string;
  questionText: string;
  questionImage?: string;
  questionType?: string;
  section?: string;
  groupPrompt?: string;
  options?: string[];
  correctAnswer: number;
  correctAnswerB?: number | null;
  correctAnswerText?: string | null;
  correctAnswerBText?: string | null;
  explanation?: string;
  analysis?: string;
}

interface Props {
  questions: Question[];
  answers: Record<string, number | string | undefined>;
  answersB?: Record<string, string | undefined>;
  duration: number;
  testAnalysis?: string;
  isSat?: boolean;
  onClose: () => void;
}

// SAT'da har modulda 22 tadan savol, raqamlash 1dan qayta boshlanadi.
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

function normalizeSelected(q: Question, raw: number | string | undefined): number | undefined {
  const isSpr = !q.options || q.options.length === 0;
  if (raw === undefined || raw === "") return undefined;
  return isSpr ? parseSprAnswer(String(raw)) : (raw as number);
}

function normalizeB(raw: number | string | undefined): number | undefined {
  if (raw === undefined || raw === "") return undefined;
  return typeof raw === "number" ? raw : parseSprAnswer(String(raw));
}

function questionPoints(q: Question): number {
  return q.questionType === "TWO_PART" ? 2 : 1;
}

function earnedPoints(
  q: Question,
  answers: Record<string, number | string | undefined>,
  answersB: Record<string, string | undefined>,
): number {
  if (q.questionType === "TWO_PART") {
    const a = normalizeSelected(q, answers[q.id]);
    const b = normalizeB(answersB[q.id]);
    let pts = 0;
    if (a !== undefined && a !== -1 && a === q.correctAnswer) pts++;
    if (b !== undefined && b !== -1 && q.correctAnswerB != null && b === q.correctAnswerB) pts++;
    return pts;
  }
  const selected = normalizeSelected(q, answers[q.id]);
  return selected !== undefined && selected !== -1 && selected === q.correctAnswer ? 1 : 0;
}

export function PracticeResultScreen({ questions, answers, answersB = {}, duration, testAnalysis, isSat = false, onClose }: Props) {
  const [testAnalysisOpen, setTestAnalysisOpen] = useState(false);
  const [openAnalysisId, setOpenAnalysisId] = useState<string | null>(null);
  const total = questions.length;
  const correctCount = questions.filter(
    (q) => earnedPoints(q, answers, answersB) === questionPoints(q)
  ).length;
  const totalPoints = questions.reduce((s, q) => s + questionPoints(q), 0);
  const gotPoints = questions.reduce((s, q) => s + earnedPoints(q, answers, answersB), 0);
  const score = totalPoints > 0 ? Math.round((gotPoints / totalPoints) * 100) : 0;

  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-500";
  const scoreBg = score >= 80 ? "bg-green-100" : score >= 60 ? "bg-amber-50" : "bg-red-100";
  const scoreBar = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-400" : "bg-red-500";

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

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Practice banner */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <ShieldOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Bu <strong>mashq uchun qayta ishlash</strong> edi — natija hech qayerda saqlanmadi va statistikaga ta'sir qilmadi.
            Faqat shu yerda, o'zingiz uchun ko'rinadi.
          </p>
        </div>

        {/* Score card */}
        <div className="bg-background rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Mashq natijasi</p>
              <h1 className="text-xl font-bold">Qayta ishlash yakunlandi</h1>
            </div>
            <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${scoreBg}`}>
              <span className={`text-2xl font-black ${scoreColor}`}>{score}%</span>
              <span className={`text-xs font-medium ${scoreColor}`}>
                {score >= 80 ? "A'lo" : score >= 60 ? "Yaxshi" : "Qoniqarli"}
              </span>
            </div>
          </div>

          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <div className={`h-full rounded-full transition-all ${scoreBar}`} style={{ width: `${score}%` }} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-600">{correctCount}</p>
              <p className="text-xs text-muted-foreground">To'g'ri</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-500">{total - correctCount}</p>
              <p className="text-xs text-muted-foreground">Noto'g'ri</p>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-xl">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-primary">{duration}</p>
              <p className="text-xs text-muted-foreground">Daqiqa</p>
            </div>
          </div>
        </div>

        {/* Test-level AI tahlil */}
        {testAnalysis?.trim() && (
          <div className="bg-background rounded-2xl border border-border p-5 mb-6">
            <button
              onClick={() => setTestAnalysisOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                testAnalysisOpen
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Bot className="w-4 h-4" />
              AI Tahlil
            </button>
            {testAnalysisOpen && (
              <div className="mt-3 p-4 bg-primary/5 rounded-xl border border-primary/20 text-base leading-relaxed wrap-break-word overflow-x-auto overflow-y-hidden">
                <MathText text={testAnalysis} />
                <p className="mt-3 text-[11px] text-red-500">AI tahlilda xatolik bo'lishi mumkin!</p>
              </div>
            )}
          </div>
        )}

        {/* Answers review */}
        <h2 className="text-lg font-bold mb-4">Javoblar tahlili</h2>
        <div className="space-y-3 mb-6">
          {questions.map((q, i) => {
            const isTwoPart = q.questionType === "TWO_PART";
            const isMatching = q.questionType === "MATCHING";
            const isSpr = !isTwoPart && (!q.options || q.options.length === 0);
            // TWO_PART'da "a)"/"b)" shartlari umumiy shartdan ajratilib, har biri
            // o'z javobi ustida ko'rsatiladi. Ajratib bo'lmasa (eski format),
            // twoPart.partA/partB bo'sh qoladi — bare "a)"/"b)" belgiga qaytiladi.
            const twoPart = isTwoPart ? splitTwoPartText(q.questionText) : null;
            const raw = answers[q.id];
            const selected = normalizeSelected(q, raw);
            const rawB = answersB[q.id];
            const selectedB = normalizeB(rawB);
            const isCorrectA = isTwoPart
              ? selected !== undefined && selected !== -1 && selected === q.correctAnswer
              : selected !== undefined && selected !== -1 && selected === q.correctAnswer;
            const isCorrectB = isTwoPart
              ? selectedB !== undefined && selectedB !== -1 && q.correctAnswerB != null && selectedB === q.correctAnswerB
              : undefined;
            const isCorrect = isTwoPart ? isCorrectA && !!isCorrectB : isCorrectA;
            const isPartial = isTwoPart && isCorrectA !== isCorrectB;
            const displayNumber = isSat && i >= 22 ? i - 22 + 1 : i + 1;

            return (
              <div key={q.id}>
              {isSat && i === 0 && <SatModuleDivider module={1} />}
              {isSat && i === 22 && <SatModuleDivider module={2} />}
              <div
                className={`relative overflow-hidden bg-background rounded-2xl border-2 ${
                  isCorrect ? "border-green-200" : isPartial ? "border-amber-200" : "border-red-200"
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
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isCorrect ? "bg-green-100" : isPartial ? "bg-amber-100" : "bg-red-100"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : isPartial ? (
                      <Info className="w-4 h-4 text-amber-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {isMatching && q.section && matchingSectionPrompts.has(q.section) && (
                      <p className="text-sm font-semibold mb-2 leading-relaxed">
                        <MathText text={matchingSectionPrompts.get(q.section)!} />
                      </p>
                    )}
                    <p className="text-sm font-medium mb-3 leading-relaxed">
                      {displayNumber}. <MathText text={twoPart ? twoPart.stem : q.questionText} />
                    </p>

                    {(() => {
                      const img = q.questionImage
                        || (isMatching && q.section ? matchingSectionImages.get(q.section) : undefined);
                      return img ? (
                        <img
                          src={img}
                          alt="savol rasmi"
                          className="mb-3 mx-auto block rounded-xl max-h-56 object-contain border border-border"
                        />
                      ) : null;
                    })()}

                    {isTwoPart ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-sm font-semibold mb-1.5 leading-relaxed">
                            {twoPart?.partA ? <MathText text={twoPart.partA} /> : "a)"}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Sizning javobingiz: </span>
                            <span className={`font-semibold ${isCorrectA ? "text-green-700" : "text-red-600"}`}>
                              {raw === undefined || raw === ""
                                ? "Javob belgilanmagan"
                                : <MathText text={`$${raw}$`} className="whitespace-nowrap!" />}
                            </span>
                          </p>
                          {!isCorrectA && (
                            <p>
                              <span className="text-muted-foreground">To'g'ri javob: </span>
                              <span className="font-semibold text-green-700">
                                {q.correctAnswerText?.trim()
                                  ? <MathText text={`$${q.correctAnswerText}$`} className="whitespace-nowrap!" />
                                  : q.correctAnswer / 100}
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
                            <span className={`font-semibold ${isCorrectB ? "text-green-700" : "text-red-600"}`}>
                              {rawB === undefined || rawB === ""
                                ? "Javob belgilanmagan"
                                : <MathText text={`$${rawB}$`} className="whitespace-nowrap!" />}
                            </span>
                          </p>
                          {!isCorrectB && q.correctAnswerB != null && (
                            <p>
                              <span className="text-muted-foreground">To'g'ri javob: </span>
                              <span className="font-semibold text-green-700">
                                {q.correctAnswerBText?.trim()
                                  ? <MathText text={`$${q.correctAnswerBText}$`} className="whitespace-nowrap!" />
                                  : q.correctAnswerB / 100}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ) : isSpr ? (
                      <div className="space-y-1.5 text-sm">
                        <p>
                          <span className="text-muted-foreground">Sizning javobingiz: </span>
                          <span className={`font-semibold ${isCorrect ? "text-green-700" : "text-red-600"}`}>
                            {raw === undefined || raw === "" ? "Javob belgilanmagan" : String(raw)}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p>
                            <span className="text-muted-foreground">To'g'ri javob: </span>
                            <span className="font-semibold text-green-700">{q.correctAnswer / 100}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(q.options ?? []).map((opt, j) => {
                          const isSelected = j === selected;
                          const isCorrectOpt = j === q.correctAnswer;
                          return (
                            <div
                              key={j}
                              className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${
                                isSelected && isCorrect
                                  ? "bg-green-50 text-green-700 font-medium"
                                  : isSelected && !isCorrect
                                    ? "bg-red-50 text-red-600"
                                    : !isCorrect && isCorrectOpt
                                      ? "bg-green-50 text-green-700 font-medium"
                                      : "text-muted-foreground"
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected && isCorrect
                                    ? "border-green-500 bg-green-500 text-white"
                                    : isSelected && !isCorrect
                                      ? "border-red-500 bg-red-500 text-white"
                                      : !isCorrect && isCorrectOpt
                                        ? "border-green-500 bg-green-500 text-white"
                                        : "border-border"
                                }`}
                              >
                                {String.fromCharCode(65 + j)}
                              </span>
                              <MathText text={opt} />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                        <MathText text={q.explanation} />
                      </div>
                    )}

                    {q.analysis?.trim() && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <button
                          onClick={() => setOpenAnalysisId((cur) => (cur === q.id ? null : q.id))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            openAnalysisId === q.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          <Bot className="w-3 h-3" />
                          AI Tahlil
                        </button>
                        {openAnalysisId === q.id && (
                          <div className="mt-2 p-3 bg-primary/5 rounded-xl border border-primary/20 text-sm leading-relaxed wrap-break-word overflow-x-auto overflow-y-hidden">
                            <MathText text={q.analysis} />
                            <p className="mt-2 text-[10px] text-red-500">AI tahlilda xatolik bo'lishi mumkin!</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pb-6">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Testlar ro'yxatiga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}
