"use client";

import { MathText } from "@/components/MathText";

/* ── SPR Input — real SAT Digital style ──────────────────────────────── */
// maxLength — SAT'da rasmiy SPR formati qisqa (6 belgi), lekin Milliy
// Sertifikat qog'ozda yozma tarzda o'tkaziladi — talabalar uzunroq
// (ko'p xonali son/kasr) javob yozishi mumkin, shuning uchun bu testlar
// uchun kengroq maydon kerak (exam/[id]/page.tsx orqali uzatiladi).
export function SprInput({
  value,
  onChange,
  maxLength = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
}) {
  const ALLOWED = /^-?[\d./]*$/;
  const boxWidth = 130 + Math.max(0, maxLength - 6) * 16;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v.length <= maxLength && ALLOWED.test(v)) onChange(v);
  };

  return (
    <div className="mt-6">
      {/* Input box — SAT style */}
      <div className="flex flex-col items-start gap-4">
        <div className="relative" style={{ width: boxWidth }}>
          <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            style={{
              width: boxWidth,
              height: 52,
              fontFamily: "monospace",
              fontSize: 22,
              fontWeight: 600,
              textAlign: "center",
              border: "2px solid #6b7280",
              background: "#fff",
              outline: "none",
              letterSpacing: "0.1em",
              color: "#111827",
              display: "block",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1e3a5f")}
            onBlur={(e) => (e.target.style.borderColor = "#6b7280")}
          />
          {/* bottom underline like real SAT */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "#6b7280",
            }}
          />
        </div>

        {/* Clear */}
        {value.trim() !== "" && (
          <button
            onClick={() => onChange("")}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Answer Preview — like real SAT */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-sm font-bold text-gray-700 mb-1">Answer Preview:</p>
        <div style={{ minHeight: 36, fontSize: 20 }}>
          {(() => {
            const frac = value.match(/^(-?\d+)\/(\d+)$/);
            if (frac) return <MathText text={`$$\\frac{${frac[1]}}{${frac[2]}}$$`} />;
            return <span style={{ fontFamily: "monospace", fontSize: 22 }}>{value}</span>;
          })()}
        </div>
      </div>

      {/* Accepted formats */}
      <p className="mt-3 text-xs text-gray-400">
        Formatlar:{" "}
        <span className="font-mono">3.5</span> ·{" "}
        <span className="font-mono">7/2</span> ·{" "}
        <span className="font-mono">-4</span>
      </p>
    </div>
  );
}
