"use client";

import { CheckCircle, XCircle, Clock, Info, ShieldOff } from "lucide-react";
import { MathText } from "@/components/MathText";
import { parseSprAnswer } from "@/lib/utils";

interface Question {
  id: string;
  questionText: string;
  questionImage?: string;
  options?: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Props {
  questions: Question[];
  answers: Record<string, number | string | undefined>;
  duration: number;
  onClose: () => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

function normalizeSelected(q: Question, raw: number | string | undefined): number | undefined {
  const isSpr = !q.options || q.options.length === 0;
  if (raw === undefined || raw === "") return undefined;
  return isSpr ? parseSprAnswer(String(raw)) : (raw as number);
}

export function PracticeResultScreen({ questions, answers, duration, onClose }: Props) {
  const total = questions.length;
  const correctCount = questions.filter(
    (q) => normalizeSelected(q, answers[q.id]) === q.correctAnswer
  ).length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-500";
  const scoreBg = score >= 80 ? "bg-green-100" : score >= 60 ? "bg-amber-50" : "bg-red-100";
  const scoreBar = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-400" : "bg-red-500";

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

        {/* Answers review */}
        <h2 className="text-lg font-bold mb-4">Javoblar tahlili</h2>
        <div className="space-y-3 mb-6">
          {questions.map((q, i) => {
            const isSpr = !q.options || q.options.length === 0;
            const raw = answers[q.id];
            const selected = normalizeSelected(q, raw);
            const isCorrect = selected !== undefined && selected === q.correctAnswer;

            return (
              <div
                key={q.id}
                className={`bg-background rounded-2xl border-2 p-5 ${
                  isCorrect ? "border-green-200" : "border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isCorrect ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-3 leading-relaxed">
                      {i + 1}. <MathText text={q.questionText} />
                    </p>

                    {q.questionImage && (
                      <img
                        src={q.questionImage}
                        alt="savol rasmi"
                        className="mb-3 rounded-xl max-h-56 object-contain border border-border"
                      />
                    )}

                    {isSpr ? (
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
                                {OPTION_LETTERS[j]}
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
