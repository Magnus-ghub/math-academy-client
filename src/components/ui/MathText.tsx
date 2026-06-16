"use client";

import { InlineMath, BlockMath } from "react-katex";

interface Props {
  text: string;
  className?: string;
}

// "$$...$$" block, "$...$" inline formulalarni parse qilib render qiladi
export default function MathText({ text, className }: Props) {
  if (!text) return null;

  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
          return (
            <span key={i} className="block my-2">
              <BlockMath math={part.slice(2, -2).trim()} />
            </span>
          );
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <InlineMath key={i} math={part.slice(1, -1).trim()} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
