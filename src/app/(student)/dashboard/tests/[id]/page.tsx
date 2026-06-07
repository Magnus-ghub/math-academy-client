"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { GET_TEST, GET_QUESTIONS } from "@/lib/graphql/test";
import { SUBMIT_TEST } from "@/lib/graphql/result";

export default function TakeTestPage() {
  const { id } = useParams();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [startTime] = useState(Date.now());

  const { data: testData, loading: testLoading } = useQuery<{ getTest: any }>(GET_TEST, {
    variables: { testId: id },
  });

  const { data: questionsData, loading: questionsLoading } = useQuery<{ getQuestions: any[] }>(GET_QUESTIONS, {
    variables: { testId: id },
  });

  const [submitTest] = useMutation(SUBMIT_TEST, {
    onCompleted: (data: any) => {
      router.push(`/dashboard/results/${data.submitTest.id}`);
    },
  });

  const test = testData?.getTest;
  const questions = questionsData?.getQuestions || [];

  useEffect(() => {
    if (test?.duration) {
      setTimeLeft(test.duration * 60);
    }
  }, [test]);

  useEffect(() => {
    if (isFinished || timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); handleFinish(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleFinish = () => {
    setIsFinished(true);
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60);
    const answersInput = questions.map((q: any, i: number) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] ?? 0,
      timeSpent: 0,
    }));

    submitTest({
      variables: {
        input: {
          testId: id,
          answers: answersInput,
          duration,
        },
      },
    });
  };

  if (testLoading || questionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Test topilmadi yoki savollar yo'q</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  if (isFinished) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Test yakunlandi!</h1>
        <p className="text-muted-foreground mb-6">
          {answeredCount} / {totalQuestions} savol javoblandi
        </p>
        <p className="text-sm text-muted-foreground animate-pulse">Natija hisoblanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-lg">{test.testTitle}</h1>
          <p className="text-sm text-muted-foreground">{test.testType}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
          timeLeft < 300 ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
        }`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{currentIndex + 1} / {totalQuestions} savol</span>
          <span>{answeredCount} ta javoblandi</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question */}
        <div className="lg:col-span-3">
          <div className="bg-background rounded-2xl border border-border p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-bold text-primary">{currentIndex + 1}-savol</span>
              <button
                onClick={() => {
                  setFlagged((prev) => {
                    const next = new Set(prev);
                    next.has(currentQuestion.id) ? next.delete(currentQuestion.id) : next.add(currentQuestion.id);
                    return next;
                  });
                }}
                className={`p-2 rounded-lg transition-colors ${
                  flagged.has(currentQuestion.id)
                    ? "bg-accent/10 text-accent"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
            <p className="text-base font-medium mb-6 leading-relaxed">
              {currentQuestion.questionText}
            </p>
            {currentQuestion.questionImage && (
              <img src={currentQuestion.questionImage} alt="question" className="mb-4 rounded-lg max-h-48 object-contain" />
            )}
            <div className="space-y-3">
              {currentQuestion.options.map((option: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: i }))}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                    answers[currentQuestion.id] === i
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                    answers[currentQuestion.id] === i
                      ? "border-primary bg-primary text-white"
                      : "border-border"
                  }`}>
                    {["A", "B", "C", "D"][i]}
                  </div>
                  <span className="text-sm">{option}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Oldingi
            </button>

            {currentIndex === totalQuestions - 1 ? (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Tugatish
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Keyingi
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Question map */}
        <div className="lg:col-span-1">
          <div className="bg-background rounded-2xl border border-border p-4 sticky top-6">
            <p className="text-xs font-semibold text-muted-foreground mb-3">SAVOLLAR</p>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5">
              {questions.map((q: any, i: number) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                    i === currentIndex
                      ? "bg-primary text-white"
                      : answers[q.id] !== undefined
                      ? "bg-green-100 text-green-700"
                      : flagged.has(q.id)
                      ? "bg-accent/20 text-accent"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary" />Joriy</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100" />Javoblangan</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-accent/20" />Belgilangan</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-muted" />Javoblanmagan</div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full mt-4 py-2 rounded-xl bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
            >
              Testni tugatish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}