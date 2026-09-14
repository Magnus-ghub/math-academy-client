"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { ChevronLeft, Plus, Trash2, Image as ImageIcon, X, Loader2, Save, BookOpen, FileText, Upload, Sparkles, Copy, Check, AlertCircle, Eye } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  GET_TEST,
  GET_QUESTIONS,
  UPDATE_TEST,
  ADD_QUESTION,
  UPDATE_QUESTION,
  DELETE_QUESTION,
} from "@/lib/graphql/test";
import { useAuthStore } from "@/lib/store/auth.store";
import { countWords, limitWords } from "@/lib/utils";
import { JsonReplaceQuestionsModal } from "@/components/admin/JsonReplaceQuestionsModal";
import { ImportHistoricalResultsModal } from "@/components/admin/ImportHistoricalResultsModal";
import { LatexPreview } from "@/components/admin/LatexPreview";
import { AI_PROMPT_SINGLE_QUESTION } from "@/lib/ai-test-prompt";
import { validateLatex } from "@/components/MathText";
import { toast } from "sonner";

const MAX_DESC_WORDS = 40;

// Haqiqiy SAT imtihonidagi bilan bir xil — har bir modulda 22 tadan savol
// (sat/[id]/page.tsx dagi MODULE_QUESTIONS bilan mos bo'lishi shart).
const SAT_MODULE_QUESTIONS = 22;

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

interface QuestionRow {
  uid: string;
  id?: string;
  questionType?: string;
  section?: string;
  groupPrompt?: string;
  questionText: string;
  questionImage: string;
  options: string[];
  optionImages: string[];
  optionUploading: boolean[];
  correctAnswer: number;
  correctAnswerB?: number | null;
  explanation: string;
  youtubeUrl: string;
  analysis: string;
  uploading: boolean;
  dirty: boolean;
  isNew: boolean;
}

interface TestData {
  getTest?: {
    id?: string;
    testTitle?: string;
    testType?: string;
    dtmType?: string;
    testDifficulty?: string;
    testBlock?: string;
    testDesc?: string;
    duration?: number;
    testAccess?: string;
    testStatus?: string;
    testPrice?: number;
    testPdfUrl?: string;
    testYoutubeUrl?: string;
    testAnalysis?: string;
    closesAt?: string;
  };
}

interface QuestionsData {
  getQuestions?: Array<{
    id: string;
    questionType?: string;
    section?: string;
    groupPrompt?: string;
    questionText?: string;
    questionImage?: string;
    options?: string[];
    optionImages?: string[];
    correctAnswer?: number;
    correctAnswerB?: number | null;
    explanation?: string;
  }>;
}

interface AddQuestionData {
  addQuestion?: {
    id: string;
  };
}

// Brauzer <img> sifatida ko'rsata oladigan formatlar. MS Word rasmni
// ko'pincha shu ro'yxatdan tashqari — EMF/WMF (Windows vektor formati) —
// sifatida base64'ga qo'shadi; bunday holda fayl "muvaffaqiyatli"
// yaratilgandek ko'rinadi-yu, aslida brauzer uni hech qachon ko'rsata olmaydi
// (singan rasm bo'lib qoladi, xato ham chiqmaydi) — shuning uchun alohida
// tekshiramiz.
const BROWSER_SAFE_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
]);

function dataUrlToFile(dataUrl: string, filename = "pasted-image.png"): File | null {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  const [, mime] = match;
  if (!BROWSER_SAFE_IMAGE_TYPES.has(mime.toLowerCase())) return null;
  const [, , base64] = match;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

function makeRow(q?: any): QuestionRow {
  return {
    uid: q?.id ?? `new-${Date.now()}-${Math.random()}`,
    id: q?.id,
    questionType: q?.questionType,
    section: q?.section,
    groupPrompt: q?.groupPrompt,
    questionText: q?.questionText ?? "",
    questionImage: q?.questionImage ?? "",
    options: q?.options ?? ["", "", "", ""],
    optionImages: q?.optionImages ?? ["", "", "", ""],
    optionUploading: [false, false, false, false],
    correctAnswer: q?.correctAnswer ?? 0,
    correctAnswerB: q?.correctAnswerB,
    explanation: q?.explanation ?? "",
    youtubeUrl: q?.youtubeUrl ?? "",
    analysis: q?.analysis ?? "",
    uploading: false,
    dirty: false,
    isNew: !q?.id,
  };
}

function EditTestPageContent() {
  const { id: testId } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightQuestionId = searchParams.get("questionId");
  const { accessToken } = useAuthStore();
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "questions">("questions");
  const [showJsonReplace, setShowJsonReplace] = useState(false);
  const [showImportResults, setShowImportResults] = useState(false);
  const [showTestAnalysisPreview, setShowTestAnalysisPreview] = useState(false);

  const { data: testData, loading: testLoading } = useQuery<TestData, { testId: string }>(GET_TEST, {
    variables: { testId },
    skip: !testId,
  });

  const { data: questionsData, loading: questionsLoading, refetch: refetchQuestions } = useQuery<QuestionsData, { testId: string }>(GET_QUESTIONS, {
    variables: { testId },
    skip: !testId,
    fetchPolicy: "network-only",
  });

  const test = testData?.getTest;

  const [testInfo, setTestInfo] = useState({
    testTitle: "",
    testType: "DTM",
    dtmType: "",
    testDifficulty: "STANDART",
    testBlock: "",
    testDesc: "",
    duration: 30,
    testAccess: "PUBLIC",
    testStatus: "DRAFT",
    testPrice: "",
    testPdfUrl: "",
    testYoutubeUrl: "",
    testAnalysis: "",
    closesAt: "",
  });
  const [pdfUploading, setPdfUploading] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (test) {
      setTestInfo({
        testTitle: test.testTitle ?? "",
        testType: test.testType ?? "DTM",
        dtmType: test.dtmType ?? "",
        testDifficulty: test.testDifficulty ?? "STANDART",
        testBlock: test.testBlock ?? "",
        testDesc: test.testDesc ?? "",
        duration: test.duration ?? 30,
        testAccess: test.testAccess ?? "PUBLIC",
        testStatus: test.testStatus ?? "DRAFT",
        testPrice: test.testPrice ? String(test.testPrice) : "",
        testPdfUrl: test.testPdfUrl ?? "",
        testYoutubeUrl: test.testYoutubeUrl ?? "",
        testAnalysis: test.testAnalysis ?? "",
        closesAt: test.closesAt ? new Date(test.closesAt).toISOString().slice(0, 16) : "",
      });
    }
  }, [test]);

  useEffect(() => {
    if (questionsData?.getQuestions) {
      setQuestions(questionsData.getQuestions.map(makeRow));
    }
  }, [questionsData]);

  // Report'dan "Ko'rish" havolasi orqali kelinganda (?questionId=...) o'sha
  // savolga avtomatik scroll qilib, bir muddat ajratib ko'rsatamiz
  useEffect(() => {
    if (!highlightQuestionId || questions.length === 0) return;
    const el = document.getElementById(`question-${highlightQuestionId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightQuestionId, questions.length]);

  const [updateTest] = useMutation(UPDATE_TEST, {
    onError: () => toast.error("Test ma'lumotlari saqlanmadi"),
  });
  const [addQuestion] = useMutation<AddQuestionData>(ADD_QUESTION, {
    onError: () => toast.error("Savol qo'shishda xatolik"),
  });
  const [updateQuestion] = useMutation(UPDATE_QUESTION, {
    onError: () => toast.error("Savol yangilanmadi"),
  });
  const [deleteQuestion] = useMutation(DELETE_QUESTION, {
    onError: () => toast.error("Savol o'chirilmadi"),
  });

  const uploadPdf = async (file: File) => {
    setPdfUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/upload/pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setTestInfo((prev) => ({ ...prev, testPdfUrl: data.url }));
        toast.success("PDF yuklandi");
      } else {
        toast.error("PDF yuklanmadi");
      }
    } catch {
      toast.error("PDF yuklanmadi");
    } finally {
      setPdfUploading(false);
    }
  };

  const uploadImage = async (file: File, uid: string) => {
    setQ(uid, "uploading", true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) setQ(uid, "questionImage", data.url);
      else toast.error("Rasm yuklanmadi");
    } catch {
      toast.error("Rasm yuklanmadi");
    } finally {
      setQ(uid, "uploading", false);
    }
  };

  const setQ = (uid: string, field: keyof QuestionRow, value: any) =>
    setQuestions((qs) => qs.map((q) => q.uid === uid ? { ...q, [field]: value, dirty: true } : q));

  const setQBulk = (uid: string, fields: Partial<QuestionRow>) =>
    setQuestions((qs) => qs.map((q) => q.uid === uid ? { ...q, ...fields, dirty: true } : q));

  const setOption = (uid: string, idx: number, value: string) =>
    setQuestions((qs) => qs.map((q) => {
      if (q.uid !== uid) return q;
      const options = [...q.options];
      options[idx] = value;
      return { ...q, options, dirty: true };
    }));

  const setOptionImage = (uid: string, idx: number, value: string) =>
    setQuestions((qs) => qs.map((q) => {
      if (q.uid !== uid) return q;
      const optionImages = [...q.optionImages];
      optionImages[idx] = value;
      return { ...q, optionImages, dirty: true };
    }));

  const setOptionUploading = (uid: string, idx: number, value: boolean) =>
    setQuestions((qs) => qs.map((q) => {
      if (q.uid !== uid) return q;
      const optionUploading = [...q.optionUploading];
      optionUploading[idx] = value;
      return { ...q, optionUploading };
    }));

  const uploadOptionImage = async (file: File, uid: string, idx: number) => {
    setOptionUploading(uid, idx, true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) setOptionImage(uid, idx, data.url);
      else toast.error("Rasm yuklanmadi");
    } catch {
      toast.error("Rasm yuklanmadi");
    } finally {
      setOptionUploading(uid, idx, false);
    }
  };

  const removeQuestion = (uid: string, dbId?: string) => {
    setQuestions((qs) => qs.filter((q) => q.uid !== uid));
    if (dbId) setDeletedIds((ids) => [...ids, dbId]);
  };

  const handleSave = async () => {
    const invalid = questions.some((q) => !q.questionText.trim() || q.options.some((o) => !o.trim()));
    if (invalid) { toast.error("Barcha savol va variantlarni to'ldiring"); return; }

    setSaving(true);
    try {
      // Test info update
      await updateTest({
        variables: {
          testId,
          input: {
            testTitle: testInfo.testTitle,
            testType: testInfo.testType,
            dtmType: testInfo.dtmType || undefined,
            testDifficulty: testInfo.testDifficulty,
            testBlock: testInfo.testBlock || undefined,
            testDesc: testInfo.testDesc || undefined,
            duration: Number(testInfo.duration),
            testAccess: testInfo.testAccess,
            testPrice: testInfo.testAccess === "PREMIUM" && testInfo.testPrice
              ? Number(testInfo.testPrice)
              : undefined,
            testPdfUrl: testInfo.testPdfUrl || undefined,
            testYoutubeUrl: testInfo.testYoutubeUrl || undefined,
            testAnalysis: testInfo.testAnalysis || undefined,
            closesAt: testInfo.closesAt ? new Date(testInfo.closesAt).toISOString() : null,
          },
        },
      });

      // Delete removed questions
      for (const qId of deletedIds) {
        await deleteQuestion({ variables: { questionId: qId } });
      }
      setDeletedIds([]);

      // Save questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.dirty && !q.isNew) continue;

        const payload = {
          questionText: q.questionText,
          questionImage: q.questionImage || undefined,
          groupPrompt: q.groupPrompt || undefined,
          options: q.options,
          optionImages: q.optionImages,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || undefined,
          youtubeUrl: q.youtubeUrl || undefined,
          analysis: q.analysis || undefined,
        };

        if (q.isNew) {
          const res = await addQuestion({
            variables: {
              input: { testId, orderIndex: i + 1, ...payload },
            },
          });
          const newId = res.data?.addQuestion?.id;
          if (newId) {
            setQuestions((qs) => qs.map((x) =>
              x.uid === q.uid ? { ...x, id: newId, isNew: false, dirty: false } : x
            ));
          }
        } else if (q.id) {
          await updateQuestion({ variables: { questionId: q.id, input: payload } });
          setQ(q.uid, "dirty", false);
        }
      }

      toast.success("Test saqlandi");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSave();
    await updateTest({ variables: { testId, input: { testStatus: "PUBLISHED" } } });
    toast.success("Test nashr etildi!");
    router.push("/admin/tests");
  };

  if (testLoading || questionsLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-muted rounded-2xl h-32 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/tests">
            <button className="p-2 rounded-xl hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold truncate max-w-sm">{test?.testTitle ?? "Test tahrirlash"}</h1>
            <p className="text-xs text-muted-foreground">{questions.length} ta savol</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`${testInfo.testType === "SAT" ? `/sat/${testId}` : `/exam/${testId}`}?retake=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            title="Talaba ko'radigan sahifada ko'ring — hali nashr etilmagan bo'lsa ham faqat siz (admin/o'qituvchi) ko'ra olasiz. Natija saqlanmaydi, istalgan vaqt qayta ko'rishingiz mumkin"
          >
            <Eye className="w-4 h-4" />
            Ko'rish
          </a>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Saqlash
          </button>
          {test?.testStatus !== "PUBLISHED" && (
            <button onClick={handlePublish} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">
              <BookOpen className="w-4 h-4" />
              Nashr etish
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 rounded-xl p-1 w-fit">
        {(["questions", "info"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t === "questions" ? `Savollar (${questions.length})` : "Test ma'lumotlari"}
          </button>
        ))}
      </div>

      {activeTab === "info" ? (
        <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Test nomi</label>
            <Input value={testInfo.testTitle} onChange={(e) => setTestInfo({ ...testInfo, testTitle: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Test turi</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.testType} onChange={(e) => setTestInfo({ ...testInfo, testType: e.target.value, dtmType: "" })}>
                <option value="DTM">DTM</option>
                <option value="SAT">SAT</option>
                <option value="MILLIY_SERTIFIKAT">Milliy Sertifikat</option>
                <option value="ATTESTATSIYA">Attestatsiya</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Kirish turi</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.testAccess} onChange={(e) => setTestInfo({ ...testInfo, testAccess: e.target.value })}>
                <option value="PUBLIC">Ommaviy</option>
                <option value="PREMIUM">Premium</option>
                <option value="GROUP">Guruh</option>
              </select>
            </div>
          </div>

          {testInfo.testType === "DTM" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">DTM turi</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.dtmType} onChange={(e) => setTestInfo({ ...testInfo, dtmType: e.target.value })}>
                <option value="">Tanlanmagan</option>
                <option value="MAJBURIY">Majburiy blok</option>
                <option value="ASOSIY">Asosiy blok</option>
                <option value="FULL">Full DTM</option>
              </select>
            </div>
          )}

          {testInfo.testType === "MILLIY_SERTIFIKAT" && testId && (
            <div className="p-4 bg-muted/40 rounded-xl">
              <p className="text-sm font-medium mb-1">Rasch kogortasi</p>
              <p className="text-xs text-muted-foreground mb-3">
                Eski Excel-metodologiyadan xom ballarni import qilib, bu testning Rasch
                kogortasini boyiting — yangi talabalar tezroq haqiqiy T-ball oladi.
              </p>
              <button
                type="button"
                onClick={() => setShowImportResults(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <Upload className="w-4 h-4" />
                Eski natijalarni import qilish
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Qiyinlik darajasi</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.testDifficulty} onChange={(e) => setTestInfo({ ...testInfo, testDifficulty: e.target.value })}>
                <option value="EASY">Oson</option>
                <option value="STANDART">Standart</option>
                <option value="HARD">Qiyin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Vaqt (daqiqa)</label>
              <Input type="number" min={5} max={180} value={testInfo.duration}
                onChange={(e) => setTestInfo({ ...testInfo, duration: Number(e.target.value) })} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Yopilish sanasi (ixtiyoriy)</label>
            <div className="flex items-center gap-2">
              <Input
                type="datetime-local"
                value={testInfo.closesAt}
                onChange={(e) => setTestInfo({ ...testInfo, closesAt: e.target.value })}
                className="flex-1"
              />
              {testInfo.closesAt && (
                <button
                  type="button"
                  onClick={() => setTestInfo({ ...testInfo, closesAt: "" })}
                  className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors shrink-0"
                >
                  Doimiy ochiq qilish
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Belgilansa, shu sanadan keyin test avtomatik yopiladi (arxivlanadi) va yangi urinish qabul qilinmaydi.
              Bo'sh qoldirilsa, test doimiy ochiq qoladi.
            </p>
          </div>

          {testInfo.testAccess === "PREMIUM" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Narx (UZS)</label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  placeholder="Masalan: 50000"
                  value={testInfo.testPrice}
                  onChange={(e) => setTestInfo({ ...testInfo, testPrice: e.target.value })}
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  UZS
                </span>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">Tavsif</label>
              <span className="text-xs text-muted-foreground">
                {countWords(testInfo.testDesc)}/{MAX_DESC_WORDS} so'z
              </span>
            </div>
            <textarea className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
              rows={3} value={testInfo.testDesc}
              onChange={(e) => setTestInfo({ ...testInfo, testDesc: limitWords(e.target.value, MAX_DESC_WORDS) })} />
          </div>

          {/* YouTube link */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              YouTube video link{" "}
              <span className="text-muted-foreground font-normal">(ixtiyoriy — umumiy tahlil uchun)</span>
            </label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={testInfo.testYoutubeUrl}
              onChange={(e) => setTestInfo({ ...testInfo, testYoutubeUrl: e.target.value })}
            />
          </div>

          {/* AI Analysis */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">
                AI / Matn tahlili{" "}
                <span className="text-muted-foreground font-normal">(ixtiyoriy — test bo'yicha umumiy tahlil)</span>
              </label>
              {testInfo.testAnalysis.trim() && (
                <button
                  type="button"
                  onClick={() => setShowTestAnalysisPreview((v) => !v)}
                  className="text-xs font-medium text-primary hover:underline shrink-0"
                >
                  {showTestAnalysisPreview ? "Preview'ni yashirish" : "Preview ko'rish"}
                </button>
              )}
            </div>
            <textarea
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={5}
              placeholder="Bu test bo'yicha tahlil, tushuntirish yoki AI tomonidan tayyorlangan izoh..."
              value={testInfo.testAnalysis}
              onChange={(e) => setTestInfo({ ...testInfo, testAnalysis: e.target.value })}
            />
            {showTestAnalysisPreview && (
              <div className="mt-2">
                <LatexPreview text={testInfo.testAnalysis} />
              </div>
            )}
          </div>

          {/* PDF upload */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              PDF fayl{" "}
              <span className="text-muted-foreground font-normal">(ixtiyoriy)</span>
            </label>
            {testInfo.testPdfUrl ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 bg-green-50">
                <FileText className="w-5 h-5 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">
                    {testInfo.testPdfUrl.split("/").pop()}
                  </p>
                  <p className="text-xs text-green-600">PDF fayl yuklangan</p>
                </div>
                <button
                  onClick={() => setTestInfo((p) => ({ ...p, testPdfUrl: "" }))}
                  className="p-1.5 rounded-lg hover:bg-green-100 transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-green-700" />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={pdfRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadPdf(f);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => pdfRef.current?.click()}
                  disabled={pdfUploading}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {pdfUploading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda...</>
                    : <><Upload className="w-4 h-4" /> PDF fayl tanlash (max 50 MB)</>}
                </button>
              </>
            )}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Saqlash
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowJsonReplace(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              JSON orqali qayta yaratish
            </button>
          </div>

          {questions.map((q, i) => (
            <div key={q.uid}>
              {testInfo.testType === "SAT" && i === 0 && (
                <SatModuleDivider module={1} from={1} to={SAT_MODULE_QUESTIONS} />
              )}
              {testInfo.testType === "SAT" && i === SAT_MODULE_QUESTIONS && (
                <SatModuleDivider module={2} from={1} to={SAT_MODULE_QUESTIONS} />
              )}
              <EditQuestionCard
                q={q}
                index={
                  testInfo.testType === "SAT" && i >= SAT_MODULE_QUESTIONS
                    ? i - SAT_MODULE_QUESTIONS
                    : i
                }
                highlighted={!!q.id && q.id === highlightQuestionId}
                onUpdate={setQ}
                onBulkUpdate={setQBulk}
                onUpdateOption={setOption}
                onRemove={() => removeQuestion(q.uid, q.id)}
                onImagePick={(file) => uploadImage(file, q.uid)}
                onOptionImagePick={(file, idx) => uploadOptionImage(file, q.uid, idx)}
                onOptionImageRemove={(idx) => setOptionImage(q.uid, idx, "")}
                canRemove={questions.length > 1}
              />
            </div>
          ))}

          <button
            onClick={() => setQuestions((qs) => [...qs, makeRow()])}
            className="w-full border-2 border-dashed border-border hover:border-primary rounded-2xl py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Savol qo'shish
          </button>
        </div>
      )}

      {showJsonReplace && testId && (
        <JsonReplaceQuestionsModal
          testId={testId}
          testType={testInfo.testType}
          currentQuestionCount={questions.length}
          onClose={() => setShowJsonReplace(false)}
          onSuccess={() => refetchQuestions()}
        />
      )}

      {showImportResults && testId && (
        <ImportHistoricalResultsModal
          testId={testId}
          currentQuestionCount={questions.length}
          onClose={() => setShowImportResults(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}

export default function EditTestPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="bg-muted rounded-2xl h-32 animate-pulse" />)}
    </div>}>
      <EditTestPageContent />
    </Suspense>
  );
}

function SatModuleDivider({ module, from, to }: { module: number; from: number; to: number }) {
  return (
    <div className={`flex items-center gap-3 ${module === 1 ? "mb-4" : "mt-2 mb-4"}`}>
      <span className="text-xs font-bold uppercase tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-full shrink-0">
        Modul {module}
      </span>
      <span className="text-xs text-muted-foreground shrink-0">{from}-{to} savollar</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function EditQuestionCard({ q, index, highlighted, onUpdate, onBulkUpdate, onUpdateOption, onRemove, onImagePick, onOptionImagePick, onOptionImageRemove, canRemove }: {
  q: QuestionRow;
  index: number;
  highlighted?: boolean;
  onUpdate: (uid: string, field: keyof QuestionRow, value: string | number | boolean | string[]) => void;
  onBulkUpdate: (uid: string, fields: Partial<QuestionRow>) => void;
  onUpdateOption: (uid: string, idx: number, value: string) => void;
  onRemove: () => void;
  onImagePick: (file: File) => void;
  onOptionImagePick: (file: File, idx: number) => void;
  onOptionImageRemove: (idx: number) => void;
  canRemove: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const optionFileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const [showAnalysisPreview, setShowAnalysisPreview] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT_SINGLE_QUESTION);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const applyJson = () => {
    setJsonError("");
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText.trim());
    } catch {
      setJsonError("JSON formati noto'g'ri.");
      return;
    }

    if (!parsed.questionText || !Array.isArray(parsed.options) || parsed.options.length !== 4) {
      setJsonError('"questionText" va 4 ta "options" bo\'lishi kerak.');
      return;
    }

    const latexIssues: string[] = [];
    validateLatex(String(parsed.questionText)).forEach((err) => latexIssues.push(`Savol matni: ${err}`));
    parsed.options.forEach((opt: string, oi: number) => {
      validateLatex(String(opt ?? "")).forEach((err) =>
        latexIssues.push(`${["A", "B", "C", "D"][oi]} varianti: ${err}`)
      );
    });
    if (latexIssues.length > 0) {
      setJsonError(`LaTeX xatolari topildi:\n${latexIssues.join("\n")}`);
      return;
    }

    onBulkUpdate(q.uid, {
      questionText: parsed.questionText,
      questionImage: parsed.questionImage || "",
      options: parsed.options,
      correctAnswer: Number(parsed.correctAnswer ?? 0),
      explanation: parsed.explanation || "",
      youtubeUrl: parsed.youtubeUrl || "",
      analysis: parsed.analysis || "",
    });
    setJsonText("");
    setShowJson(false);
    toast.success('Savol JSON orqali to\'ldirildi — "Saqlash"ni bosishni unutmang');
  };

  // Umumiy — savol yoki variant, qaysi biriga joylashtirilsa shu joyga
  // (onFile) boradi. Skrinshot/Paint "image/*" item sifatida, ba'zi
  // brauzerlarda "files" ro'yxatida, MS Word esa odatda HTML fragmentidagi
  // <img src="data:..."> orqali keladi (mahalliy "file://" yo'lni brauzer
  // xavfsizlik sababli o'qiy olmaydi, shuning uchun faqat base64 holatini
  // tiklaymiz, aks holda foydalanuvchiga sababini tushuntiramiz).
  const extractPastedImage = (e: React.ClipboardEvent, onFile: (file: File) => void) => {
    const items = Array.from(e.clipboardData?.items ?? []);

    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) onFile(file);
      return;
    }

    const fileFromList = Array.from(e.clipboardData?.files ?? []).find((f) =>
      f.type.startsWith("image/")
    );
    if (fileFromList) {
      e.preventDefault();
      onFile(fileFromList);
      return;
    }

    const htmlItem = items.find((item) => item.type === "text/html");
    if (htmlItem) {
      e.preventDefault();
      htmlItem.getAsString((html) => {
        const match = html.match(/<img[^>]+src=["'](data:image\/[^"']+)["']/i);
        const file = match ? dataUrlToFile(match[1]) : null;
        if (file) {
          onFile(file);
        } else {
          toast.error(
            "Word'dan nusxalangan rasmni to'g'ridan-to'g'ri joylashtirib bo'lmadi. Avval rasmni kompyuteringizga saqlang va \"Fayl tanlash\" orqali yuklang."
          );
        }
      });
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => extractPastedImage(e, onImagePick);

  return (
    <div
      id={q.id ? `question-${q.id}` : undefined}
      onPaste={handlePaste}
      className={`bg-background rounded-2xl border p-5 transition-colors ${
        highlighted
          ? "border-amber-400 ring-2 ring-amber-300"
          : q.dirty || q.isNew ? "border-primary/40" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-primary">{index + 1}-savol</span>
          {q.isNew && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Yangi</span>}
          {q.dirty && !q.isNew && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">O'zgartirildi</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowJson((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
            title="LaTeX yozish qiyin bo'lsa, AI yordamida JSON tayyorlab shu yerga joylashtiring"
          >
            <Sparkles className="w-3.5 h-3.5" />
            JSON orqali to'ldirish
          </button>
          {canRemove && (
            <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
        </div>
      </div>

      {showJson && (
        <div className="mb-4 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 space-y-3">
          <div className="relative">
            <pre className="bg-muted rounded-xl p-3 text-[11px] overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed text-muted-foreground max-h-40">
              {AI_PROMPT_SINGLE_QUESTION}
            </pre>
            <button
              onClick={copyPrompt}
              className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border text-xs font-medium hover:bg-muted transition-colors"
            >
              {promptCopied
                ? <><Check className="w-3.5 h-3.5 text-green-600" />Nusxalandi!</>
                : <><Copy className="w-3.5 h-3.5" />Nusxalash</>}
            </button>
          </div>

          <textarea
            className="w-full border border-border rounded-xl px-3 py-2.5 text-xs font-mono bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={7}
            placeholder={'{\n  "questionText": "...",\n  "options": ["A", "B", "C", "D"],\n  "correctAnswer": 0\n}'}
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setJsonError(""); }}
          />

          {jsonError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 whitespace-pre-line">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {jsonError}
            </div>
          )}

          <button
            onClick={applyJson}
            disabled={!jsonText.trim()}
            className="w-full bg-primary text-white py-2 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Shu savolga qo'llash
          </button>
        </div>
      )}

      {q.questionType && q.questionType !== "SINGLE" ? (
        <div className="space-y-3">
          <div className="p-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50 text-xs text-amber-800">
            Bu savol turi ({q.questionType}) hozircha faqat JSON orqali tahrirlanadi — quyida faqat
            ko'rish uchun ko'rsatilmoqda, qo'lda o'zgartirib bo'lmaydi.
          </div>

          {q.questionType === "MATCHING" && q.groupPrompt && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Guruhning umumiy sharti (groupPrompt):</p>
              <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-sm">
                <LatexPreview text={q.groupPrompt} />
              </div>
            </div>
          )}

          <div>
            {q.questionType === "MATCHING" && (
              <p className="text-xs text-muted-foreground mb-1">Bu savolning o&apos;ziga xos qisqa matni:</p>
            )}
            <div className="p-3 rounded-lg border border-border bg-muted/30 text-sm">
              <LatexPreview text={q.questionText} />
            </div>
          </div>

          <div>
            {q.questionImage ? (
              <div className="relative inline-block">
                <img src={q.questionImage} alt="savol rasmi" className="max-h-48 rounded-lg border border-border object-contain" />
                <button
                  onClick={() => onUpdate(q.uid, "questionImage", "")}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                tabIndex={0}
                onPaste={(e) => { e.stopPropagation(); extractPastedImage(e, onImagePick); }}
                className="flex items-center gap-2 flex-wrap focus:outline-none"
              >
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={q.uploading}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {q.uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  {q.uploading ? "Yuklanmoqda..." : "Rasm biriktirish (guruhning umumiy chizmasi)"}
                </button>
                {!q.uploading && (
                  <span className="text-xs text-muted-foreground">yoki shu yerga bosib <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-xs">Ctrl+V</kbd> bilan rasmni joylashtiring</span>
                )}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onImagePick(f); e.target.value = ""; }} />
          </div>

          {q.questionType === "MATCHING" ? (
            <div className="space-y-1.5">
              {q.section && (
                <p className="text-xs text-muted-foreground">
                  Guruh (section): {q.section} — rasmni guruhdagi bitta savolga biriktirsangiz kifoya, u butun guruh uchun bir marta ko'rsatiladi
                </p>
              )}
              {q.options.map((opt, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                    q.correctAnswer === i ? "border-green-400 bg-green-50" : "border-border"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                      q.correctAnswer === i ? "border-green-500 bg-green-500 text-white" : "border-border"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <LatexPreview text={opt} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2.5 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">a) to'g'ri javob</p>
                <p className="font-semibold">{q.correctAnswer / 100}</p>
              </div>
              <div className="p-2.5 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">b) to'g'ri javob</p>
                <p className="font-semibold">{q.correctAnswerB != null ? q.correctAnswerB / 100 : "-"}</p>
              </div>
            </div>
          )}

          {q.explanation && <p className="text-xs text-muted-foreground">Izoh: {q.explanation}</p>}
        </div>
      ) : (
      <div className="space-y-3">
        <textarea
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={2}
          placeholder="Savol matnini kiriting..."
          value={q.questionText}
          onChange={(e) => onUpdate(q.uid, "questionText", e.target.value)}
        />

        <LatexPreview text={q.questionText} />

        <div>
          {q.questionImage ? (
            <div className="relative inline-block">
              <img src={q.questionImage} alt="savol rasmi" className="max-h-48 rounded-lg border border-border object-contain" />
              <button
                onClick={() => onUpdate(q.uid, "questionImage", "")}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={q.uploading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                {q.uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                {q.uploading ? "Yuklanmoqda..." : "Fayl tanlash"}
              </button>
              {!q.uploading && (
                <span className="text-xs text-muted-foreground">yoki savol ichida <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-xs">Ctrl+V</kbd> bilan rasmni joylashtiring</span>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImagePick(f); e.target.value = ""; }} />
        </div>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <div key={i} className="space-y-1">
              <div className="pl-9">
                {q.optionImages[i] ? (
                  <div className="relative inline-block mb-1">
                    <img
                      src={q.optionImages[i]}
                      alt={`${["A", "B", "C", "D"][i]} variant rasmi`}
                      className="max-h-20 rounded-lg border border-border object-contain"
                    />
                    <button
                      onClick={() => onOptionImageRemove(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => optionFileRefs.current[i]?.click()}
                    disabled={q.optionUploading[i]}
                    className="flex items-center gap-1.5 px-2 py-1 mb-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    {q.optionUploading[i] ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                    {q.optionUploading[i] ? "Yuklanmoqda..." : "Rasm qo'shish"}
                  </button>
                )}
                <input
                  ref={(el) => { optionFileRefs.current[i] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onOptionImagePick(f, i);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdate(q.uid, "correctAnswer", i)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    q.correctAnswer === i ? "border-primary bg-primary text-white" : "border-border hover:border-primary"
                  }`}
                >
                  {["A", "B", "C", "D"][i]}
                </button>
                <Input placeholder={`${["A", "B", "C", "D"][i]} variant`} value={opt}
                  onChange={(e) => onUpdateOption(q.uid, i, e.target.value)}
                  onPaste={(e) => {
                    e.stopPropagation();
                    extractPastedImage(e, (file) => onOptionImagePick(file, i));
                  }} />
              </div>
              {opt && (
                <div className="pl-9">
                  <LatexPreview text={opt} />
                </div>
              )}
            </div>
          ))}
        </div>

        <Input placeholder="Javob izohi (ixtiyoriy)" value={q.explanation}
          onChange={(e) => onUpdate(q.uid, "explanation", e.target.value)} />

        <div className="pt-1 border-t border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tahlil (ixtiyoriy)</p>
            {q.analysis.trim() && (
              <button
                type="button"
                onClick={() => setShowAnalysisPreview((v) => !v)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {showAnalysisPreview ? "Preview'ni yashirish" : "Preview ko'rish"}
              </button>
            )}
          </div>
          <Input
            placeholder="YouTube link (masalan: https://youtu.be/...)"
            value={q.youtubeUrl}
            onChange={(e) => onUpdate(q.uid, "youtubeUrl", e.target.value)}
          />
          <textarea
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={2}
            placeholder="AI tahlil matni (bu savol uchun tushuntirish)..."
            value={q.analysis}
            onChange={(e) => onUpdate(q.uid, "analysis", e.target.value)}
          />
          {showAnalysisPreview && <LatexPreview text={q.analysis} />}
        </div>
      </div>
      )}
    </div>
  );
}
