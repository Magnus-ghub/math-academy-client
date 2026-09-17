"use client";

import { useEffect, useRef, useState } from "react";
import type { MathfieldElement, VirtualKeyboardLayout } from "mathlive";
import "mathlive/fonts.css";
import { initKeyboardDrag } from "@/lib/mathliveKeyboardDrag";

// Eski (qo'lda qurilgan) AnswerKeyboard'dagi aynan shu tugmalar to'plami —
// standart MathLive klaviaturasi juda ko'p (harflar, yunon, ramzlar)
// qatlamlarni ko'rsatib, Milliy Sertifikat uchun ortiqcha edi. Ikki qatlam:
// "numeric" (raqamlar, standart) va "functions" (kasr/ildiz/trigonometrik —
// pastki chap tugma bilan ochiladi, "123" bilan qaytiladi).
const SMALL = "small";
// Belgi tugmalarining "□" ikonkasi — \Box amssymb buyrug'i KaTeX/MathLive'da
// qo'llab-quvvatlanadi, haqiqiy matematik shrift bilan render bo'ladi.
const CUSTOM_LAYOUT: VirtualKeyboardLayout = {
  layers: [
    {
      id: "numeric",
      rows: [
        [
          { latex: "x", class: SMALL },
          { latex: "y", class: SMALL },
          { latex: "\\pi", class: SMALL },
          { latex: "e", class: SMALL },
          { latex: "\\Box^\\circ", insert: "#@^{\\circ}", class: SMALL },
        ],
        ["7", "8", "9", "\\times", { latex: "\\div", insert: "\\frac{#@}{#?}" }],
        ["4", "5", "6", "+", "-"],
        ["1", "2", "3", ".", "[backspace]"],
        [
          { label: "<span style='display:flex;flex-direction:column;line-height:1.05;font-size:10px'>sin<span>&radic;x&sup2;</span></span>", command: ["switchKeyboardLayer", "functions"] },
          "0",
          "[left]",
          "[right]",
          { label: "&#9166;", command: "hideVirtualKeyboard", class: "action" },
        ],
      ],
    },
    {
      id: "functions",
      rows: [
        [
          { latex: "x", class: SMALL },
          { latex: "y", class: SMALL },
          { latex: "\\pi", class: SMALL },
          { latex: "e", class: SMALL },
          { latex: "\\Box^\\circ", insert: "#@^{\\circ}", class: SMALL },
        ],
        [
          { latex: "\\frac{\\Box}{\\Box}", insert: "\\frac{#@}{#?}" },
          { latex: "\\Box^2", insert: "#@^{2}" },
          { latex: "\\Box^\\Box", insert: "#@^{#?}" },
          { latex: "\\sin(\\Box)", insert: "\\sin(#?)" },
          { latex: "\\sin^{-1}(\\Box)", insert: "\\sin^{-1}(#?)" },
        ],
        [
          { latex: "\\sqrt{\\Box}", insert: "\\sqrt{#0}" },
          { latex: "\\sqrt[n]{\\Box}", insert: "\\sqrt[#?]{#0}" },
          { latex: "\\cos(\\Box)", insert: "\\cos(#?)" },
          { latex: "\\cos^{-1}(\\Box)", insert: "\\cos^{-1}(#?)" },
        ],
        [
          { latex: "\\log_\\Box(\\Box)", insert: "\\log_{#?}(#?)" },
          { latex: "\\ln(\\Box)", insert: "\\ln(#?)" },
          { latex: "\\tan(\\Box)", insert: "\\tan(#?)" },
          { latex: "\\tan^{-1}(\\Box)", insert: "\\tan^{-1}(#?)" },
        ],
        [
          { label: "123", command: ["switchKeyboardLayer", "numeric"] },
          "(",
          ")",
          "[left]",
          "[right]",
          "[backspace]",
        ],
      ],
    },
  ],
};

// TypeScript/JSX <math-field> haqida bilmaydi — bu maxsus elementni
// tanitib qo'yamiz (React 19'da JSX nomlar maydoni React ichida joylashgan).
declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- JSX IntrinsicElements'ni kengaytirishning yagona yo'li shu.
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement>;
    }
  }
}

interface Props {
  value: string; // LaTeX
  onChange: (v: string) => void;
}

// MathLive kutubxonasiga asoslangan to'liq strukturaviy matematik input —
// kasr, ildiz, daraja, trigonometrik funksiyalar uchun HAQIQIY kursor
// navigatsiyasi va o'zining virtual klaviaturasi bilan (endi bizga alohida
// AnswerKeyboard/pozitsiyalash mantiqi kerak emas — kutubxonaning o'zi
// klaviaturani ekran pastida ko'rsatadi va qaysi maydon fokusda bo'lsa
// o'shanga ergashadi).
export function MathLiveInput({ value, onChange }: Props) {
  const fieldRef = useRef<MathfieldElement | null>(null);
  const [ready, setReady] = useState(false);

  // "mathlive"ning o'zi customElements'ni ro'yxatdan o'tkazadi — bu
  // brauzerga xos amal, shuning uchun faqat mijoz (client) tomonda,
  // useEffect ichida yuklanadi (server-side render paytida ishlamaydi).
  useEffect(() => {
    let cancelled = false;
    import("mathlive").then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !fieldRef.current) return;
    const mf = fieldRef.current;
    mf.placeholder = "\\text{Javobni kiriting}";
    // Standart MathLive klaviaturasi (harflar, yunon, ramzlar qatlamlari)
    // o'rniga faqat kerakli tugmalardan iborat maxsus layout.
    if (window.mathVirtualKeyboard) window.mathVirtualKeyboard.layouts = CUSTOM_LAYOUT;
    // Suriladigan tutqichni sozlaydi (idempotent) va uning ko'rinishini
    // klaviaturaning HAQIQIY ochiq/yopiqligiga bog'laydi.
    initKeyboardDrag();
    // Klaviaturani o'zimiz boshqaramiz: maydon fokuslanganda ko'rsatamiz.
    // Yopish ENDI faqat "X" tugmasi yoki maydon ichidagi klaviatura
    // belgisi orqali sodir bo'ladi — ekranning istalgan joyiga bosish
    // (masalan tutqichni sudrash yoki boshqa savol elementiga tegish)
    // klaviaturani yopmasligi kerak, shuning uchun "focusout"da ATAYLAB
    // yashirmaymiz.
    mf.mathVirtualKeyboardPolicy = "manual";
    const show = () => {
      window.mathVirtualKeyboard?.show();
      // Klaviatura ekran pastidan chiqqanda savol/maydonni to'smasligi
      // uchun bir oz kutib (klaviatura animatsiyasi tugagach) o'rtaga
      // aylantiramiz.
      setTimeout(() => mf.scrollIntoView({ behavior: "smooth", block: "center" }), 250);
    };
    mf.addEventListener("focusin", show);
    return () => {
      mf.removeEventListener("focusin", show);
      // Savol almashib, maydon DOM'dan olib tashlanganda klaviatura ochiq
      // qolib ketmasligi uchun shu yerda yashiramiz.
      window.mathVirtualKeyboard?.hide();
    };
  }, [ready]);

  // Tashqaridan `value` o'zgarsa (masalan savol almashsa) maydonni
  // sinxronlaymiz — lekin talaba yozayotganda o'z-o'ziga yozib qo'ymasin
  // deb, faqat HAQIQIY farq bo'lsa yangilaymiz.
  useEffect(() => {
    if (ready && fieldRef.current && fieldRef.current.value !== value) {
      fieldRef.current.value = value;
    }
  }, [value, ready]);

  if (!ready) {
    return (
      <div
        className="rounded-xl border-2 border-gray-300 bg-gray-50 animate-pulse"
        style={{ width: 160, height: 64 }}
      />
    );
  }

  return (
    <>
      <style>{`
        /* MathLive fokuslanganda o'zining ko'k halqa/soya effektini
           qo'shadi — buni olib tashlaymiz (chegara rangi o'zgarishi
           kifoya, alohida "soya" kerak emas). */
        math-field:focus-within {
          outline: none;
          box-shadow: none;
        }
        /* Ichkaridagi "menyu" (hamburger, ≡) tugmasi kerak emas — faqat
           klaviatura ochish belgisi qolsin. */
        math-field::part(menu-toggle) {
          display: none;
        }
        /* "zoom" MathLive'ning o'zi JS orqali hisoblab qo'ygan balandligi
           bilan mos kelmay, pastki qatorni kesib qo'yardi — shuning uchun
           kutubxonaning o'zi tan oladigan o'lcham o'zgaruvchilaridan
           foydalanamiz (faqat PC/kattaroq ekranda, sensorli qurilmada
           standart qulay o'lcham qoladi). Raqam va tugma balandligi birga
           kichraysin deb ikkalasini ham pasaytiramiz.
        */
        @media (min-width: 768px) {
          :root {
            --keycap-height: 38px;
            --keycap-font-size: 16px;
            --keycap-shift-font-size: 10px;
            --keycap-small-font-size: 10px;
            --keyboard-toolbar-font-size: 15px;
          }
        }
        /* Klaviatura standart holda butun ekran kengligida chiqadi.
           MathLive balandlik/chiqish-animatsiyasini (top, bottom, height,
           --_keyboard-height CSS o'zgaruvchisi) o'zi hisoblab boshqaradi —
           shunga UMUMAN TEGMASDAN, faqat KENGLIKni cheklab ekran o'rtasiga
           torraytiramiz. (Konteynerni almashtirish — mathVirtualKeyboard
           .container — klaviaturani butunlay ko'rinmas qilib qo'ygani
           uchun ataylab ishlatilmayapti.) */
        @media (min-width: 640px) {
          body > .ML__keyboard {
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: min(420px, calc(100vw - 24px)) !important;
          }
        }
      `}</style>
      <math-field
        ref={fieldRef}
        onInput={(e) => onChange((e.target as MathfieldElement).value)}
        style={{
          display: "inline-block",
          minWidth: 160,
          fontSize: 22,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: "#6b7280",
          padding: "10px 14px",
        }}
      >
        {value}
      </math-field>
    </>
  );
}
