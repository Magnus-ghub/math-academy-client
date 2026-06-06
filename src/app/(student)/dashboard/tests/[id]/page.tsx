"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from "lucide-react";

const mockTest = {
  id: "1",
  testTitle: "DTM 2026 - Variant 1",
  testType: "DTM",
  duration: 60,
  totalQuestions: 5,
  questions: [
    {
      id: "q1",
      questionText: "2x + 5 = 13 tenglamani yeching.",
      options: ["x = 3", "x = 4", "x = 5", "x = 6"],
      orderIndex: 1,
    },
    {
      id: "q2",
      questionText: "Uchburchak tomonlari 3, 4, 5 bo'lsa, yuzini toping.",
      options: ["5", "6", "7", "8"],
      orderIndex: 2,
    },
    {
      id: "q3",
      questionText: "log₂(8) = ?",
      options: ["2", "3", "4", "8"],
      orderIndex: 3,
    },
    {
      id: "q4",
      questionText: "sin(30°) = ?",
      options: ["0", "0.5", "√2/2", "1"],
      orderIndex: 4,
    },
    {
      id: "q5",
      questionText: "1 + 2 + 3 + ... + 100 = ?",
      options: ["4950", "5000", "5050", "5100"],
      orderIndex: 5,
    },
  ],
};

export default function TakeTestPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(mockTest.duration * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());

  const currentQuestion = mockTest.questions[currentIndex];
  const totalQuestions = mockTest.questions.length;
  const answeredCount = Object.keys(answers).length;

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); setIsFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const selectAnswer = (qId: string, index: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: index }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  const handleFinish = () => setIsFinished(true);

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
        <div className="bg-background rounded-2xl border border-border p-6 mb-6 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Javoblangan</span>
            <span className="font-bold">{answeredCount} ta</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Javoblanmagan</span>
            <span className="font-bold text-red-500">{totalQuestions - answeredCount} ta</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sarflangan vaqt</span>
            <span className="font-bold">{formatTime(mockTest.duration * 60 - timeLeft)}</span>
          </div>
        </div>
        <button
          onClick={() => window.location.href = "/dashboard/results"}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          Natijani ko'rish →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-lg">{mockTest.testTitle}</h1>
          <p className="text-sm text-muted-foreground">{mockTest.testType}</p>
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
                onClick={() => toggleFlag(currentQuestion.id)}
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
            <div className="space-y-3">
              {currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(currentQuestion.id, i)}
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
              {mockTest.questions.map((q, i) => (
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
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                Joriy
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100" />
                Javoblangan
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent/20" />
                Belgilangan
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted" />
                Javoblanmagan
              </div>
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