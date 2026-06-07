"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import { X, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CREATE_TEST, ADD_QUESTION } from "@/lib/graphql/test";
import { GET_ALL_GROUPS } from "@/lib/graphql/group";
import { toast } from "sonner";

interface Question {
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
  const [step, setStep] = useState<"info" | "questions">("info");
  const [testId, setTestId] = useState<string | null>(null);
  const [form, setForm] = useState({
    testTitle: "",
    testType: "DTM",
    testAccess: "PUBLIC",
    testBlock: "",
    duration: 30,
    groupId: "",
    testDesc: "",
  });
  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    },
  ]);

  const { data: groupsData } = useQuery<{ getAllGroups: any[] }>(
    GET_ALL_GROUPS,
  );
  const groups = groupsData?.getAllGroups || [];
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [createTest, { loading: creating }] = useMutation(CREATE_TEST, {
    onCompleted: (data: any) => {
      setTestId(data.createTest.id);
      setStep("questions");
      toast.success("Test yaratildi!");
    },
    onError: () => {
      toast.error("Xatolik yuz berdi");
    },
  });

  const [addQuestion, { loading: adding }] = useMutation(ADD_QUESTION);

  const handleCreateTest = () => {
    createTest({
      variables: {
        input: {
          testTitle: form.testTitle,
          testType: form.testType,
          testAccess: form.testAccess,
          duration: Number(form.duration),
          testDesc: form.testDesc || undefined,
          groupId: form.groupId || undefined,
          testBlock: form.testBlock || undefined,
        },
      },
    });
  };

  const handleSaveQuestions = async () => {
    if (!testId) return;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText) continue;
      await addQuestion({
        variables: {
          input: {
            testId,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || undefined,
            orderIndex: i + 1,
          },
        },
      });
    }
    onSuccess();
    onClose();
  };

  // Handler:
  const handleDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !testId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("testId", testId);

    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")
        ?.state?.accessToken;
      const res = await fetch("http://localhost:4000/upload/docx-test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${data.totalQuestions} ta savol yuklandi!`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Xatolik yuz berdi");
      }
    } catch {
      toast.error("Yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions(
      questions.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[optIndex] = value;
        return { ...q, options };
      }),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <div>
            <h2 className="font-bold text-lg">Yangi test yaratish</h2>
            <p className="text-xs text-muted-foreground">
              {step === "info"
                ? "1-qadam: Ma'lumotlar"
                : `2-qadam: Savollar (${questions.length} ta)`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {step === "info" ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Test nomi *
                </label>
                <Input
                  placeholder="DTM 2026 - Variant 1"
                  value={form.testTitle}
                  onChange={(e) =>
                    setForm({ ...form, testTitle: e.target.value })
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
                    value={form.testType}
                    onChange={(e) =>
                      setForm({ ...form, testType: e.target.value })
                    }
                  >
                    <option value="DTM">DTM</option>
                    <option value="SAT">SAT</option>
                    <option value="MILLIY_SERTIFIKAT">Milliy Sertifikat</option>
                    <option value="ATTESTATSIYA">Attestatsiya</option>
                    <option value="DTM_GROUP">DTM Guruh</option>
                    <option value="SAT_GROUP">SAT Guruh</option>
                    <option value="MILLIY_GROUP">Milliy Guruh</option>
                    <option value="ATTESTATSIYA_GROUP">
                      Attestatsiya Guruh
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Kirish turi *
                  </label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    value={form.testAccess}
                    onChange={(e) =>
                      setForm({ ...form, testAccess: e.target.value })
                    }
                  >
                    <option value="PUBLIC">Ommaviy</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="GROUP">Guruh</option>
                  </select>
                </div>
              </div>

              {form.testAccess === "GROUP" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Guruh *
                  </label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    value={form.groupId}
                    onChange={(e) =>
                      setForm({ ...form, groupId: e.target.value })
                    }
                  >
                    <option value="">Guruh tanlang</option>
                    {groups.map((g: any) => (
                      <option key={g.id} value={g.id}>
                        {g.groupName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(form.testType === "DTM" || form.testType === "DTM_GROUP") && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Blok turi
                  </label>
                  <select
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    value={form.testBlock}
                    onChange={(e) =>
                      setForm({ ...form, testBlock: e.target.value })
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
                  Vaqt (daqiqada) *
                </label>
                <Input
                  type="number"
                  min={5}
                  max={180}
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Tavsif
                </label>
                <textarea
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
                  rows={3}
                  placeholder="Test haqida..."
                  value={form.testDesc}
                  onChange={(e) =>
                    setForm({ ...form, testDesc: e.target.value })
                  }
                />
              </div>

              <button
                onClick={handleCreateTest}
                disabled={creating || !form.testTitle}
                className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {creating ? "Yaratilmoqda..." : "Davom etish →"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-muted/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-sm text-primary">
                      {qIndex + 1}-savol
                    </span>
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
                      rows={2}
                      placeholder="Savol matnini kiriting..."
                      value={q.questionText}
                      onChange={(e) =>
                        updateQuestion(qIndex, "questionText", e.target.value)
                      }
                    />

                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuestion(qIndex, "correctAnswer", i)
                            }
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
                            onChange={(e) =>
                              updateOption(qIndex, i, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <Input
                      placeholder="Javob izohi (ixtiyoriy)"
                      value={q.explanation}
                      onChange={(e) =>
                        updateQuestion(qIndex, "explanation", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              {/* DOCX Upload */}
              <div className="bg-muted/30 rounded-2xl p-4 border-2 border-dashed border-border hover:border-primary transition-colors">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".docx"
                  className="hidden"
                  onChange={handleDocxUpload}
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    Word fayldan yuklash
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    .docx format: 1. Savol / A) variant* (to'g'ri)
                  </p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
                  >
                    {uploading ? "Yuklanmoqda..." : ".docx yuklash"}
                  </button>
                </div>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  yoki qo'lda kiriting
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                onClick={addNewQuestion}
                className="w-full border-2 border-dashed border-border hover:border-primary rounded-2xl py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
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
                  onClick={handleSaveQuestions}
                  disabled={adding}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
                >
                  {adding ? "Saqlanmoqda..." : "Saqlash ✓"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
