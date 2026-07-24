"use client";

import { useState } from "react";
import { X, Copy, Check, Upload, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter } from "next/navigation";
import { validateLatex } from "@/components/MathText";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const AI_PROMPT = `Quyidagi testni JSON formatiga o'tkazing. Faqat JSON qaytaring, boshqa hech narsa yozmang.

FORMAT:
{
  "testTitle": "Test nomi",
  "testType": "DTM",
  "testAccess": "PUBLIC",
  "duration": 90,
  "questions": [
    {
      "questionText": "Savol matni. Formulalar $LaTeX$ formatida: $x^2 + 5x = 0$",
      "questionImage": null,
      "options": ["1-variant matni", "2-variant matni", "3-variant matni", "4-variant matni"],
      "correctAnswer": 0,
      "explanation": ""
    }
  ]
}

QOIDALAR:
- testType qiymatlari: DTM | SAT | MILLIY_SERTIFIKAT | ATTESTATSIYA
- testAccess qiymatlari: PUBLIC | PREMIUM | GROUP
- correctAnswer: 0=A, 1=B, 2=C, 3=D (to'g'ri javob indeksi)
- options massivida A,B,C,D tartibida 4 ta variant bo'lishi SHART
- Formulalar: $x^2$ (inline), $$\\frac{a}{b}$$ (block)
- Agar savolda rasm/grafik bo'lsa questionImage ga null qo'ying, questionText ga "(rasmga qarang)" yozing
- Jadvallar HTML formatida questionText ichida: <table><tr><td>...</td></tr></table>

AGAR SAT TESTI BO'LSA — qo'shimcha:
- SAT Math da ba'zi savollar SPR (raqam kiritish) bo'ladi — variantsiz
- SPR savol uchun: "options": [], "correctAnswer": <butun son javob>
- Masalan: javob 4 bo'lsa → "options": [], "correctAnswer": 4
- Kasrli javob bo'lsa 100 ga ko'paytiring: 3.5 → 350
- MCQ savollar uchun options da 4 ta variant qoldiring`;


const JSON_EXAMPLE = `{
  "testTitle": "Attestatsiya 2026 - Matematika",
  "testType": "ATTESTATSIYA",
  "testAccess": "PUBLIC",
  "duration": 90,
  "questions": [
    {
      "questionText": "Agar $x^2 - 5x + 6 = 0$ bo'lsa, x ning qiymatlarini toping.",
      "questionImage": null,
      "options": ["2 va 3", "1 va 4", "-2 va -3", "1 va 6"],
      "correctAnswer": 0,
      "explanation": "x^2-5x+6=0 => (x-2)(x-3)=0"
    },
    {
      "questionText": "$$\\\\frac{d}{dx}(x^3) = ?$$",
      "questionImage": null,
      "options": ["$3x^2$", "$3x$", "$x^2$", "$2x^3$"],
      "correctAnswer": 0,
      "explanation": ""
    }
  ]
}`;

interface Props {
  onClose: () => void;
  onImported: (testId: string) => void;
}

export default function ImportTestModal({ onClose, onImported }: Props) {
  const { accessToken, user } = useAuthStore();
  const [tab, setTab] = useState<"prompt" | "upload">("prompt");
  const [promptCopied, setPromptCopied] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const copyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleImport = async () => {
    setError("");
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText.trim());
    } catch {
      setError("JSON formati noto'g'ri. AI javobini to'liq ko'chirganingizni tekshiring.");
      return;
    }

    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      setError('"questions" massivi topilmadi yoki bo\'sh.');
      return;
    }

    const isSat = parsed.testType === "SAT";
    const invalid = parsed.questions.find(
      (q: any) =>
        !q.questionText ||
        !Array.isArray(q.options) ||
        (isSat ? (q.options.length !== 0 && q.options.length !== 4) : q.options.length !== 4)
    );
    if (invalid) {
      setError(
        isSat
          ? 'Har bir savol "questionText" va 4 ta "options" (MCQ) yoki bo\'sh "options": [] (SPR) bo\'lishi kerak.'
          : 'Har bir savol "questionText" va 4 ta "options" bo\'lishi kerak.'
      );
      return;
    }

    const latexIssues: string[] = [];
    parsed.questions.forEach((q: { questionText?: string; options?: string[] }, qi: number) => {
      validateLatex(String(q.questionText ?? "")).forEach((err) =>
        latexIssues.push(`${qi + 1}-savol matni: ${err}`)
      );
      (q.options ?? []).forEach((opt: string, oi: number) => {
        validateLatex(String(opt ?? "")).forEach((err) =>
          latexIssues.push(`${qi + 1}-savol, ${["A", "B", "C", "D"][oi]} varianti: ${err}`)
        );
      });
    });
    if (latexIssues.length > 0) {
      setError(
        `LaTeX xatolari topildi, avval JSON'ni tuzating:\n${latexIssues.slice(0, 8).join("\n")}${
          latexIssues.length > 8 ? `\n... yana ${latexIssues.length - 8} ta xato` : ""
        }`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/upload/json-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ...parsed, createdBy: user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik");
      toast.success(`${data.totalQuestions} ta savol yuklandi!`);
      onImported(data.testId);
      onClose();
    } catch (e: any) {
      setError(e.message || "Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl border border-border shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div>
            <h2 className="font-semibold">AI orqali test yuklash</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Istalgan formatdagi testni AI yordamida JSON ga o'tkazing va yuklang
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-border shrink-0">
          <button onClick={() => setTab("prompt")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "prompt" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"}`}>
            1. AI Prompt
          </button>
          <button onClick={() => setTab("upload")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "upload" ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"}`}>
            2. JSON Yuklash
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "prompt" ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Qanday ishlaydi?</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Quyidagi promptni <strong>ChatGPT</strong> yoki <strong>Claude</strong> ga ko'chiring</li>
                  <li>Keyin test matnini (rasmdan, Word dan, PDF dan) yuboring</li>
                  <li>AI JSON qaytaradi — uni keyingi tabda yuklang</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-muted rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                  {AI_PROMPT}
                </pre>
                <button onClick={copyPrompt}
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-muted transition-colors">
                  {promptCopied ? <><Check className="w-3.5 h-3.5 text-green-600" />Nusxalandi!</> : <><Copy className="w-3.5 h-3.5" />Nusxalash</>}
                </button>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Namuna JSON (AI shu formatda qaytaradi):</p>
                <pre className="bg-muted rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
                  {JSON_EXAMPLE}
                </pre>
              </div>

              <button onClick={() => setTab("upload")}
                className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm">
                AI javobini oldim → Yuklashga o'tish
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground">
                AI qaytargan JSON ni to'liq ko'chirib quyidagi maydonga joylashtiring.
                Formulalar, jadvallar, rasmlar (base64) avtomatik qayta ishlanadi.
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">JSON matni</label>
                <textarea
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-xs font-mono bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={14}
                  placeholder={'{\n  "testTitle": "...",\n  "questions": [...]\n}'}
                  value={jsonText}
                  onChange={(e) => { setJsonText(e.target.value); setError(""); }}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 whitespace-pre-line">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button onClick={handleImport} disabled={!jsonText.trim() || loading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {loading ? "Yuklanmoqda..." : "Testni yuklash"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
