import { Trophy, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const mockResults = Array.from({ length: 8 }, (_, i) => ({
  id: `result-${i + 1}`,
  testTitle: `Matematika testi ${i + 1}`,
  testType: ["DTM", "SAT", "MILLIY_SERTIFIKAT"][i % 3],
  score: Math.round(60 + Math.random() * 40),
  correctAnswers: 15 + i,
  totalQuestions: 30,
  duration: 25 + i * 3,
  createdAt: new Date(2026, 0, i + 1).toLocaleDateString("uz-UZ"),
}));

export default function ResultsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Natijalarim</h1>
        <p className="text-muted-foreground text-sm">Barcha test natijalari</p>
      </div>

      {mockResults.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">Hali natijalar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockResults.map((result) => (
            <Link key={result.id} href={`/dashboard/results/${result.id}`}>
              <div className="bg-background rounded-2xl border border-border p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {result.testType}
                      </span>
                      <span className="text-xs text-muted-foreground">{result.createdAt}</span>
                    </div>
                    <h3 className="font-semibold text-sm">{result.testTitle}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {result.correctAnswers}/{result.totalQuestions}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {result.duration} daq
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-black ${
                      result.score >= 80 ? "text-green-600" :
                      result.score >= 60 ? "text-accent" : "text-red-500"
                    }`}>
                      {result.score}%
                    </div>
                    <div className={`text-xs font-medium ${
                      result.score >= 80 ? "text-green-600" :
                      result.score >= 60 ? "text-accent" : "text-red-500"
                    }`}>
                      {result.score >= 80 ? "A'lo" : result.score >= 60 ? "Yaxshi" : "Qoniqarli"}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.score >= 80 ? "bg-green-500" :
                      result.score >= 60 ? "bg-accent" : "bg-red-500"
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}