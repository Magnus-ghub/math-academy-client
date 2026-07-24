"use client";

import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronLeft, Loader2, ImageIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { CREATE_TEST, ADD_QUESTION } from "@/lib/graphql/test";
import { LatexPreview } from "@/components/admin/LatexPreview";
import { useAuthStore } from "@/lib/store/auth.store";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ??
  "http://localhost:4000";

const TEST_TYPES = [
  "DTM",
  "SAT",
  "MILLIY_SERTIFIKAT",
  "ATTESTATSIYA",
  "DTM_GROUP",
  "SAT_GROUP",
  "MILLIY_GROUP",
  "ATTESTATSIYA_GROUP",
];

interface QuestionDraft {
  uid: string;
  questionText: string;
  questionImage: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  uploading: boolean;
}

function newQuestion(index: number): QuestionDraft {
  return {
    uid: `${Date.now()}-${index}`,
    questionText: "",
    questionImage: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    uploading: false,
  };
}

export default function CreateTestPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [step, setStep] = useState<"info" | "questions">("info");
  const [createdTestId, setCreatedTestId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [testInfo, setTestInfo] = useState({
    testTitle: "",
    testType: "DTM",
    testAccess: "PUBLIC",
    testBlock: "",
    duration: 30,
    groupId: "",
    testDesc: "",
    testPrice: "",
  });

  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion(0)]);

  const [createTest, { loading: creating }] = useMutation<{
    createTest: {
      id: string;
      testTitle: string;
      testType: string;
      testAccess: string;
      testStatus: string;
    };
  }>(CREATE_TEST, {
    onError: () => toast.error("Test yaratishda xatolik"),
  });

  const [addQuestion] = useMutation<{
    addQuestion: {
      id: string;
      questionText: string;
      options: string[];
      correctAnswer: number;
      orderIndex: number;
    };
  }>(ADD_QUESTION, {
    onError: () => toast.error("Savol saqlashda xatolik"),
  });

  const handleNextStep = async () => {
    if (createdTestId) {
      setStep("questions");
      return;
    }
    const input: any = {
      testTitle: testInfo.testTitle,
      testType: testInfo.testType,
      testAccess: testInfo.testAccess,
      duration: Number(testInfo.duration),
    };
    if (testInfo.testDesc) input.testDesc = testInfo.testDesc;
    if (testInfo.testBlock) input.testBlock = testInfo.testBlock;
    if (testInfo.testAccess === "GROUP" && testInfo.groupId)
      input.groupId = testInfo.groupId;
    if (testInfo.testAccess === "PREMIUM" && testInfo.testPrice)
      input.testPrice = Number(testInfo.testPrice);

    const res = await createTest({ variables: { input } });
    if (res.data?.createTest?.id) {
      setCreatedTestId(res.data.createTest.id);
      setStep("questions");
    }
  };

  const uploadImage = async (file: File, uid: string) => {
    setQuestions((qs) =>
      qs.map((q) => (q.uid === uid ? { ...q, uploading: true } : q)),
    );
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setQuestions((qs) =>
          qs.map((q) =>
            q.uid === uid
              ? { ...q, questionImage: data.url, uploading: false }
              : q,
          ),
        );
      }
    } catch {
      toast.error("Rasm yuklanmadi");
      setQuestions((qs) =>
        qs.map((q) => (q.uid === uid ? { ...q, uploading: false } : q)),
      );
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!createdTestId) return;
    const invalid = questions.some(
      (q) => !q.questionText.trim() || q.options.some((o) => !o.trim()),
    );
    if (invalid) {
      toast.error("Barcha savol va variantlarni to'ldiring");
      return;
    }

    setSaving(true);
    try {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await addQuestion({
          variables: {
            input: {
              testId: createdTestId,
              questionText: q.questionText,
              questionImage: q.questionImage || undefined,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || undefined,
              orderIndex: i + 1,
            },
          },
        });
      }
      toast.success(`${questions.length} ta savol saqlandi`);
      router.push("/admin/tests");
    } finally {
      setSaving(false);
    }
  };

  const updateQ = (uid: string, field: keyof QuestionDraft, value: any) =>
    setQuestions((qs) =>
      qs.map((q) => (q.uid === uid ? { ...q, [field]: value } : q)),
    );

  const updateOption = (uid: string, idx: number, value: string) =>
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.uid !== uid) return q;
        const options = [...q.options];
        options[idx] = value;
        return { ...q, options };
      }),
    );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/tests">
          <button className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Yangi test yaratish</h1>
          <p className="text-muted-foreground text-sm">
            {step === "info"
              ? "1-qadam: Test ma'lumotlari"
              : `2-qadam: Savollar (${questions.length} ta)`}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {(["info", "questions"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s
                  ? "bg-primary text-white"
                  : createdTestId && s === "questions"
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm font-medium ${step === s ? "text-primary" : "text-muted-foreground"}`}
            >
              {s === "info" ? "Ma'lumotlar" : "Savollar"}
            </span>
            {i === 0 && <div className="w-12 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {step === "info" ? (
        <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Test nomi *
            </label>
            <Input
              placeholder="Masalan: Attestatsiya 2026 - Matematika"
              value={testInfo.testTitle}
              onChange={(e) =>
                setTestInfo({ ...testInfo, testTitle: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Test turi *
              </label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.testType}
                onChange={(e) =>
                  setTestInfo({ ...testInfo, testType: e.target.value })
                }
              >
                {TEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_GROUP", " (Guruh)")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Kirish turi *
              </label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.testAccess}
                onChange={(e) =>
                  setTestInfo({ ...testInfo, testAccess: e.target.value })
                }
              >
                <option value="PUBLIC">Ommaviy</option>
                <option value="PREMIUM">Premium</option>
                <option value="GROUP">Guruh</option>
              </select>
            </div>
          </div>

          {testInfo.testAccess === "GROUP" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Guruh ID *
              </label>
              <Input
                placeholder="Guruh ID"
                value={testInfo.groupId}
                onChange={(e) =>
                  setTestInfo({ ...testInfo, groupId: e.target.value })
                }
              />
            </div>
          )}

          {testInfo.testAccess === "PREMIUM" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Narx (UZS)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  placeholder="Masalan: 50000"
                  value={testInfo.testPrice}
                  onChange={(e) =>
                    setTestInfo({ ...testInfo, testPrice: e.target.value })
                  }
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                  UZS
                </span>
              </div>
            </div>
          )}

          {(testInfo.testType === "DTM" ||
            testInfo.testType === "DTM_GROUP") && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Blok turi
              </label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.testBlock}
                onChange={(e) =>
                  setTestInfo({ ...testInfo, testBlock: e.target.value })
                }
              >
                <option value="">Tanlanmagan</option>
                <option value="MANDATORY">Majburiy (Matematika)</option>
                <option value="ELECTIVE">Ixtiyoriy</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Vaqt (daqiqa) *
            </label>
            <Input
              type="number"
              min={5}
              max={180}
              value={testInfo.duration}
              onChange={(e) =>
                setTestInfo({ ...testInfo, duration: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Tavsif</label>
            <textarea
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
              rows={3}
              placeholder="Test haqida qisqacha..."
              value={testInfo.testDesc}
              onChange={(e) =>
                setTestInfo({ ...testInfo, testDesc: e.target.value })
              }
            />
          </div>

          <button
            onClick={handleNextStep}
            disabled={!testInfo.testTitle || creating}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
          >
            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
            {creating ? "Yaratilmoqda..." : "Davom etish →"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <QuestionCard
              key={q.uid}
              q={q}
              index={qIndex}
              onUpdate={updateQ}
              onUpdateOption={updateOption}
              onRemove={() =>
                setQuestions((qs) => qs.filter((x) => x.uid !== q.uid))
              }
              onImagePick={(file) => uploadImage(file, q.uid)}
              canRemove={questions.length > 1}
            />
          ))}

          <button
            onClick={() =>
              setQuestions((qs) => [...qs, newQuestion(qs.length)])
            }
            className="w-full border-2 border-dashed border-border hover:border-primary rounded-2xl py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            Savol qo'shish
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setStep("info")}
              className="flex-1 border border-border py-2.5 rounded-xl font-medium hover:bg-muted transition-colors text-sm"
            >
              ← Orqaga
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 border border-border py-2.5 rounded-xl font-medium hover:bg-muted transition-colors text-sm flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Qoralama saqlash
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors text-sm flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Saqlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  q,
  index,
  onUpdate,
  onUpdateOption,
  onRemove,
  onImagePick,
  canRemove,
}: {
  q: QuestionDraft;
  index: number;
  onUpdate: (uid: string, field: keyof QuestionDraft, value: any) => void;
  onUpdateOption: (uid: string, idx: number, value: string) => void;
  onRemove: () => void;
  onImagePick: (file: File) => void;
  canRemove: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-background rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-sm text-primary">
          {index + 1}-savol
        </span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <textarea
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={2}
          placeholder="Savol matnini kiriting... ($formula$ shaklida LaTeX yozish mumkin)"
          value={q.questionText}
          onChange={(e) => onUpdate(q.uid, "questionText", e.target.value)}
        />

        <LatexPreview text={q.questionText} />

        {/* Image area */}
        <div>
          {q.questionImage ? (
            <div className="relative inline-block">
              <img
                src={q.questionImage}
                alt="savol rasmi"
                className="max-h-48 rounded-lg border border-border object-contain"
              />
              <button
                onClick={() => onUpdate(q.uid, "questionImage", "")}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={q.uploading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              {q.uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5" />
              )}
              {q.uploading
                ? "Yuklanmoqda..."
                : "Rasm qo'shish (grafik, jadval)"}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImagePick(f);
              e.target.value = "";
            }}
          />
        </div>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdate(q.uid, "correctAnswer", i)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
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
                  onChange={(e) => onUpdateOption(q.uid, i, e.target.value)}
                />
              </div>
              {opt && (
                <div className="pl-9">
                  <LatexPreview text={opt} />
                </div>
              )}
            </div>
          ))}
        </div>

        <Input
          placeholder="Javob izohi (ixtiyoriy)"
          value={q.explanation}
          onChange={(e) => onUpdate(q.uid, "explanation", e.target.value)}
        />
      </div>
    </div>
  );
}
