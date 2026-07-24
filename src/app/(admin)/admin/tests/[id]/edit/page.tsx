"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { ChevronLeft, Plus, Trash2, Image as ImageIcon, X, Loader2, Save, BookOpen, FileText, Upload, Sparkles } from "lucide-react";
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
import { LatexPreview } from "@/components/admin/LatexPreview";
import { toast } from "sonner";

const MAX_DESC_WORDS = 40;

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

interface QuestionRow {
  uid: string;
  id?: string;
  questionText: string;
  questionImage: string;
  options: string[];
  correctAnswer: number;
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
  };
}

interface QuestionsData {
  getQuestions?: Array<{
    id: string;
    questionText?: string;
    questionImage?: string;
    options?: string[];
    correctAnswer?: number;
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
    questionText: q?.questionText ?? "",
    questionImage: q?.questionImage ?? "",
    options: q?.options ?? ["", "", "", ""],
    correctAnswer: q?.correctAnswer ?? 0,
    explanation: q?.explanation ?? "",
    youtubeUrl: q?.youtubeUrl ?? "",
    analysis: q?.analysis ?? "",
    uploading: false,
    dirty: false,
    isNew: !q?.id,
  };
}

export default function EditTestPage() {
  const { id: testId } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "questions">("questions");
  const [showJsonReplace, setShowJsonReplace] = useState(false);

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
      });
    }
  }, [test]);

  useEffect(() => {
    if (questionsData?.getQuestions) {
      setQuestions(questionsData.getQuestions.map(makeRow));
    }
  }, [questionsData]);

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

  const setOption = (uid: string, idx: number, value: string) =>
    setQuestions((qs) => qs.map((q) => {
      if (q.uid !== uid) return q;
      const options = [...q.options];
      options[idx] = value;
      return { ...q, options, dirty: true };
    }));

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
          options: q.options,
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
            <label className="text-sm font-medium mb-1.5 block">
              AI / Matn tahlili{" "}
              <span className="text-muted-foreground font-normal">(ixtiyoriy — test bo'yicha umumiy tahlil)</span>
            </label>
            <textarea
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={5}
              placeholder="Bu test bo'yicha tahlil, tushuntirish yoki AI tomonidan tayyorlangan izoh..."
              value={testInfo.testAnalysis}
              onChange={(e) => setTestInfo({ ...testInfo, testAnalysis: e.target.value })}
            />
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
            <EditQuestionCard
              key={q.uid}
              q={q}
              index={i}
              onUpdate={setQ}
              onUpdateOption={setOption}
              onRemove={() => removeQuestion(q.uid, q.id)}
              onImagePick={(file) => uploadImage(file, q.uid)}
              canRemove={questions.length > 1}
            />
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
    </div>
  );
}

function EditQuestionCard({ q, index, onUpdate, onUpdateOption, onRemove, onImagePick, canRemove }: {
  q: QuestionRow;
  index: number;
  onUpdate: (uid: string, field: keyof QuestionRow, value: string | number | boolean | string[]) => void;
  onUpdateOption: (uid: string, idx: number, value: string) => void;
  onRemove: () => void;
  onImagePick: (file: File) => void;
  canRemove: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items ?? []);

    // Oddiy holat: skrinshot, brauzer yoki Paint'dan nusxalangan rasm
    // to'g'ridan-to'g'ri "image/*" clipboard item sifatida keladi.
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) onImagePick(file);
      return;
    }

    // Ba'zi brauzerlarda rasm faqat `files` ro'yxatida keladi (items emas)
    const fileFromList = Array.from(e.clipboardData?.files ?? []).find((f) =>
      f.type.startsWith("image/")
    );
    if (fileFromList) {
      e.preventDefault();
      onImagePick(fileFromList);
      return;
    }

    // MS Word rasmni odatda "image/*" sifatida emas, balki HTML fragmentida
    // <img> tegi orqali (ba'zan base64, ko'pincha esa faqat mahalliy
    // "file://" yo'l) taqdim qiladi. Brauzer xavfsizlik sababli "file://"
    // manzilidan o'qiy olmaydi, shuning uchun faqat base64 holatini tiklab
    // olamiz, aks holda foydalanuvchiga sababini tushuntiramiz.
    const htmlItem = items.find((item) => item.type === "text/html");
    if (htmlItem) {
      e.preventDefault();
      htmlItem.getAsString((html) => {
        const match = html.match(/<img[^>]+src=["'](data:image\/[^"']+)["']/i);
        const file = match ? dataUrlToFile(match[1]) : null;
        if (file) {
          onImagePick(file);
        } else {
          toast.error(
            "Word'dan nusxalangan rasmni to'g'ridan-to'g'ri joylashtirib bo'lmadi. Avval rasmni kompyuteringizga saqlang va \"Fayl tanlash\" orqali yuklang."
          );
        }
      });
    }
  };

  return (
    <div
      onPaste={handlePaste}
      className={`bg-background rounded-2xl border p-5 transition-colors ${q.dirty || q.isNew ? "border-primary/40" : "border-border"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-primary">{index + 1}-savol</span>
          {q.isNew && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Yangi</span>}
          {q.dirty && !q.isNew && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">O'zgartirildi</span>}
        </div>
        {canRemove && (
          <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

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
                  onChange={(e) => onUpdateOption(q.uid, i, e.target.value)} />
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tahlil (ixtiyoriy)</p>
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
        </div>
      </div>
    </div>
  );
}
