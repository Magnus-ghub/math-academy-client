"use client";

import { useEffect, useRef, useState } from "react";
import type { MathfieldElement } from "mathlive";
import "mathlive/fonts.css";

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
    // Klaviaturani o'zimiz boshqaramiz: maydon fokuslanganda ko'rsatamiz,
    // fokusdan chiqqanda yashiramiz — bir nechta math-field (masalan
    // TWO_PART'ning a/b qismlari) bo'lsa ham, klaviatura doim FAOL
    // maydonga ergashadi.
    mf.mathVirtualKeyboardPolicy = "manual";
    const show = () => {
      window.mathVirtualKeyboard?.show();
      // Klaviatura ekran pastidan chiqqanda savol/maydonni to'smasligi
      // uchun bir oz kutib (klaviatura animatsiyasi tugagach) o'rtaga
      // aylantiramiz.
      setTimeout(() => mf.scrollIntoView({ behavior: "smooth", block: "center" }), 250);
    };
    const hide = () => window.mathVirtualKeyboard?.hide();
    mf.addEventListener("focusin", show);
    mf.addEventListener("focusout", hide);
    return () => {
      mf.removeEventListener("focusin", show);
      mf.removeEventListener("focusout", hide);
      // Savol almashib, maydon fokusda turgan holda DOM'dan olib
      // tashlanganda ba'zi brauzerlar "focusout"ni chaqirmaydi — klaviatura
      // ochiq qolib ketmasligi uchun bu yerda ham yashiramiz.
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
