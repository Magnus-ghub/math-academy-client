"use client";

import { MathText, validateLatex } from "@/components/MathText";

// Admin panelida savol/variant matni kiritilayotganda jonli LaTeX
// ko'rinishini va (agar bo'lsa) formula xatolarini ko'rsatadi — buzilgan
// LaTeX saqlashdan oldin ko'rinib qolsin, talaba imtihonda emas.
export function LatexPreview({ text }: { text: string }) {
  if (!text.trim()) return null;
  const errors = validateLatex(text);

  return (
    <div className="space-y-1">
      <div className="px-3 py-2 bg-muted/30 rounded-lg text-sm">
        <MathText text={text} />
      </div>
      {errors.length > 0 && (
        <ul className="space-y-0.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600">
          {errors.map((err, i) => (
            <li key={i}>⚠ {err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
