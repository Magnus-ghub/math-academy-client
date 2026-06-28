"use client";

import katex from "katex";
import { useMemo } from "react";

interface MathTextProps {
  text: string;
  className?: string;
}

// $...$ yoki $$...$$ ichida bo'lmagan \pi, \sqrt{x}, \frac{a}{b} kabi
// LaTeX buyruqlarini avtomatik $...$ bilan o'raydi, KaTeX o'qiy olsin.
function preprocessText(text: string): string {
  const DELIM = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  const parts = text.split(DELIM);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part; // allaqachon math delimiters ichida
      return part.replace(
        /\\[a-zA-Z]+(?:\{[^}]*\}(?:\{[^}]*\})?)?/g,
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

    const processed = preprocessText(text);

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
                return chunk.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
      className={`math-text ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}