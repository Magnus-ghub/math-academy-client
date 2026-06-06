import { Clock, FileQuestion, Lock, Search } from "lucide-react";
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
  { id: "3", testTitle: "DTM 2026 - Variant 3", testType: "DTM", testAccess: "PUBLIC", totalQuestions: 30, duration: 60, totalAttempts: 98 },
  { id: "4", testTitle: "SAT Math - Practice 1", testType: "SAT", testAccess: "PUBLIC", totalQuestions: 25, duration: 45, totalAttempts: 89 },
  { id: "5", testTitle: "SAT Math - Practice 2", testType: "SAT", testAccess: "PREMIUM", totalQuestions: 25, duration: 45, totalAttempts: 67 },
  { id: "6", testTitle: "Milliy Sertifikat - 1", testType: "MILLIY_SERTIFIKAT", testAccess: "PREMIUM", totalQuestions: 40, duration: 90, totalAttempts: 67 },
  { id: "7", testTitle: "Milliy Sertifikat - 2", testType: "MILLIY_SERTIFIKAT", testAccess: "PUBLIC", totalQuestions: 40, duration: 90, totalAttempts: 45 },
  { id: "8", testTitle: "Attestatsiya - Variant 1", testType: "ATTESTATSIYA", testAccess: "PUBLIC", totalQuestions: 20, duration: 40, totalAttempts: 34 },
];

const types = ["Barchasi", "DTM", "SAT", "MILLIY_SERTIFIKAT", "ATTESTATSIYA"];
const typeLabels: Record<string, string> = {
  "Barchasi": "Barchasi",
  "DTM": "DTM",
  "SAT": "SAT",
  "MILLIY_SERTIFIKAT": "Milliy Sertifikat",
  "ATTESTATSIYA": "Attestatsiya",
};

export default function TestsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Barcha testlar</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Imtihon turiga qarab test tanlang va tayyorgarlikni boshlang
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Test nomi bo'yicha qidirish..."
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((type) => (
            <button
              key={type}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                type === "Barchasi"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-8 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{mockTests.length}</strong> ta test</span>
        <span><strong className="text-foreground">{mockTests.filter(t => t.testAccess === "PUBLIC").length}</strong> ta bepul</span>
        <span><strong className="text-foreground">{mockTests.filter(t => t.testAccess === "PREMIUM").length}</strong> ta premium</span>
      </div>

      {/* Tests grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTests.map((test) => (
          <div
            key={test.id}
            className={`bg-background rounded-2xl border-2 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${testTypeColors[test.testType]}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${testTypeColors[test.testType]}`}>
                {test.testType.replace("_", " ")}
              </span>
              {test.testAccess !== "PUBLIC" && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  Premium
                </div>
              )}
            </div>

            <h3 className="font-bold mb-3 text-foreground">{test.testTitle}</h3>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <FileQuestion className="w-3 h-3" />
                {test.totalQuestions} savol
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {test.duration} daq
              </div>
              <span>{test.totalAttempts} urinish</span>
            </div>

            <Link href={test.testAccess === "PUBLIC" ? `/tests/${test.id}` : "/login"}>
              <button className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
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