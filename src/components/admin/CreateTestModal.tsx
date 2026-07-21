"use client";

import { useState, useRef } from "react";
import { X, Plus, Trash2, Upload, Copy, Check, Loader2, AlertCircle, Sparkles, PenLine, FileText } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Input } from "@/components/ui/input";
import { CREATE_TEST, ADD_QUESTION, UPDATE_TEST } from "@/lib/graphql/test";
import { GET_ALL_GROUPS } from "@/lib/graphql/group";
import { useAuthStore } from "@/lib/store/auth.store";
import { countWords, limitWords } from "@/lib/utils";
import { getAiPrompt } from "@/lib/ai-test-prompt";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";
const MAX_DESC_WORDS = 40;

interface ManualQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTestModal({ onClose, onSuccess }: Props) {
  const { accessToken } = useAuthStore();
  const [step, setStep] = useState<"info" | "questions">("info");
  const [questionTab, setQuestionTab] = useState<"ai" | "manual">("ai");
  const [testId, setTestId] = useState<string | null>(null);

  // Step 1 — info
  const [form, setForm] = useState({
    testTitle: "",
    testType: "DTM",
    dtmType: "",
    testDifficulty: "STANDART",
    testAccess: "PUBLIC",
    testBlock: "",
    duration: 30,
    groupId: "",
    testDesc: "",
  });

  // Step 2 — AI/JSON tab
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [jsonLoading, setJsonLoading] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  // Step 2 — Manual tab
  const [questions, setQuestions] = useState<ManualQuestion[]>([
    { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" },
  ]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 2 — PDF upload
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfUploading, setPdfUploading] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);

  // Step 2 — YouTube & Analysis
  const [testYoutubeUrl, setTestYoutubeUrl] = useState("");
  const [testAnalysis, setTestAnalysis] = useState("");

  const { data: groupsData } = useQuery<{ getAllGroups: any[] }>(GET_ALL_GROUPS);
  const groups = groupsData?.getAllGroups || [];

  const [updateTest] = useMutation(UPDATE_TEST);
  const [createTest, { loading: creating }] = useMutation(CREATE_TEST, {
    onCompleted: (data: any) => {
      setTestId(data.createTest.id);
      setStep("questions");
      toast.success("Test yaratildi! Endi savollarni qo'shing.");
    },
    onError: () => toast.error("Test yaratishda xatolik"),
  });

  const [addQuestion, { loading: adding }] = useMutation(ADD_QUESTION);

  const handleCreateTest = () => {
    if (!form.testTitle.trim()) return;
    createTest({
      variables: {
        input: {
          testTitle: form.testTitle,
          testType: form.testType,
          dtmType: form.dtmType || undefined,
          testDifficulty: form.testDifficulty,
          testAccess: form.testAccess,
          duration: Number(form.duration),
          testDesc: form.testDesc || undefined,
          groupId: form.groupId || undefined,
          testBlock: form.testBlock || undefined,
        },
      },
    });
  };

  // AI/JSON import
  const handleJsonImport = async () => {
    if (!testId) return;
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
    const isSat = form.testType === "SAT";
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

    setJsonLoading(true);
    try {
      const res = await fetch(`${API_BASE}/upload/json-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          testId,
          questions,
          testYoutubeUrl: testYoutubeUrl || undefined,
          testAnalysis: testAnalysis || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik");
      toast.success(`${data.totalQuestions} ta savol yuklandi!`);
      onSuccess();
      onClose();
    } catch (e: any) {
      setJsonError(e.message || "Server xatosi");
    } finally {
      setJsonLoading(false);
    }
  };

  // DOCX upload
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !testId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("testId", testId);
    try {
      const res = await fetch(`${API_BASE}/upload/docx-test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.totalQuestions} ta savol yuklandi!`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Xatolik");
      }
    } catch {
      toast.error("Yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  // Manual questions
  const addNewQuestion = () =>
    setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }]);

  const removeQuestion = (i: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (i: number, field: string, value: any) =>
    setQuestions(questions.map((q, idx) => (idx === i ? { ...q, [field]: value } : q)));

  const updateOption = (qIdx: number, optIdx: number, value: string) =>
    setQuestions(
      questions.map((q, i) => {
        if (i !== qIdx) return q;
        const opts = [...q.options];
        opts[optIdx] = value;
        return { ...q, options: opts };
      })
    );

  const handleSaveManual = async () => {
    if (!testId) return;
    const valid = questions.filter((q) => q.questionText.trim());
    if (valid.length === 0) {
      toast.error("Kamida 1 ta savol kiriting");
      return;
    }
    for (let i = 0; i < valid.length; i++) {
      await addQuestion({
        variables: {
          input: {
            testId,
            questionText: valid[i].questionText,
            options: valid[i].options,
            correctAnswer: valid[i].correctAnswer,
            explanation: valid[i].explanation || undefined,
            orderIndex: i + 1,
          },
        },
      });
    }
    toast.success(`${valid.length} ta savol saqlandi!`);
    if (testId && (testYoutubeUrl || testAnalysis)) {
      await updateTest({ variables: { testId, input: {
        testYoutubeUrl: testYoutubeUrl || undefined,
        testAnalysis: testAnalysis || undefined,
      }}});
    }
    onSuccess();
    onClose();
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !testId) return;
    setPdfUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/upload/pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setPdfUrl(data.url);
        await updateTest({ variables: { testId, input: { testPdfUrl: data.url } } });
        toast.success("PDF yuklandi");
      } else {
        toast.error("PDF yuklanmadi");
      }
    } catch {
      toast.error("PDF yuklanmadi");
    } finally {
      setPdfUploading(false);
      e.target.value = "";
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(getAiPrompt(form.testType));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-lg">Yangi test yaratish</h2>
            <p className="text-xs text-muted-foreground">
              {step === "info" ? "1-qadam: Test ma'lumotlari" : "2-qadam: Savollarni qo'shish"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* ── STEP 1: INFO ── */}
          {step === "info" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Test nomi *</label>
                <Input
                  placeholder="DTM 2026 - Variant 1"
                  value={form.testTitle}
                  onChange={(e) => setForm({ ...form, testTitle: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Test turi *</label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    value={form.testType}
                    onChange={(e) => setForm({ ...form, testType: e.target.value, dtmType: "" })}
                  >
                    <option value="DTM">DTM</option>
                    <option value="SAT">SAT</option>
                    <option value="MILLIY_SERTIFIKAT">Milliy Sertifikat</option>
                    <option value="ATTESTATSIYA">Attestatsiya</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Kirish turi *</label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    value={form.testAccess}
                    onChange={(e) => setForm({ ...form, testAccess: e.target.value })}
                  >
                    <option value="PUBLIC">Ommaviy</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="GROUP">Guruh</option>
                  </select>
                </div>
              </div>

              {form.testAccess === "GROUP" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Guruh *</label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    value={form.groupId}
                    onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                  >
                    <option value="">Guruh tanlang</option>
                    {groups.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.groupName}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.testType === "DTM" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">DTM turi *</label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    value={form.dtmType}
                    onChange={(e) => setForm({ ...form, dtmType: e.target.value })}
                  >
                    <option value="">Tanlanmagan</option>
                    <option value="MAJBURIY">Majburiy blok</option>
                    <option value="ASOSIY">Asosiy blok</option>
                    <option value="FULL">Full DTM</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Qiyinlik darajasi</label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    value={form.testDifficulty}
                    onChange={(e) => setForm({ ...form, testDifficulty: e.target.value })}
                  >
                    <option value="EASY">Oson</option>
                    <option value="STANDART">Standart</option>
                    <option value="HARD">Qiyin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Vaqt (daqiqada) *</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={180}
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Tavsif</label>
                  <span className="text-xs text-muted-foreground">
                    {countWords(form.testDesc)}/{MAX_DESC_WORDS} so'z
                  </span>
                </div>
                <textarea
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
                  rows={2}
                  placeholder="Test haqida..."
                  value={form.testDesc}
                  onChange={(e) => setForm({ ...form, testDesc: limitWords(e.target.value, MAX_DESC_WORDS) })}
                />
              </div>

              <button
                onClick={handleCreateTest}
                disabled={creating || !form.testTitle.trim()}
                className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {creating ? "Yaratilmoqda..." : "Davom etish →"}
              </button>
            </div>
          )}

          {/* ── STEP 2: QUESTIONS ── */}
          {step === "questions" && (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                <button
                  onClick={() => setQuestionTab("ai")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    questionTab === "ai" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI / JSON import
                </button>
                <button
                  onClick={() => setQuestionTab("manual")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                    questionTab === "manual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Qo'lda kiritish
                </button>
              </div>

              {/* AI/JSON tab */}
              {questionTab === "ai" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Qanday ishlaydi?</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                      <li>Quyidagi promptni nusxalang va ChatGPT / Claude ga yuboring</li>
                      <li>Test rasmini yoki matnini ham yuboring</li>
                      <li>AI qaytargan JSON ni quyidagi maydonga joylashtiring</li>
                    </ol>
                  </div>

                  <div className="relative">
                    <pre className="bg-muted rounded-xl p-4 text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed text-muted-foreground">
                      {getAiPrompt(form.testType)}
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

                  <button
                    onClick={handleJsonImport}
                    disabled={!jsonText.trim() || jsonLoading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    {jsonLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {jsonLoading ? "Yuklanmoqda..." : "Savollarni yuklash"}
                  </button>

                  {/* DOCX divider */}
                  {/* <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">yoki Word fayl</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <input ref={fileRef} type="file" accept=".docx" className="hidden" onChange={handleDocxUpload} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Yuklanmoqda..." : ".docx fayldan yuklash"}
                  </button> */}
                </div>
              )}

              {/* Manual tab */}
              {questionTab === "manual" && (
                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="bg-muted/30 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-primary">{qIdx + 1}-savol</span>
                        <button
                          onClick={() => removeQuestion(qIdx)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      <textarea
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
                        rows={2}
                        placeholder="Savol matnini kiriting..."
                        value={q.questionText}
                        onChange={(e) => updateQuestion(qIdx, "questionText", e.target.value)}
                      />

                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuestion(qIdx, "correctAnswer", i)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                q.correctAnswer === i
                                  ? "border-primary bg-primary text-white"
                                  : "border-border hover:border-primary"
                              }`}
                            >
                              {["A", "B", "C", "D"][i]}
                            </button>
                            <Input
                              placeholder={`${["A", "B", "C", "D"][i]} variant`}
                              value={opt}
                              onChange={(e) => updateOption(qIdx, i, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>

                      <Input
                        placeholder="Javob izohi (ixtiyoriy)"
                        value={q.explanation}
                        onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)}
                      />
                    </div>
                  ))}

                  <button
                    onClick={addNewQuestion}
                    className="w-full border-2 border-dashed border-border hover:border-primary rounded-2xl py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Savol qo'shish
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("info")}
                      className="flex-1 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                    >
                      ← Orqaga
                    </button>
                    <button
                      onClick={handleSaveManual}
                      disabled={adding}
                      className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
                    >
                      {adding ? "Saqlanmoqda..." : "Saqlash ✓"}
                    </button>
                  </div>
                </div>
              )}

            {/* ── Optional PDF ── */}
            {/* <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                PDF fayl (ixtiyoriy)
              </p>
              {pdfUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 bg-green-50">
                  <FileText className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-xs font-medium text-green-800 flex-1 truncate">
                    {pdfUrl.split("/").pop()}
                  </span>
                  <button
                    onClick={() => setPdfUrl("")}
                    className="p-1 rounded hover:bg-green-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-green-700" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={pdfRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handlePdfUpload}
                  />
                  <button
                    onClick={() => pdfRef.current?.click()}
                    disabled={pdfUploading || !testId}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-xl py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
                  >
                    {pdfUploading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda...</>
                      : <><Upload className="w-4 h-4" /> PDF biriktirish (max 50 MB)</>}
                  </button>
                </>
              )}
            </div> */}

            {/* ── YouTube & AI Analysis ── */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tahlil (ixtiyoriy)
              </p>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">YouTube video link</label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={testYoutubeUrl}
                  onChange={(e) => setTestYoutubeUrl(e.target.value)}
                  disabled={!testId}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">AI / Matn tahlili</label>
                <textarea
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-40"
                  rows={3}
                  placeholder="Bu test bo'yicha umumiy tahlil yoki AI izoh..."
                  value={testAnalysis}
                  onChange={(e) => setTestAnalysis(e.target.value)}
                  disabled={!testId}
                />
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
