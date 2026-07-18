"use client";

import { useRouter } from "next/navigation";
import { X, RotateCcw, Clock, ShieldOff, Eye } from "lucide-react";

interface Props {
  testId: string;
  testType: string;
  onClose: () => void;
}

export function RetakeExplainModal({ testId, testType, onClose }: Props) {
  const router = useRouter();

  const handleStart = () => {
    const dest = testType === "SAT" ? `/sat/${testId}` : `/exam/${testId}`;
    router.push(`${dest}?retake=1`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Qayta ishlash</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bu testni yana bir bor, vaqt taqsimotini his qilib mashq qilish uchun qayta ishlashingiz mumkin.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Test xuddi birinchi safargidek, vaqt bilan to'liq ishlaydi.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <ShieldOff className="w-3.5 h-3.5 text-red-600" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Bu safargi natija <strong className="text-foreground">hech qayerda saqlanmaydi</strong> — reytingga,
                statistikaga ta'sir qilmaydi. Birinchi natijangiz o'zgarishsiz qoladi.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <Eye className="w-3.5 h-3.5 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Tugatgach, natijangizni faqat o'zingiz shu yerda ko'rasiz.
              </p>
            </div>
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
            onClick={handleStart}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Boshlash →
          </button>
        </div>
      </div>
    </div>
  );
}
