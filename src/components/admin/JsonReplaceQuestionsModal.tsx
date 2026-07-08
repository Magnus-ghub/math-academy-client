"use client";

import { useState } from "react";
import { X, Copy, Check, Loader2, AlertCircle, AlertTriangle, Upload } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth.store";
import { getAiPrompt } from "@/lib/ai-test-prompt";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

interface Props {
  testId: string;
  testType: string;
  currentQuestionCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function JsonReplaceQuestionsModal({ testId, testType, currentQuestionCount, onClose, onSuccess }: Props) {
  const { accessToken } = useAuthStore();
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [loading, setLoading] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(getAiPrompt(testType));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const handleReplace = async () => {
    setJsonError("");
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText.trim());
    } catch {
      setJsonError("JSON formati noto'g'ri.");
      return;
    }

    const questions = Array.isArray(parsed) ? parsed : parsed.questions;
    if (!Array.isArray(questions) || questions.length === 0) {
      setJsonError('"questions" massivi topilmadi yoki bo\'sh.');
      return;
    }
    const isSat = testType === "SAT";
    const invalid = questions.find(
      (q: any) =>
        !q.questionText ||
        !Array.isArray(q.options) ||
        (isSat ? (q.options.length !== 0 && q.options.length !== 4) : q.options.length !== 4)
    );
    if (invalid) {
      setJsonError(
        isSat
          ? 'Har bir savol "questionText" va 4 ta "options" (MCQ) yoki bo\'sh "options": [] (SPR) bo\'lishi kerak.'
          : 'Har bir savol "questionText" va 4 ta "options" bo\'lishi kerak.'
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
        body: JSON.stringify({ testId, questions, replace: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik");
      toast.success(`Eski savollar o'chirildi, ${data.totalQuestions} ta yangi savol yuklandi!`);
      onSuccess();
      onClose();
    } catch (e: any) {
      setJsonError(e.message || "Server xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-lg">JSON orqali qayta yaratish</h2>
            <p className="text-xs text-muted-foreground">Mavjud savollarni o&apos;chirib, yangilari bilan almashtirish</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Diqqat: bu amal ushbu testning <strong>barcha {currentQuestionCount} ta mavjud savolini butunlay o&apos;chirib</strong>,
              o&apos;rniga quyidagi JSON&apos;dagi savollarni qo&apos;yadi. Test allaqachon nashr etilgan (publish) bo&apos;lsa ham amal qiladi.
              Bu amalni ortga qaytarib bo&apos;lmaydi.
            </p>
          </div>

          <div className="relative">
            <pre className="bg-muted rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed text-muted-foreground">
              {getAiPrompt(testType)}
            </pre>
            <button
              onClick={copyPrompt}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-muted transition-colors"
            >
              {promptCopied
                ? <><Check className="w-3.5 h-3.5 text-green-600" />Nusxalandi!</>
                : <><Copy className="w-3.5 h-3.5" />Nusxalash</>}
            </button>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">AI qaytargan JSON</label>
            <textarea
              className="w-full border border-border rounded-xl px-3 py-2.5 text-xs font-mono bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={10}
              placeholder={'{\n  "questions": [\n    {\n      "questionText": "...",\n      "options": ["A", "B", "C", "D"],\n      "correctAnswer": 0\n    }\n  ]\n}'}
              value={jsonText}
              onChange={(e) => { setJsonText(e.target.value); setJsonError(""); }}
            />
          </div>

          {jsonError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {jsonError}
            </div>
          )}

          <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Tushundim — mavjud {currentQuestionCount} ta savol butunlay o&apos;chiriladi va o&apos;rniga yuqoridagi JSON&apos;dagi savollar qo&apos;yiladi.
            </span>
          </label>

          <button
            onClick={handleReplace}
            disabled={!jsonText.trim() || !confirmChecked || loading}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {loading ? "Almashtirilmoqda..." : "Eskisini o'chirib, yangisini yuklash"}
          </button>
        </div>
      </div>
    </div>
  );
}
