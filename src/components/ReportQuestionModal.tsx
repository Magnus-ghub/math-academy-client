"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { X, Flag } from "lucide-react";
import { toast } from "sonner";
import { CREATE_REPORT } from "@/lib/graphql/report";
import { ReportReason, ReportType } from "@/lib/enums/report.enum";

interface Props {
  questionId: string;
  testId: string;
  questionNumber: number;
  onClose: () => void;
}

const reasons: { value: ReportReason; label: string }[] = [
  { value: ReportReason.WRONG_ANSWER, label: "Noto'g'ri javob ko'rsatilgan" },
  { value: ReportReason.WRONG_QUESTION, label: "Savol noto'g'ri" },
  { value: ReportReason.TYPO, label: "Imlo xatosi bor" },
  { value: ReportReason.UNCLEAR, label: "Tushunarsiz yozilgan" },
  { value: ReportReason.OTHER, label: "Boshqa sabab" },
];

export function ReportQuestionModal({ questionId, testId, questionNumber, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [text, setText] = useState("");

  const [createReport, { loading }] = useMutation(CREATE_REPORT, {
    onCompleted: () => {
      toast.success("Etiroz yuborildi. Admin ko'rib chiqadi.");
      onClose();
    },
    onError: () => toast.error("Yuborishda xatolik yuz berdi"),
  });

  const handleSubmit = () => {
    if (!reason) return toast.error("Sabab tanlang");
    createReport({
      variables: {
        input: {
          reportType: ReportType.QUESTION,
          reportReason: reason,
          reportText: text.trim() || undefined,
          questionId,
          testId,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <Flag className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{questionNumber}-savol bo'yicha etiroz</h3>
              <p className="text-xs text-muted-foreground">Admin ko'rib chiqadi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Sabab *
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    reason === r.value
                      ? "border-red-400 bg-red-50 text-red-700 font-medium"
                      : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Qo'shimcha izoh (ixtiyoriy)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Muammoni batafsil yozing..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border text-sm resize-none focus:outline-none focus:border-primary bg-background"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Yuborilmoqda..." : "Etiroz yuborish"}
          </button>
        </div>
      </div>
    </div>
  );
}
