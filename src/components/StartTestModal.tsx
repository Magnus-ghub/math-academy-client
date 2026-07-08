"use client";

import { Clock, FileQuestion, AlertTriangle, X, ChevronRight, ShieldAlert, Ban, RotateCcw, CheckCircle2 } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  DTM: "DTM",
  SAT: "SAT",
  MILLIY_SERTIFIKAT: "Milliy Sertifikat",
  ATTESTATSIYA: "Attestatsiya",
};

const DTM_LABELS: Record<string, string> = {
  MAJBURIY: "DTM — Majburiy blok",
  ASOSIY: "DTM — Asosiy blok",
  FULL: "DTM — Full",
};

const TYPE_COLORS: Record<string, { badge: string; glow: string }> = {
  DTM: {
    badge: "bg-primary/10 text-primary border-primary/30 dark:bg-primary/20",
    glow: "from-primary/5 to-transparent",
  },
  SAT: {
    badge: "bg-accent/10 text-accent border-accent/30 dark:bg-accent/20",
    glow: "from-accent/5 to-transparent",
  },
  MILLIY_SERTIFIKAT: {
    badge: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-400 dark:border-green-700",
    glow: "from-green-500/5 to-transparent",
  },
  ATTESTATSIYA: {
    badge: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-700",
    glow: "from-purple-500/5 to-transparent",
  },
};

interface Test {
  id: string;
  testTitle: string;
  testType: string;
  dtmType?: string;
  totalQuestions: number;
  duration: number;
}

interface Props {
  test: Test;
  onStart: () => void;
  onCancel: () => void;
}

const RULES = [
  { icon: CheckCircle2, text: "Har bir savolga faqat 1 ta javob tanlash mumkin" },
  { icon: Clock, text: "Vaqt tugaganda test avtomatik yakunlanadi" },
  { icon: CheckCircle2, text: "Javob bergandan so'ng uni o'zgartirishingiz mumkin" },
  { icon: CheckCircle2, text: "Belgilangan savollarni keyinroq ko'rib chiqing" },
  { icon: CheckCircle2, text: "Natija test yakunlanishi bilanoq ko'rsatiladi" },
];

const WARNINGS = [
  { icon: Ban, text: "Faqat 1 ta urinish beriladi — qayta topshirish imkoni yo'q" },
  { icon: RotateCcw, text: "Test davomida ortga qaytib bo'lmaydi" },
  { icon: ShieldAlert, text: "Sahifani yopish yoki boshqa sahifaga o'tish tavsiya etilmaydi" },
];

export function StartTestModal({ test, onStart, onCancel }: Props) {
  const typeLabel = test.dtmType
    ? DTM_LABELS[test.dtmType] ?? TYPE_LABELS[test.testType]
    : TYPE_LABELS[test.testType] ?? test.testType;

  const colors = TYPE_COLORS[test.testType] ?? {
    badge: "bg-muted text-muted-foreground border-border",
    glow: "from-muted/30 to-transparent",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Top gradient accent */}
        <div className={`h-1 w-full bg-linear-to-r ${colors.glow} opacity-60`} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border mb-2 ${colors.badge}`}>
              {typeLabel}
            </span>
            <h2 className="text-base font-bold text-foreground leading-snug line-clamp-2">
              {test.testTitle}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="px-6 pb-4 flex gap-3">
          <div className="flex-1 flex items-center gap-2.5 bg-muted/60 dark:bg-muted/40 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileQuestion className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">Savollar</p>
              <p className="text-sm font-bold text-foreground">{test.totalQuestions} ta</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2.5 bg-muted/60 dark:bg-muted/40 rounded-xl px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground leading-none mb-0.5">Vaqt</p>
              <p className="text-sm font-bold text-foreground">{test.duration} daqiqa</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-4 space-y-3">
          {/* Warnings */}
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                Muhim eslatma
              </p>
            </div>
            <ul className="space-y-1.5">
              {WARNINGS.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rules */}
          <div className="bg-muted/50 dark:bg-muted/30 rounded-xl p-3.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2.5">
              Test qoidalari
            </p>
            <ul className="space-y-1.5">
              {RULES.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Testni boshlash
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
