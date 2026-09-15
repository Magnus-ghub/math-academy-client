"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { MathText } from "@/components/MathText";

export interface SprInputHandle {
  insertAtCursor: (text: string) => void;
  backspaceAtCursor: () => void;
  moveCursor: (dir: -1 | 1) => void;
}

// AnswerKeyboard talaba yozgan xom matnga ASCII-o'xshash belgilar
// ("sin(", "sin⁻¹(", "√", "²", "°") qo'shadi — bularni qog'ozdagidek
// haqiqiy LaTeX ko'rinishga aylantiradi. To'liq parser emas (chuqur
// ichma-ich ifodalarni bilmaydi), lekin SPR javoblari odatda qisqa —
// bitta kasr/ildiz/trigonometrik chaqiruv darajasida — shu holatlar
// uchun to'g'ri ishlaydi.
function sprToLatex(raw: string): string {
  if (!raw) return "";
  let s = raw;

  // sin⁻¹ / cos⁻¹ / tan⁻¹  ->  \sin^{-1} va h.k.
  s = s.replace(/(sin|cos|tan)⁻¹/g, "\\$1^{-1}");
  // sin( / cos( / tan( / log( / ln(  ->  \sin( va h.k. (qavsning o'zi
  // pastda BARCHA qavslar bilan birga \left \right ga aylantiriladi)
  s = s.replace(/(sin|cos|tan|log|ln)(?=\()/g, "\\$1");

  // Har qanday oddiy qavsni avtomatik o'lchamlanadigan \left( \right)ga
  // aylantiradi — ⁿ√/√ argumentini aniqlashda ham shu ishlatiladi.
  s = s.replace(/\(/g, "\\left(").replace(/\)/g, "\\right)");

  // ⁿ√ va √ — keyingi son yoki \left(...\right) guruhini argument qiladi
  s = s.replace(/ⁿ√(\\left\(.*?\\right\)|-?\d+(?:\.\d+)?)/g, (_m, g) => `\\sqrt[n]{${stripOuterParens(g)}}`);
  s = s.replace(/√(\\left\(.*?\\right\)|-?\d+(?:\.\d+)?)/g, (_m, g) => `\\sqrt{${stripOuterParens(g)}}`);

  // x² kabi — oldingi son/qavs/harfga darajani biriktiradi
  s = s.replace(/(\\right\)|\d|[a-zA-Z])²/g, "$1^{2}");

  // 112.5° kabi — oldingi songa daraja belgisini biriktiradi
  s = s.replace(/(\d)°/g, "$1^{\\circ}");

  // "÷" ham "/" kabi kasrga aylanadi
  s = s.replace(/÷/g, "/");

  // Har bir "atom/atom" juftligini alohida kasrga aylantiradi (butun
  // qolgan matnni emas!) — shuning uchun kasr tugagach (masalan "7/2"dan
  // keyin "+3" yozilsa) davomi maxrajga "yopishib qolmay", tashqarida
  // oddiy matn sifatida qoladi. Bir nechta mustaqil kasr ("3/4+1/2") ham
  // to'g'ri ishlaydi.
  s = s.replace(FRACTION_RE, "\\frac{$1}{$2}");

  return s;
}

function stripOuterParens(g: string): string {
  const m = g.match(/^\\left\((.*)\\right\)$/);
  return m ? m[1] : g;
}

// Kasr surat/maxraji bo'la oladigan "atom"lar: funksiya chaqiruvi
// (\sin\left(...\right) kabi), oddiy qavs guruhi, ildiz guruhi yoki son
// (π bilan yoki π'ning o'zi, masalan "9π"). Boshida "-"/"−" ATOMga
// kiritilmaydi — aks holda "7/2-1/3" kabi ayirma ikkinchi kasr suratiga
// "yopishib", "7/2 minus 1/3" emas, buzilgan ko'rinish chiqadi.
const NUMBER_SRC = String.raw`(?:\d+(?:\.\d+)?π?|π)`;
const ATOM_SRC = String.raw`(?:\\(?:sin|cos|tan|log|ln)(?:\^\{-1\})?\\left\([^()]*\\right\)|\\left\([^()]*\\right\)|\\sqrt(?:\[n\])?\{[^{}]*\}|${NUMBER_SRC})`;
const FRACTION_RE = new RegExp(`(${ATOM_SRC})/(${ATOM_SRC})`, "g");

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
  onFocus?: (rect: DOMRect) => void;
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
  const [isFocused, setIsFocused] = useState(false);

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

  // useVirtualKeyboard rejimida inputning o'zi ichida qog'ozdagidek haqiqiy
  // LaTeX (KaTeX) ko'rinishda ko'rsatiladi — pastki matn shaffof qilinadi,
  // real input esa (kursor/klaviatura ishlashi uchun) joyida qoladi.
  const latex = sprToLatex(value);

  return (
    <div>
      {/* Input box — SAT style */}
      <div className="flex flex-col items-start gap-4">
        <div className="relative" style={{ width: boxWidth }}>
          <input
            ref={inputRef}
            type="text"
            // useVirtualKeyboard'da ham inputMode="none" — mobilda o'zimizning
            // AnswerKeyboard bor, OS'ning ekran klaviaturasi kerak emas.
            // readOnly EMAS — kompyuter (fizik) klaviaturadan ham yozish
            // ishlashi kerak, ekrandagi klaviatura bilan bir vaqtda.
            inputMode={useVirtualKeyboard ? "none" : "decimal"}
            autoComplete="off"
            spellCheck={false}
            maxLength={maxLength}
            placeholder="Javobni kiriting"
            className="placeholder:text-gray-400 placeholder:font-normal placeholder:text-[13px]"
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
              color: useVirtualKeyboard ? "transparent" : "#111827",
              caretColor: useVirtualKeyboard ? "transparent" : "#1e3a5f",
              display: "block",
              cursor: "text",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#1e3a5f";
              setIsFocused(true);
              const target = e.target;
              if (useVirtualKeyboard) {
                // Ekran klaviaturasi savol/rasmni to'smasligi uchun,
                // maydonni avval (animatsiyasiz) ekran markaziga
                // aylantiramiz, SO'NGRA — bitta kadr kutib — YANGI
                // (scroll'dan keyingi) joyni uzatamiz. Aks holda hali
                // eski (scroll'dan oldingi) joy asosida hisoblangan
                // klaviatura pozitsiyasi savol ustiga chiqib qolardi.
                target.scrollIntoView({ behavior: "auto", block: "center" });
                requestAnimationFrame(() => {
                  onFocus?.(target.getBoundingClientRect());
                });
              } else {
                onFocus?.(target.getBoundingClientRect());
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#6b7280";
              setIsFocused(false);
            }}
          />
          {useVirtualKeyboard && (
            // Haqiqiy LaTeX (KaTeX) render — readOnly inputning o'zi
            // ustidan shaffof qoplama sifatida. Kursorning aniq o'rnini
            // render ichida ko'rsatish shart emas — o'ng tomonda mizillovchi
            // chiziq fokuslanganini bildiradi (real kursor o'rni cursorRef'da
            // saqlanadi, AnswerKeyboard shu bo'yicha yozadi).
            <div
              className="absolute inset-0 flex items-center justify-center gap-0.5"
              style={{ pointerEvents: "none", fontSize: Math.min(fontSize, 20) }}
            >
              {value && <MathText text={`$${latex}$`} />}
              {isFocused && (
                <span
                  className="animate-pulse"
                  style={{ display: "inline-block", width: 2, height: "1.1em", background: "#1e3a5f" }}
                />
              )}
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
            {value ? <MathText text={`$${latex}$`} /> : null}
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
