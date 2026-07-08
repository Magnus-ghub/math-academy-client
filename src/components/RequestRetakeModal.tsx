"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { CREATE_REPORT } from "@/lib/graphql/report";
import { ReportReason, ReportType } from "@/lib/enums/report.enum";

interface Props {
  testId: string;
  onClose: () => void;
}

export function RequestRetakeModal({ testId, onClose }: Props) {
  const [text, setText] = useState("");

  const [createReport, { loading }] = useMutation(CREATE_REPORT, {
    onCompleted: () => {
      toast.success("So'rov yuborildi. Admin ko'rib chiqqach, testni qayta topshira olasiz.");
      onClose();
    },
    onError: () => toast.error("Yuborishda xatolik yuz berdi"),
  });

  const handleSubmit = () => {
    createReport({
      variables: {
        input: {
          reportType: ReportType.TEST,
          reportReason: ReportReason.RETAKE_REQUEST,
          reportText: text.trim() || undefined,
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
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Qayta topshirishni so'rash</h3>
              <p className="text-xs text-muted-foreground">Admin ko'rib chiqadi va ruxsat beradi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Testni tasodifan yoki xato bilan yuborib qo'ygan bo'lsangiz, sababini yozing — admin tasdiqlagach
            testni qaytadan topshira olasiz.
          </p>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Nima bo'ldi? (ixtiyoriy)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Masalan: tasodifan Tugatish tugmasini bosib yubordim..."
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
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Yuborilmoqda..." : "So'rov yuborish"}
          </button>
        </div>
      </div>
    </div>
  );
}
