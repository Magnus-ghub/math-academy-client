import { CheckCircle, XCircle, Clock, Trophy, ChevronLeft } from "lucide-react";
import Link from "next/link";

const mockResult = {
  id: "result-1",
  testTitle: "DTM 2026 - Variant 1",
  testType: "DTM",
  score: 80,
  correctAnswers: 4,
  totalQuestions: 5,
  duration: 35,
  createdAt: "06.06.2026",
  answers: [
    { questionId: "q1", questionText: "2x + 5 = 13 tenglamani yeching.", options: ["x = 3", "x = 4", "x = 5", "x = 6"], selectedAnswer: 1, correctAnswer: 1, isCorrect: true, timeSpent: 45 },
    { questionId: "q2", questionText: "Uchburchak tomonlari 3, 4, 5 bo'lsa, yuzini toping.", options: ["5", "6", "7", "8"], selectedAnswer: 0, correctAnswer: 1, isCorrect: false, timeSpent: 60 },
    { questionId: "q3", questionText: "log₂(8) = ?", options: ["2", "3", "4", "8"], selectedAnswer: 1, correctAnswer: 1, isCorrect: true, timeSpent: 30 },
    { questionId: "q4", questionText: "sin(30°) = ?", options: ["0", "0.5", "√2/2", "1"], selectedAnswer: 1, correctAnswer: 1, isCorrect: true, timeSpent: 25 },
    { questionId: "q5", questionText: "1 + 2 + 3 + ... + 100 = ?", options: ["4950", "5000", "5050", "5100"], selectedAnswer: 2, correctAnswer: 2, isCorrect: true, timeSpent: 40 },
  ],
};

export default function ResultDetailPage() {
  const scoreColor = mockResult.score >= 80 ? "text-green-600" : mockResult.score >= 60 ? "text-accent" : "text-red-500";
  const scoreBg = mockResult.score >= 80 ? "bg-green-100" : mockResult.score >= 60 ? "bg-accent/10" : "bg-red-100";

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
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
              {mockResult.testType}
            </span>
            <h1 className="text-xl font-bold mt-2">{mockResult.testTitle}</h1>
            <p className="text-xs text-muted-foreground mt-1">{mockResult.createdAt}</p>
          </div>
          <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center ${scoreBg}`}>
            <span className={`text-2xl font-black ${scoreColor}`}>{mockResult.score}%</span>
            <span className={`text-xs font-medium ${scoreColor}`}>
              {mockResult.score >= 80 ? "A'lo" : mockResult.score >= 60 ? "Yaxshi" : "Qoniqarli"}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full ${mockResult.score >= 80 ? "bg-green-500" : mockResult.score >= 60 ? "bg-accent" : "bg-red-500"}`}
            style={{ width: `${mockResult.score}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{mockResult.correctAnswers}</p>
            <p className="text-xs text-muted-foreground">To'g'ri</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-xl">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-500">{mockResult.totalQuestions - mockResult.correctAnswers}</p>
            <p className="text-xs text-muted-foreground">Noto'g'ri</p>
          </div>
          <div className="text-center p-3 bg-primary/5 rounded-xl">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{mockResult.duration}</p>
            <p className="text-xs text-muted-foreground">Daqiqa</p>
          </div>
        </div>
      </div>

      {/* Answers review */}
      <h2 className="text-lg font-bold mb-4">Javoblar tahlili</h2>
      <div className="space-y-3">
        {mockResult.answers.map((answer, i) => (
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
                <p className="text-sm font-medium mb-3">{i + 1}. {answer.questionText}</p>
                <div className="space-y-2">
                  {answer.options.map((opt, j) => (
                    <div
                      key={j}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                        j === answer.correctAnswer
                          ? "bg-green-50 text-green-700 font-medium"
                          : j === answer.selectedAnswer && !answer.isCorrect
                          ? "bg-red-50 text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold text-xs ${
                        j === answer.correctAnswer
                          ? "border-green-500 bg-green-500 text-white"
                          : j === answer.selectedAnswer && !answer.isCorrect
                          ? "border-red-500 bg-red-500 text-white"
                          : "border-border"
                      }`}>
                        {["A", "B", "C", "D"][j]}
                      </span>
                      {opt}
                      {j === answer.correctAnswer && (
                        <span className="ml-auto text-green-600 font-medium">✓ To'g'ri</span>
                      )}
                      {j === answer.selectedAnswer && !answer.isCorrect && (
                        <span className="ml-auto text-red-500">✗ Siz tanlagan</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {answer.timeSpent} soniya
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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