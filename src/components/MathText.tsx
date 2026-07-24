"use client";

import katex from "katex";
import { useMemo } from "react";

interface MathTextProps {
  text: string;
  className?: string;
}

// AI tahlil matnlarida paragraf ajratish uchun asl "\n" (backslash+n, ikkita
// belgi) qatorlar orasiga tushib qoladi — masalan "...natija:\nBerilgan...".
// Bu haqiqiy qator ko'chirish emas, shuning uchun pastdagi LaTeX-buyruq
// regexi uni "\nBerilgan" kabi noto'g'ri buyruq deb o'qib, butun matnni
// buzadi. Faqat katta harf, "$" yoki qator oxiri bilan davom etsa (ya'ni
// paragraf chegarasi bo'lsa), haqiqiy qator ko'chirishga almashtiramiz —
// \nabla kabi haqiqiy LaTeX buyruqlar (kichik harf bilan davom etadi)
// tegilmay qoladi.
function normalizeLiteralNewlines(text: string): string {
  return text.replace(/\\n(?=[A-Z0-9]|\$|$)/g, "\n");
}

// Word/MathType'dan copy-paste qilingan formulalarda ko'rinmas Unicode
// operatorlar qoladi (function application, invisible times/plus/separator,
// zero-width space) — ko'zga ko'rinmaydi, lekin KaTeX ularni tushunmay,
// butun formulani "ln⁡ln8x" kabi buzib qo'yadi. Har qanday ishlovdan oldin
// olib tashlaymiz.
function stripInvisibleMathOperators(text: string): string {
  // U+2061 FUNCTION APPLICATION, U+2062 INVISIBLE TIMES, U+2063 INVISIBLE
  // SEPARATOR, U+2064 INVISIBLE PLUS, U+200B ZERO WIDTH SPACE, U+FEFF BOM
  return text.replace(/[⁡⁢⁣⁤​﻿]/g, "");
}

// "{" dan boshlab qavslarni chuqurligini hisoblab, mos yopiluvchi "}" ni
// topadi — \dfrac{8x^{7}}{9} kabi ichma-ich qavsli argumentlarni bitta oddiy
// regex bilan (masalan {[^}]*}) to'g'ri o'qib bo'lmaydi, chunki u birinchi
// uchragan "}" da (ya'ni ichki x^{7} ning yopilishida) to'xtab qoladi.
function readBraceGroup(text: string, start: number): number | null {
  if (text[start] !== "{") return null;
  let depth = 0;
  for (let j = start; j < text.length; j++) {
    if (text[j] === "{") depth++;
    else if (text[j] === "}") {
      depth--;
      if (depth === 0) return j + 1;
    }
  }
  return null; // qavs yopilmagan
}

// $...$ tashqarisidagi \pi, \sqrt{x}, \dfrac{a^{n}}{b} kabi LaTeX
// buyruqlarini, shuningdek x^2, b^{-2} kabi $ belgisiz darajalarni (AI
// tahlil matnlarida ko'p uchraydi) avtomatik $...$ bilan o'raydi, KaTeX
// o'qiy olsin. Qavslarni readBraceGroup orqali muvozanatlab o'qiydi.
function wrapBareLatex(text: string): string {
  let result = "";
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    // \komanda{arg1}{arg2} — \frac, \dfrac, \sqrt va h.k.
    if (ch === "\\" && /[a-zA-Z]/.test(text[i + 1] ?? "")) {
      let end = i + 1;
      while (end < n && /[a-zA-Z]/.test(text[end])) end++;
      for (let g = 0; g < 2; g++) {
        const closeIdx = readBraceGroup(text, end);
        if (closeIdx === null) break;
        end = closeIdx;
      }
      result += `$${text.slice(i, end)}$`;
      i = end;
      continue;
    }

    // x^{n}, x^2, x^-2 kabi $ belgisiz darajalar
    if (/[A-Za-z0-9)\]]/.test(ch) && text[i + 1] === "^") {
      let end = i + 2;
      if (text[end] === "{") {
        end = readBraceGroup(text, end) ?? end;
      } else {
        if (text[end] === "-") end++;
        while (end < n && /[A-Za-z0-9]/.test(text[end])) end++;
      }
      result += `$${text.slice(i, end)}$`;
      i = end;
      continue;
    }

    result += ch;
    i++;
  }

  return result;
}

function preprocessText(text: string): string {
  const DELIM = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  const parts = text.split(DELIM);
  return parts
    .map((part, i) => (i % 2 === 1 ? part : wrapBareLatex(part))) // toq indeks — allaqachon math delimiters ichida
    .join("");
}

type MathSegment =
  | { kind: "text"; content: string }
  | { kind: "math"; content: string; displayMode: boolean };

// Matnni $$...$$ (block) va $...$ (inline) formulalarga, qolganini oddiy
// matnga ajratadi. MathText (render) va validateLatex (admin panelidagi
// saqlashdan oldingi tekshiruv) ayni shu bo'lishni ishlatadi — ajratish
// mantig'i ikki joyda alohida yozilib, bir-biridan chetlashib qolmasin.
function splitMathSegments(text: string): MathSegment[] {
  const processed = preprocessText(normalizeLiteralNewlines(stripInvisibleMathOperators(text)));
  const segments: MathSegment[] = [];

  const blockSplit = processed.split(/\$\$(.+?)\$\$/g);
  blockSplit.forEach((part, i) => {
    if (i % 2 === 1) {
      segments.push({ kind: "math", content: part, displayMode: true });
      return;
    }

    const inlineSplit = part.split(/\$(.+?)\$/g);
    inlineSplit.forEach((seg, j) => {
      if (j % 2 === 1) {
        segments.push({ kind: "math", content: seg, displayMode: false });
      } else if (seg) {
        segments.push({ kind: "text", content: seg });
      }
    });
  });

  return segments;
}

// Admin panelida savol/variant matnini saqlashdan oldin LaTeX xatolarini
// aniqlaydi — bo'sh massiv qaytsa, xato topilmagan. Ikki bosqichda
// tekshiradi: (1) butun matndagi "{" va "}" sonini solishtirib, tipik
// "ortiqcha/yetishmayotgan qavs" xatolarini (masalan \sqrt{24}}} kabi) tez
// ushlaydi; (2) har bir formula segmentini throwOnError:true bilan KaTeX'dan
// o'tkazib, boshqa sintaksis xatolarini (noma'lum buyruq va h.k.) topadi.
export function validateLatex(text: string): string[] {
  if (!text) return [];
  const errors: string[] = [];

  const openCount = (text.match(/\{/g) ?? []).length;
  const closeCount = (text.match(/\}/g) ?? []).length;
  if (openCount !== closeCount) {
    errors.push(`Qavslar soni mos emas: "{" – ${openCount} ta, "}" – ${closeCount} ta`);
  }

  for (const seg of splitMathSegments(text)) {
    if (seg.kind !== "math") continue;
    try {
      katex.renderToString(seg.content, { throwOnError: true, displayMode: seg.displayMode });
    } catch (e) {
      errors.push(`Formula xatosi ("${seg.content}"): ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return errors;
}

// Matnni $...$ (inline) va $$...$$ (block) formulalarga ajratib,
// har birini KaTeX bilan HTML'ga aylantiradi.
export function MathText({ text, className }: MathTextProps) {
  const html = useMemo(() => {
    if (!text) return "";

    return splitMathSegments(text)
      .map((seg) => {
        if (seg.kind === "text") {
          // HTML teglarni (table, tr, td va h.k.) safe render qilamiz
          const SAFE = /^<\/?(table|thead|tbody|tr|th|td|br|b|i|strong|em|span|p|ul|ol|li)(\s[^>]*)?>$/i;
          return seg.content.split(/(<[^>]*>)/g).map((chunk) => {
            if (/^<[^>]*>$/.test(chunk)) {
              return SAFE.test(chunk) ? chunk : chunk.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
            return chunk
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/\n/g, "<br/>");
          }).join("");
        }

        try {
          return katex.renderToString(seg.content, {
            throwOnError: false,
            displayMode: seg.displayMode,
          });
        } catch {
          return seg.content;
        }
      })
      .join("");
  }, [text]);

  return (
    <span
      className={`math-text font-cmu-serif inline-block max-w-full wrap-anywhere ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}