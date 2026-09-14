"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Delete, CornerDownLeft } from "lucide-react";

interface Props {
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onMoveCursor: (dir: -1 | 1) => void;
  onClose: () => void;
  onDone: () => void;
}

// Real SAT'dagi "Answer entry keyboard"ga o'xshash — hisoblamaydi, faqat
// bosilgan belgini javob maydoniga (kursor turgan joyga) yozadi.
export function AnswerKeyboard({ onInsert, onBackspace, onMoveCursor, onClose, onDone }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [pos, setPos] = useState({ x: 40, y: 80 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const onDragStart = (e: React.MouseEvent) => {
    if (isMobile) return;
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
  }, []);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  const [advanced, setAdvanced] = useState(false);

  const num = "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground font-medium text-lg";
  const opr = "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-primary font-bold text-lg";
  const sci = "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground text-xs";
  const ctl = "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-foreground";

  type B = { t: React.ReactNode; a: () => void; c: string };

  const topRow: B[] = [
    { t: "x", a: () => onInsert("x"), c: sci },
    { t: "y", a: () => onInsert("y"), c: sci },
    { t: "z", a: () => onInsert("z"), c: sci },
    { t: "π", a: () => onInsert("π"), c: sci },
    { t: "e", a: () => onInsert("e"), c: sci },
    { t: "□°", a: () => onInsert("°"), c: sci },
  ];

  const basicRows: B[][] = [
    [
      { t: "7", a: () => onInsert("7"), c: num },
      { t: "8", a: () => onInsert("8"), c: num },
      { t: "9", a: () => onInsert("9"), c: num },
      { t: "×", a: () => onInsert("×"), c: opr },
      { t: "÷", a: () => onInsert("÷"), c: opr },
    ],
    [
      { t: "4", a: () => onInsert("4"), c: num },
      { t: "5", a: () => onInsert("5"), c: num },
      { t: "6", a: () => onInsert("6"), c: num },
      { t: "+", a: () => onInsert("+"), c: opr },
      { t: "−", a: () => onInsert("−"), c: opr },
    ],
    [
      { t: "1", a: () => onInsert("1"), c: num },
      { t: "2", a: () => onInsert("2"), c: num },
      { t: "3", a: () => onInsert("3"), c: num },
      { t: ".", a: () => onInsert("."), c: num },
      { t: <Delete className="w-4 h-4 mx-auto" />, a: onBackspace, c: ctl },
    ],
    [
      {
        t: (
          <span className="flex flex-col items-center leading-tight text-[10px]">
            <span>sin</span>
            <span>√x²</span>
          </span>
        ),
        a: () => setAdvanced(true),
        c: sci,
      },
      { t: "0", a: () => onInsert("0"), c: num },
      { t: <ChevronLeft className="w-4 h-4 mx-auto" />, a: () => onMoveCursor(-1), c: ctl },
      { t: <ChevronRight className="w-4 h-4 mx-auto" />, a: () => onMoveCursor(1), c: ctl },
      { t: <CornerDownLeft className="w-4 h-4 mx-auto" />, a: onDone, c: "bg-primary hover:bg-primary/90 text-white" },
    ],
  ];

  const advancedRows: B[][] = [
    [
      { t: "□/□", a: () => onInsert("/"), c: sci },
      { t: "□²", a: () => onInsert("²"), c: sci },
      { t: "□^□", a: () => onInsert("^"), c: sci },
      { t: "sin(□)", a: () => onInsert("sin("), c: sci },
      { t: "sin⁻¹(□)", a: () => onInsert("sin⁻¹("), c: sci },
    ],
    [
      { t: "√□", a: () => onInsert("√"), c: sci },
      { t: "ⁿ√□", a: () => onInsert("ⁿ√"), c: sci },
      { t: "cos(□)", a: () => onInsert("cos("), c: sci },
      { t: "cos⁻¹(□)", a: () => onInsert("cos⁻¹("), c: sci },
      { t: "", a: () => {}, c: "invisible" },
    ],
    [
      { t: "log□(□)", a: () => onInsert("log("), c: sci },
      { t: "ln(□)", a: () => onInsert("ln("), c: sci },
      { t: "tan(□)", a: () => onInsert("tan("), c: sci },
      { t: "tan⁻¹(□)", a: () => onInsert("tan⁻¹("), c: sci },
      { t: "", a: () => {}, c: "invisible" },
    ],
    [
      { t: "123", a: () => setAdvanced(false), c: ctl },
      { t: "(", a: () => onInsert("("), c: sci },
      { t: ")", a: () => onInsert(")"), c: sci },
      { t: <ChevronLeft className="w-4 h-4 mx-auto" />, a: () => onMoveCursor(-1), c: ctl },
      { t: <ChevronRight className="w-4 h-4 mx-auto" />, a: () => onMoveCursor(1), c: ctl },
    ],
  ];

  const panelStyle: React.CSSProperties = isMobile
    ? { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50 }
    : { position: "fixed", left: pos.x, top: pos.y, width: 340, zIndex: 50 };

  return (
    <>
      {isMobile && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}

      <div
        style={panelStyle}
        className="bg-background rounded-t-2xl md:rounded-2xl border border-border shadow-2xl select-none overflow-hidden"
      >
        <div
          className={`flex items-center justify-between px-4 py-2 border-b border-border ${!isMobile ? "cursor-grab active:cursor-grabbing" : ""}`}
          onMouseDown={onDragStart}
        >
          <span className="text-xs font-semibold text-muted-foreground">Javob klaviaturasi</span>
          <button
            onClick={onClose}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-2 pt-2 grid grid-cols-6 gap-1 border-b border-border pb-2 mb-1">
          {topRow.map((btn, i) => (
            <button
              key={i}
              onClick={btn.a}
              onMouseDown={(e) => e.stopPropagation()}
              className={`py-2 rounded-xl text-sm transition-colors active:scale-95 ${btn.c}`}
            >
              {btn.t}
            </button>
          ))}
        </div>

        <div className="px-2 pb-3 grid grid-cols-5 gap-1">
          {(advanced ? advancedRows : basicRows).flat().map((btn, i) => (
            <button
              key={i}
              onClick={btn.a}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={btn.c === "invisible"}
              className={`py-3.5 rounded-2xl text-sm transition-colors active:scale-95 ${btn.c}`}
            >
              {btn.t}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
