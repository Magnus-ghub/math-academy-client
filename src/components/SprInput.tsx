"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import { MathText } from "@/components/MathText";

export interface SprInputHandle {
  insertAtCursor: (text: string) => void;
  backspaceAtCursor: () => void;
  moveCursor: (dir: -1 | 1) => void;
}

/* ── SPR Input — real SAT Digital style ──────────────────────────────── */
// maxLength — SAT'da rasmiy SPR formati qisqa (6 belgi), lekin Milliy
// Sertifikat qog'ozda yozma tarzda o'tkaziladi — talabalar uzunroq
// (ko'p xonali son/kasr) javob yozishi mumkin, shuning uchun bu testlar
// uchun kengroq maydon kerak (exam/[id]/page.tsx orqali uzatiladi).
//
// useVirtualKeyboard yoqilganda input readOnly bo'ladi va insert/backspace/
// moveCursor metodlari ref orqali tashqariga chiqariladi — bitta savolda
// (masalan TWO_PART, ikkita input a/b) bir vaqtda ikkita klaviatura
// chiqmasligi uchun klaviaturaning o'zi bu komponent ICHIDA emas, chaqiruvchi
// tomonda (bitta umumiy nusxada, qaysi input faol bo'lsa o'shanga) render
// qilinadi.
export const SprInput = forwardRef<SprInputHandle, {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  onFocus?: () => void;
  useVirtualKeyboard?: boolean;
  showPreview?: boolean;
}>(function SprInput({ value, onChange, maxLength, onFocus, useVirtualKeyboard = false, showPreview = true }, ref) {
  const ALLOWED = /^-?[\d./]*$/;
  // Input kengligi maxLength'ga emas, haqiqiy yozilgan matn uzunligiga
  // qarab o'sadi — Milliy Sertifikatda cheklov yo'q (uzunroq formula ham
  // yozilishi mumkin), shuning uchun kenglik ham shunga moslashadi.
  const boxWidth = Math.min(340, Math.max(160, 40 + value.length * 16));
  // Kasr/formula kabi uzunroq javob yozilganda raqam inputga moslashib
  // birozgina kichrayadi — aks holda qutidan toshib chiqib ketadi.
  const fontSize = value.length > 6 ? Math.max(13, 18 - (value.length - 6) * 1.1) : 18;
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef({ start: value.length, end: value.length });

  const trackCursor = () => {
    const el = inputRef.current;
    if (el) cursorRef.current = { start: el.selectionStart ?? value.length, end: el.selectionEnd ?? value.length };
  };

  const placeCursor = (pos: number) => {
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(pos, pos);
      inputRef.current?.focus();
    });
    cursorRef.current = { start: pos, end: pos };
  };

  useImperativeHandle(ref, () => ({
    insertAtCursor: (text: string) => {
      const { start, end } = cursorRef.current;
      const next = value.slice(0, start) + text + value.slice(end);
      if (maxLength != null && next.length > maxLength) return;
      onChange(next);
      placeCursor(start + text.length);
    },
    backspaceAtCursor: () => {
      const { start, end } = cursorRef.current;
      if (start !== end) {
        onChange(value.slice(0, start) + value.slice(end));
        placeCursor(start);
      } else if (start > 0) {
        onChange(value.slice(0, start - 1) + value.slice(end));
        placeCursor(start - 1);
      }
    },
    moveCursor: (dir: -1 | 1) => {
      const { start } = cursorRef.current;
      placeCursor(Math.max(0, Math.min(value.length, start + dir)));
    },
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if ((maxLength == null || v.length <= maxLength) && ALLOWED.test(v)) onChange(v);
  };

  // Kasr ("7/2") yozilganda inputning o'zi ichida qog'ozdagidek tepa/past
  // ko'rinishda (KaTeX) ko'rsatiladi — pastki matn shaffof qilinadi, real
  // input esa (kursor/klaviatura ishlashi uchun) joyida qoladi.
  const frac = value.match(/^(-?\d+)\/(\d+)$/);

  return (
    <div>
      {/* Input box — SAT style */}
      <div className="flex flex-col items-start gap-4">
        <div className="relative" style={{ width: boxWidth }}>
          <input
            ref={inputRef}
            type="text"
            inputMode={useVirtualKeyboard ? "none" : "decimal"}
            readOnly={useVirtualKeyboard}
            autoComplete="off"
            spellCheck={false}
            maxLength={maxLength}
            value={value}
            onChange={handleChange}
            onClick={trackCursor}
            onKeyUp={trackCursor}
            style={{
              width: boxWidth,
              height: 52,
              fontFamily: "monospace",
              fontSize,
              fontWeight: 500,
              textAlign: "center",
              border: "2px solid #6b7280",
              borderRadius: 12,
              background: "#fff",
              outline: "none",
              letterSpacing: "0.1em",
              color: frac ? "transparent" : "#111827",
              caretColor: frac ? "transparent" : "auto",
              display: "block",
              cursor: useVirtualKeyboard ? "default" : "text",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#1e3a5f";
              onFocus?.();
              // Ekran klaviaturasi mobilda pastki yarmini yopib qo'yadi —
              // fokuslangan maydon shundan yuqorida ko'rinib tursin.
              if (useVirtualKeyboard) {
                const target = e.target;
                requestAnimationFrame(() => {
                  target.scrollIntoView({ behavior: "smooth", block: "center" });
                });
              }
            }}
            onBlur={(e) => (e.target.style.borderColor = "#6b7280")}
          />
          {frac && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ pointerEvents: "none", fontSize: Math.min(fontSize, 20) }}
            >
              <MathText text={`$$\\frac{${frac[1]}}{${frac[2]}}$$`} />
            </div>
          )}
        </div>

        {/* Clear */}
        {value.trim() !== "" && (
          <button
            onClick={() => { onChange(""); placeCursor(0); }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Answer Preview — like real SAT */}
      {showPreview && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-sm font-bold text-gray-700 mb-1">Answer Preview:</p>
          <div style={{ minHeight: 36, fontSize: 20 }}>
            {frac
              ? <MathText text={`$$\\frac{${frac[1]}}{${frac[2]}}$$`} />
              : <span style={{ fontFamily: "monospace", fontSize: 22 }}>{value}</span>}
          </div>
        </div>
      )}

      {/* Accepted formats */}
      {showPreview && (
        <p className="mt-3 text-xs text-gray-400">
          Formatlar:{" "}
          <span className="font-mono">3.5</span> ·{" "}
          <span className="font-mono">7/2</span> ·{" "}
          <span className="font-mono">-4</span>
        </p>
      )}
    </div>
  );
});
