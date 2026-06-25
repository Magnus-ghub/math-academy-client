"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface Props { onClose: () => void; }

interface ParenFrame { prev: number | null; op: string | null; hist: string; }

export function FloatingCalculator({ onClose }: Props) {
  // ── Responsive ────────────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Drag ──────────────────────────────────────────────────────────────────
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

  // ── Calc state ────────────────────────────────────────────────────────────
  const [display, setDisplay]       = useState("0");
  const [history, setHistory]       = useState("");
  const [prev, setPrev]             = useState<number | null>(null);
  const [op, setOp]                 = useState<string | null>(null);
  const [fresh, setFresh]           = useState(false);
  const [isSecond, setIsSecond]     = useState(false);
  const [isDeg, setIsDeg]           = useState(true);
  const [parenStack, setParenStack] = useState<ParenFrame[]>([]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const fmt = (n: number): string => {
    if (isNaN(n)) return "Xato";
    if (!isFinite(n)) return n > 0 ? "∞" : "-∞";
    const s = parseFloat(n.toPrecision(10)).toString();
    return s.length > 13 ? n.toExponential(5) : s;
  };

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity;
    let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
  };

  const applyOp = (a: number, b: number, o: string): number => {
    if (o === "+") return a + b;
    if (o === "−") return a - b;
    if (o === "×") return a * b;
    if (o === "÷") return b !== 0 ? a / b : NaN;
    if (o === "xʸ") return Math.pow(a, b);
    return b;
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const pressDigit = (d: string) => {
    if (fresh) { setDisplay(d === "." ? "0." : d); setFresh(false); }
    else {
      if (d === "." && display.includes(".")) return;
      if (display.length >= 14) return;
      setDisplay(display === "0" && d !== "." ? d : display + d);
    }
  };

  const pressBinaryOp = (o: string) => {
    const cur = parseFloat(display);
    let result = cur;
    if (prev !== null && op && !fresh) {
      result = applyOp(prev, cur, op);
      setDisplay(fmt(result));
    }
    setPrev(result);
    setOp(o);
    setHistory(`${fmt(result)} ${o}`);
    setFresh(true);
    setIsSecond(false);
  };

  const pressEquals = () => {
    if (prev === null || !op) { setIsSecond(false); return; }
    const cur = parseFloat(display);
    const result = applyOp(prev, cur, op);
    setHistory(`${fmt(prev)} ${op} ${fmt(cur)} =`);
    setDisplay(fmt(result));
    setPrev(null); setOp(null); setFresh(true); setIsSecond(false);
  };

  const pressClear = () => {
    setDisplay("0"); setPrev(null); setOp(null); setFresh(false);
    setHistory(""); setParenStack([]); setIsSecond(false);
  };

  const pressBack = () => {
    if (fresh || display === "Xato" || display === "∞") { setDisplay("0"); setFresh(false); return; }
    const next = display.slice(0, -1);
    setDisplay(next.length === 0 || next === "-" ? "0" : next);
  };

  const pressPercent = () => {
    const cur = parseFloat(display);
    const val = prev !== null && op ? (prev * cur) / 100 : cur / 100;
    setDisplay(fmt(val)); setFresh(true);
  };

  const pressUnary = (fn: string) => {
    const x = parseFloat(display);
    let result: number;
    switch (fn) {
      case "sin":   result = Math.sin(isDeg ? toRad(x) : x);           break;
      case "cos":   result = Math.cos(isDeg ? toRad(x) : x);           break;
      case "tan":   result = Math.tan(isDeg ? toRad(x) : x);           break;
      case "sin⁻¹": result = isDeg ? toDeg(Math.asin(x)) : Math.asin(x); break;
      case "cos⁻¹": result = isDeg ? toDeg(Math.acos(x)) : Math.acos(x); break;
      case "tan⁻¹": result = isDeg ? toDeg(Math.atan(x)) : Math.atan(x); break;
      case "lg":    result = Math.log10(x);                             break;
      case "10ˣ":   result = Math.pow(10, x);                           break;
      case "ln":    result = Math.log(x);                               break;
      case "eˣ":    result = Math.exp(x);                               break;
      case "√x":    result = Math.sqrt(x);                              break;
      case "x²":    result = x * x;                                     break;
      case "x!":    result = factorial(x);                              break;
      case "1/x":   result = x !== 0 ? 1 / x : NaN;                    break;
      default: return;
    }
    setHistory(`${fn}(${x})`);
    setDisplay(fmt(result));
    setFresh(true); setIsSecond(false);
  };

  const pressConst = (c: "π" | "e") => {
    setDisplay(c === "π" ? fmt(Math.PI) : fmt(Math.E));
    setFresh(true);
  };

  const pressOpenParen = () => {
    setParenStack(s => [...s, { prev, op, hist: history }]);
    setPrev(null); setOp(null); setDisplay("0"); setFresh(false);
    setHistory(prev !== null && op ? `${history} (` : "(");
  };

  const pressCloseParen = () => {
    if (parenStack.length === 0) return;
    const cur = parseFloat(display);
    const frame = parenStack[parenStack.length - 1];
    setParenStack(s => s.slice(0, -1));

    let inner = cur;
    if (prev !== null && op && !fresh) inner = applyOp(prev, cur, op);

    let final = inner;
    if (frame.prev !== null && frame.op) final = applyOp(frame.prev, inner, frame.op);

    setDisplay(fmt(final));
    setPrev(null); setOp(null); setFresh(true);
    setHistory(`${frame.hist}(${fmt(inner)})`);
  };

  // ── Button definitions ────────────────────────────────────────────────────
  const s = isSecond;

  // Styles — Samsung-inspired: light gray buttons, orange operators/=
  const num = "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground font-medium";
  const opr = "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-orange-500 font-bold";
  const sci = "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground text-xs";
  const clr = "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 text-orange-500 font-semibold";
  const eq  = "bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg";
  const snd = isSecond
    ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-semibold text-xs"
    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground text-xs";
  const deg = "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-foreground text-xs font-medium";

  type B = { t: string; a: () => void; c: string };

  const rows: B[][] = [
    [
      { t: "2nd",           a: () => setIsSecond(v => !v),               c: snd },
      { t: isDeg?"deg":"rad", a: () => setIsDeg(v => !v),                c: deg },
      { t: s?"sin⁻¹":"sin", a: () => pressUnary(s ? "sin⁻¹" : "sin"),   c: sci },
      { t: s?"cos⁻¹":"cos", a: () => pressUnary(s ? "cos⁻¹" : "cos"),   c: sci },
      { t: s?"tan⁻¹":"tan", a: () => pressUnary(s ? "tan⁻¹" : "tan"),   c: sci },
    ],
    [
      { t: "xʸ",             a: () => pressBinaryOp("xʸ"),              c: sci },
      { t: s?"10ˣ":"lg",     a: () => pressUnary(s ? "10ˣ" : "lg"),     c: sci },
      { t: s?"eˣ":"ln",      a: () => pressUnary(s ? "eˣ" : "ln"),      c: sci },
      { t: "(",              a: pressOpenParen,                           c: sci },
      { t: ")",              a: pressCloseParen,                          c: sci },
    ],
    [
      { t: s?"x²":"√x",     a: () => pressUnary(s ? "x²" : "√x"),       c: sci },
      { t: "AC",             a: pressClear,                               c: clr },
      { t: "⌫",             a: pressBack,                                c: clr },
      { t: "%",              a: pressPercent,                             c: opr },
      { t: "÷",              a: () => pressBinaryOp("÷"),                c: opr },
    ],
    [
      { t: "x!",            a: () => pressUnary("x!"),                   c: sci },
      { t: "7",             a: () => pressDigit("7"),                     c: num },
      { t: "8",             a: () => pressDigit("8"),                     c: num },
      { t: "9",             a: () => pressDigit("9"),                     c: num },
      { t: "×",             a: () => pressBinaryOp("×"),                 c: opr },
    ],
    [
      { t: "1/x",           a: () => pressUnary("1/x"),                  c: sci },
      { t: "4",             a: () => pressDigit("4"),                     c: num },
      { t: "5",             a: () => pressDigit("5"),                     c: num },
      { t: "6",             a: () => pressDigit("6"),                     c: num },
      { t: "−",             a: () => pressBinaryOp("−"),                 c: opr },
    ],
    [
      { t: "π",             a: () => pressConst("π"),                    c: sci },
      { t: "1",             a: () => pressDigit("1"),                     c: num },
      { t: "2",             a: () => pressDigit("2"),                     c: num },
      { t: "3",             a: () => pressDigit("3"),                     c: num },
      { t: "+",             a: () => pressBinaryOp("+"),                 c: opr },
    ],
    [
      { t: "+/-",           a: () => setDisplay(fmt(-parseFloat(display))), c: sci },
      { t: "e",             a: () => pressConst("e"),                    c: sci },
      { t: "0",             a: () => pressDigit("0"),                     c: num },
      { t: ".",             a: () => pressDigit("."),                     c: num },
      { t: "=",             a: pressEquals,                               c: eq  },
    ],
  ];

  const panelStyle: React.CSSProperties = isMobile
    ? { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50 }
    : { position: "fixed", left: pos.x, top: pos.y, width: 320, zIndex: 50 };

  return (
    <>
      {isMobile && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      )}

      <div
        style={panelStyle}
        className="bg-background rounded-t-2xl md:rounded-2xl border border-border shadow-2xl select-none overflow-hidden"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-2 border-b border-border ${!isMobile ? "cursor-grab active:cursor-grabbing" : ""}`}
          onMouseDown={onDragStart}
        >
          <span className="text-xs font-semibold text-muted-foreground">Kalkulyator</span>
          <button
            onClick={onClose}
            onMouseDown={e => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Display */}
        <div className="px-5 pt-4 pb-3 text-right">
          <p className="text-xs text-muted-foreground h-4 truncate">{history || " "}</p>
          <p className={`font-light tracking-tight truncate mt-1 ${display.length > 10 ? "text-2xl" : "text-4xl"}`}>
            {display}
          </p>
          {parenStack.length > 0 && (
            <p className="text-[10px] text-orange-500 mt-0.5">
              {"(".repeat(parenStack.length)} — {parenStack.length} ta qavs ochiq
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="px-2 pb-3 pt-1 grid grid-cols-5 gap-1">
          {rows.flat().map((btn, i) => (
            <button
              key={i}
              onClick={btn.a}
              onMouseDown={e => e.stopPropagation()}
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
