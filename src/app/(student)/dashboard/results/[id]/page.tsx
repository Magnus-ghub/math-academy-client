"use client";

import { useQuery } from "@apollo/client/react";
import { CheckCircle, XCircle, Clock, Trophy, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GET_RESULT } from "@/lib/graphql/result";
import { GET_QUESTIONS } from "@/lib/graphql/test";

export default function ResultDetailPage() {
  const { id } = useParams();

  const { data: resultData, loading: resultLoading } = useQuery<{ getResult: any }>(GET_RESULT, {
    variables: { resultId: id },
  });

  const result = resultData?.getResult;

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

  const scoreColor = result.score >= 80 ? "text-green-600" : result.score >= 60 ? "text-accent" : "text-red-500";
  const scoreBg = result.score >= 80 ? "bg-green-100" : result.score >= 60 ? "bg-accent/10" : "bg-red-100";
  const scoreBar = result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-accent" : "bg-red-500";

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {new Date(result.createdAt).toLocaleDateString("uz-UZ")}
            </p>
            <h1 className="text-xl font-bold">Test natijasi</h1>
          </div>
          <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${scoreBg}`}>
            <span className={`text-2xl font-black ${scoreColor}`}>
              {Math.round(result.score)}%
            </span>
            <span className={`text-xs font-medium ${scoreColor}`}>
              {result.score >= 80 ? "A'lo" : result.score >= 60 ? "Yaxshi" : "Qoniqarli"}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full ${scoreBar}`}
            style={{ width: `${result.score}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
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
                        : <XCircle className="w-4 h-4 text-red-500" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-3">
                        {i + 1}. {question?.questionText || "Savol yuklanmoqda..."}
                      </p>
                      {question?.options && (
                        <div className="space-y-2">
                          {question.options.map((opt: string, j: number) => (
                            <div
                              key={j}
                              className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                                j === answer.selectedAnswer && answer.isCorrect
                                  ? "bg-green-50 text-green-700 font-medium"
                                  : j === answer.selectedAnswer && !answer.isCorrect
                                  ? "bg-red-50 text-red-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-xs ${
                                j === answer.selectedAnswer && answer.isCorrect
                                  ? "border-green-500 bg-green-500 text-white"
                                  : j === answer.selectedAnswer && !answer.isCorrect
                                  ? "border-red-500 bg-red-500 text-white"
                                  : "border-border"
                              }`}>
                                {["A", "B", "C", "D"][j]}
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {answer.timeSpent} soniya
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
      <div className="flex gap-3 mt-6">
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
    </div>
  );
}