"use client";

import { useRef, useState, type RefObject } from "react";
import { Sigma } from "lucide-react";
import { MathLiveInput } from "@/components/MathLiveInput";

interface Props {
  // Formula shu textarea'ning joriy kursor o'rniga qo'shiladi.
  targetRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
}

// Admin savol matnini (masalan "...burchak $60^{\circ}$ ga teng...") xom
// LaTeX bilan qo'lda yozishi tushunarsiz va xatoga moyil edi. Bu tugma
// MathLive'ning o'zi (talaba tomonida ishlatilgan xuddi shu vizual
// klaviatura) yordamida formula qurish imkonini beradi — natijada olingan
// LaTeX "$...$" ichiga o'ralib, textarea'ning joriy kursor o'rniga
// qo'shiladi. Matnning qolgan (oddiy) qismi hamon o'zgarishsiz, oddiy
// textarea sifatida tahrirlanadi — faqat formula qismi uchun maxsus
// klaviatura taklif qilinadi.
export function FormulaInsertButton({ targetRef, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const insert = () => {
    const latex = draft.trim();
    if (!latex) {
      setOpen(false);
      return;
    }
    const el = targetRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const inserted = `$${latex}$`;
    const next = value.slice(0, start) + inserted + value.slice(end);
    onChange(next);
    const cursor = start + inserted.length;
    setDraft("");
    setOpen(false);
    // Klaviatura yopilib, matn maydoniga fokus va kursor formuladan keyingi
    // joyga qaytishi uchun — MathLiveInput o'z fokusini olib ketgani sababli
    // bir oz kutamiz.
    setTimeout(() => {
      el?.focus();
      el?.setSelectionRange(cursor, cursor);
    }, 0);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Sigma className="w-3.5 h-3.5" />
        Formula qo&apos;shish
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute z-20 top-full left-0 mt-1.5 p-3 rounded-xl border border-border bg-background shadow-lg space-y-2"
          style={{ minWidth: 260 }}
        >
          <p className="text-xs text-muted-foreground">
            Formulani quyida quring — matnga <code>$...$</code> ko&apos;rinishida qo&apos;shiladi.
          </p>
          <MathLiveInput value={draft} onChange={setDraft} />
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={insert}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Matnga qo&apos;shish
            </button>
            <button
              type="button"
              onClick={() => { setDraft(""); setOpen(false); }}
              className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
