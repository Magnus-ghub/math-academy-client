"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const testTypes = ["DTM", "SAT", "MILLIY_SERTIFIKAT", "ATTESTATSIYA", "DTM_GROUP", "SAT_GROUP", "MILLIY_GROUP", "ATTESTATSIYA_GROUP"];
const accessTypes = ["PUBLIC", "PREMIUM", "GROUP"];
const blockTypes = ["MANDATORY", "ELECTIVE"];

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function CreateTestPage() {
  const [step, setStep] = useState<"info" | "questions">("info");
  const [testInfo, setTestInfo] = useState({
    testTitle: "",
    testType: "DTM",
    testAccess: "PUBLIC",
    testBlock: "",
    duration: 30,
    groupId: "",
    testDesc: "",
  });
  const [questions, setQuestions] = useState<Question[]>([
    { id: "1", questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" },
  ]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now().toString(),
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
    }]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (qId: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id !== qId) return q;
      const options = [...q.options];
      options[index] = value;
      return { ...q, options };
    }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/tests">
          <button className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Yangi test yaratish</h1>
          <p className="text-muted-foreground text-sm">
            {step === "info" ? "1-qadam: Test ma'lumotlari" : `2-qadam: Savollar (${questions.length} ta)`}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex gap-2 mb-8">
        {["info", "questions"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step === s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm font-medium ${step === s ? "text-primary" : "text-muted-foreground"}`}>
              {s === "info" ? "Ma'lumotlar" : "Savollar"}
            </span>
            {i === 0 && <div className="w-12 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {step === "info" ? (
        <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Test nomi *</label>
            <Input
              placeholder="Masalan: DTM 2026 - Variant 1"
              value={testInfo.testTitle}
              onChange={(e) => setTestInfo({ ...testInfo, testTitle: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Test turi *</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.testType}
                onChange={(e) => setTestInfo({ ...testInfo, testType: e.target.value })}
              >
                {testTypes.map(t => (
                  <option key={t} value={t}>{t.replace("_GROUP", " (Guruh)")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Kirish turi *</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.testAccess}
                onChange={(e) => setTestInfo({ ...testInfo, testAccess: e.target.value })}
              >
                <option value="PUBLIC">Ommaviy</option>
                <option value="PREMIUM">Premium</option>
                <option value="GROUP">Guruh</option>
              </select>
            </div>
          </div>

          {testInfo.testAccess === "GROUP" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Guruh ID *</label>
              <Input
                placeholder="Guruh ID sini kiriting"
                value={testInfo.groupId}
                onChange={(e) => setTestInfo({ ...testInfo, groupId: e.target.value })}
              />
            </div>
          )}

          {(testInfo.testType === "DTM" || testInfo.testType === "DTM_GROUP") && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Blok turi</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                value={testInfo.testBlock}
                onChange={(e) => setTestInfo({ ...testInfo, testBlock: e.target.value })}
              >
                <option value="">Tanlanmagan</option>
                <option value="MANDATORY">Majburiy (Matematika)</option>
                <option value="ELECTIVE">Ixtiyoriy</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">Vaqt (daqiqada) *</label>
            <Input
              type="number"
              min={5}
              max={180}
              value={testInfo.duration}
              onChange={(e) => setTestInfo({ ...testInfo, duration: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Tavsif</label>
            <textarea
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
              rows={3}
              placeholder="Test haqida qisqacha ma'lumot..."
              value={testInfo.testDesc}
              onChange={(e) => setTestInfo({ ...testInfo, testDesc: e.target.value })}
            />
          </div>

          <button
            onClick={() => setStep("questions")}
            disabled={!testInfo.testTitle}
            className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            Davom etish →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="bg-background rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-sm text-primary">{qIndex + 1}-savol</span>
                <button
                  onClick={() => removeQuestion(q.id)}
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
                  onChange={(e) => updateQuestion(q.id, "questionText", e.target.value)}
                />

                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuestion(q.id, "correctAnswer", i)}
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
                        onChange={(e) => updateOption(q.id, i, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <Input
                  placeholder="Javob izohi (ixtiyoriy)"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(q.id, "explanation", e.target.value)}
                />
              </div>
            </div>
          ))}

          <button
            onClick={addQuestion}
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
              className="flex-1 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors text-sm"
            >
              Testni saqlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}