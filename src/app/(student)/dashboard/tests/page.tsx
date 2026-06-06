import { Clock, FileQuestion, Lock, BookOpen } from "lucide-react";
import Link from "next/link";

const testTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary border-primary/20",
  SAT: "bg-accent/10 text-accent border-accent/20",
  MILLIY_SERTIFIKAT: "bg-green-50 text-green-700 border-green-200",
  ATTESTATSIYA: "bg-purple-50 text-purple-700 border-purple-200",
};

const mockTests = [
  { id: "1", testTitle: "DTM 2026 - Variant 1", testType: "DTM", testAccess: "PUBLIC", totalQuestions: 30, duration: 60, totalAttempts: 245 },
  { id: "2", testTitle: "DTM 2026 - Variant 2", testType: "DTM", testAccess: "PREMIUM", totalQuestions: 30, duration: 60, totalAttempts: 120 },
  { id: "3", testTitle: "SAT Math - Practice 1", testType: "SAT", testAccess: "PUBLIC", totalQuestions: 25, duration: 45, totalAttempts: 89 },
  { id: "4", testTitle: "Milliy Sertifikat - 1", testType: "MILLIY_SERTIFIKAT", testAccess: "PREMIUM", totalQuestions: 40, duration: 90, totalAttempts: 67 },
  { id: "5", testTitle: "Attestatsiya - Variant 1", testType: "ATTESTATSIYA", testAccess: "PUBLIC", totalQuestions: 20, duration: 40, totalAttempts: 34 },
];

export default function StudentTestsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Testlar</h1>
        <p className="text-muted-foreground text-sm">Imtihon turiga qarab test tanlang</p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {["Barchasi", "DTM", "SAT", "Milliy", "Attestatsiya"].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              type === "Barchasi"
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Tests grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTests.map((test) => (
          <div key={test.id} className={`bg-background rounded-2xl border-2 p-5 hover:shadow-md transition-all ${testTypeColors[test.testType]}`}>
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${testTypeColors[test.testType]}`}>
                {test.testType}
              </span>
              {test.testAccess !== "PUBLIC" && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3" />
                  {test.testAccess === "PREMIUM" ? "Premium" : "Guruh"}
                </div>
              )}
            </div>

            <h3 className="font-bold mb-3">{test.testTitle}</h3>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <FileQuestion className="w-3 h-3" />
                {test.totalQuestions} savol
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {test.duration} daq
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {test.totalAttempts} urinish
              </div>
            </div>

            <Link href={`/dashboard/tests/${test.id}`}>
              <button className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                test.testAccess === "PUBLIC"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
                {test.testAccess === "PUBLIC" ? "Boshlash →" : "🔒 Kirish kerak"}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}