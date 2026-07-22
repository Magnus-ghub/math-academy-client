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

// $...$ yoki $$...$$ ichida bo'lmagan \pi, \sqrt{x}, \frac{a}{b} kabi LaTeX
// buyruqlarini, shuningdek x^2, b^2 kabi $ belgisiz darajalarni (AI tahlil
// matnlarida ko'p uchraydi) avtomatik $...$ bilan o'raydi, KaTeX o'qiy olsin.
function preprocessText(text: string): string {
  const DELIM = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  const parts = text.split(DELIM);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part; // allaqachon math delimiters ichida
      return part.replace(
        /\\[a-zA-Z]+(?:\{[^}]*\}(?:\{[^}]*\})?)?|[A-Za-z0-9)\]]\^\{?-?[A-Za-z0-9]+\}?/g,
        (match) => `$${match}$`
      );
    })
    .join("");
}

// Matnni $...$ (inline) va $$...$$ (block) formulalarga ajratib,
// har birini KaTeX bilan HTML'ga aylantiradi.
export function MathText({ text, className }: MathTextProps) {
  const html = useMemo(() => {
    if (!text) return "";

    const processed = preprocessText(normalizeLiteralNewlines(stripInvisibleMathOperators(text)));

    // Avval block formulalarni ($$...$$) ajratamiz
    const blockSplit = processed.split(/\$\$(.+?)\$\$/g);

    return blockSplit
      .map((part, i) => {
        const isBlock = i % 2 === 1;

        if (isBlock) {
          try {
            return katex.renderToString(part, {
              throwOnError: false,
              displayMode: true,
            });
          } catch {
            return part;
          }
        }

        // Inline formulalarni ($...$) shu segment ichida qayta ajratamiz
        const inlineSplit = part.split(/\$(.+?)\$/g);
        return inlineSplit
          .map((seg, j) => {
            const isInline = j % 2 === 1;
            if (!isInline) {
              // HTML teglarni (table, tr, td va h.k.) safe render qilamiz
              const SAFE = /^<\/?(table|thead|tbody|tr|th|td|br|b|i|strong|em|span|p|ul|ol|li)(\s[^>]*)?>$/i;
              return seg.split(/(<[^>]*>)/g).map((chunk) => {
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
              return katex.renderToString(seg, {
                throwOnError: false,
                displayMode: false,
              });
            } catch {
              return seg;
            }
          })
          .join("");
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