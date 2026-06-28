"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  X, Plus, Minus, Home, Wrench, ChevronDown,
  Undo2, Redo2, Settings2, Keyboard,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Expr { id: string; text: string; color: string; }
interface VP   { cx: number; cy: number; scale: number; }
interface Props { onClose: () => void; }

const COLORS = ["#2d70b3","#388c46","#c74440","#fa7e19","#6042a6","#000000"];
const DEFAULT_VP: VP = { cx: 0, cy: 0, scale: 60 };

// ─────────────────────────────────────────────────────────────
// Graph expression evaluator  y = f(x)
// ─────────────────────────────────────────────────────────────

function evalY(raw: string, x: number): number {
  try {
    let e = raw.trim()
      .replace(/^\s*y\s*=\s*/i, "")
      .replace(/^\s*f\s*\(\s*x\s*\)\s*=\s*/i, "");
    if (!e) return NaN;

    e = e.replace(/\^/g, "**");
    e = e.replace(/(\d)\s*x\b/gi, "$1*x");
    e = e.replace(/(\d)\s*\(/g, "$1*(");
    e = e.replace(/\)\s*\(/g, ")*(");

    const fns: [RegExp, string][] = [
      [/\bln\b/g,    "Math.log"],
      [/\blog\b/g,   "Math.log10"],
      [/\bsin\b/g,   "Math.sin"],
      [/\bcos\b/g,   "Math.cos"],
      [/\btan\b/g,   "Math.tan"],
      [/\basin\b/g,  "Math.asin"],
      [/\bacos\b/g,  "Math.acos"],
      [/\batan\b/g,  "Math.atan"],
      [/\bsqrt\b/g,  "Math.sqrt"],
      [/\babs\b/g,   "Math.abs"],
      [/\bceil\b/g,  "Math.ceil"],
      [/\bfloor\b/g, "Math.floor"],
      [/\bexp\b/g,   "Math.exp"],
    ];
    for (const [f, t] of fns) e = e.replace(f, t);
    e = e.replace(/\bpi\b/gi, "Math.PI").replace(/π/g, "Math.PI");
    e = e.replace(/(?<![A-Za-z.])e(?![A-Za-z_])/g, "Math.E");
    e = e.replace(/\bx\b/gi, `(${x})`);

    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict";return(${e})`)();
    return typeof v === "number" ? v : NaN;
  } catch {
    return NaN;
  }
}

// ─────────────────────────────────────────────────────────────
// Scientific expression evaluator  (no x variable)
// ─────────────────────────────────────────────────────────────

function evalSci(raw: string, deg: boolean, ans: number): number {
  try {
    let e = raw.trim();
    if (!e) return NaN;

    e = e.replace(/\bans\b/gi, `(${isFinite(ans) ? ans : 0})`);
    e = e.replace(/÷/g, "/").replace(/×/g, "*").replace(/−/g, "-");
    e = e.replace(/(\d+\.?\d*)\s*%/g, "($1/100)");
    e = e.replace(/\^/g, "**");
    e = e.replace(/(\d)\s*\(/g, "$1*(");
    e = e.replace(/\)\s*\(/g, ")*(");

    e = e.replace(/\bpi\b/gi, "PI_").replace(/π/g, "PI_");
    e = e.replace(/(?<![A-Za-z_])e(?![A-Za-z_])/g, "E_");

    const fmap: [RegExp, string][] = [
      [/\basin\b/g,  "asin_"], [/\bacos\b/g,  "acos_"], [/\batan\b/g,  "atan_"],
      [/\bsin\b/g,   "sin_"],  [/\bcos\b/g,   "cos_"],  [/\btan\b/g,   "tan_"],
      [/\bln\b/g,    "ln_"],   [/\blog\b/g,   "log_"],  [/\bsqrt\b/g,  "sqrt_"],
      [/\babs\b/g,   "abs_"],  [/\bceil\b/g,  "ceil_"], [/\bfloor\b/g, "floor_"],
      [/\bexp\b/g,   "exp_"],
    ];
    for (const [f, t] of fmap) e = e.replace(f, t);

    const toR = (x: number) => x * Math.PI / 180;
    const frR = (x: number) => x * 180 / Math.PI;
    const sinF  = deg ? (x: number) => Math.sin(toR(x))  : Math.sin;
    const cosF  = deg ? (x: number) => Math.cos(toR(x))  : Math.cos;
    const tanF  = deg ? (x: number) => Math.tan(toR(x))  : Math.tan;
    const asinF = deg ? (x: number) => frR(Math.asin(x)) : Math.asin;
    const acosF = deg ? (x: number) => frR(Math.acos(x)) : Math.acos;
    const atanF = deg ? (x: number) => frR(Math.atan(x)) : Math.atan;

    // eslint-disable-next-line no-new-func
    const fn = new Function(
      "sin_","cos_","tan_","asin_","acos_","atan_",
      "ln_","log_","sqrt_","abs_","ceil_","floor_","exp_",
      "PI_","E_",
      `"use strict";return(${e})`
    );
    const v = fn(
      sinF, cosF, tanF, asinF, acosF, atanF,
      Math.log, Math.log10, Math.sqrt, Math.abs, Math.ceil, Math.floor, Math.exp,
      Math.PI, Math.E
    );
    return typeof v === "number" ? v : NaN;
  } catch {
    return NaN;
  }
}

// ─────────────────────────────────────────────────────────────
// Canvas drawing
// ─────────────────────────────────────────────────────────────

function niceFmt(n: number): string {
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e5 || (Math.abs(n) < 0.001 && n !== 0)) return n.toExponential(1);
  return parseFloat(n.toPrecision(4)).toString();
}

function drawGraph(canvas: HTMLCanvasElement, exprs: Expr[], vp: VP) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  const { cx, cy, scale } = vp;

  const wx2px = (wx: number) => W / 2 + (wx - cx) * scale;
  const wy2px = (wy: number) => H / 2 - (wy - cy) * scale;
  const px2wx = (px: number) => cx + (px - W / 2) / scale;
  const px2wy = (py: number) => cy - (py - H / 2) / scale;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);

  const raw = 50 / scale;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = ([1, 2, 5].find(n => n * mag >= raw) ?? 10) * mag;

  const xMin = px2wx(0), xMax = px2wx(W);
  const yMin = px2wy(H), yMax = px2wy(0);

  ctx.strokeStyle = "#e8e8e8"; ctx.lineWidth = 1;
  for (let wx = Math.floor(xMin / step) * step; wx <= xMax + step; wx += step) {
    const px = wx2px(wx);
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
  }
  for (let wy = Math.floor(yMin / step) * step; wy <= yMax + step; wy += step) {
    const py = wy2px(wy);
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
  }

  const y0 = wy2px(0), x0 = wx2px(0);
  ctx.strokeStyle = "#aaa"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, H); ctx.stroke();

  ctx.fillStyle = "#888";
  ctx.font = "11px ui-monospace, monospace";
  const ly = Math.min(Math.max(y0 + 3, 2), H - 14);
  const lx = Math.min(Math.max(x0 - 4, 2), W - 32);

  ctx.textAlign = "center"; ctx.textBaseline = "top";
  for (let wx = Math.ceil(xMin / step) * step; wx <= xMax; wx += step) {
    if (Math.abs(wx) < step * 0.01) continue;
    ctx.fillText(niceFmt(wx), wx2px(wx), ly);
  }
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  for (let wy = Math.ceil(yMin / step) * step; wy <= yMax; wy += step) {
    if (Math.abs(wy) < step * 0.01) continue;
    ctx.fillText(niceFmt(wy), lx, wy2px(wy));
  }

  for (const expr of exprs) {
    if (!expr.text.trim()) continue;
    ctx.strokeStyle = expr.color; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.beginPath();
    let pen = false; let prev = NaN;
    const range = yMax - yMin;
    for (let px = 0; px <= W; px += 1.5) {
      const wy = evalY(expr.text, px2wx(px));
      const py = wy2px(wy);
      const ok = isFinite(wy) && py > -H * 2 && py < H * 3;
      const jump = Math.abs(wy - prev) > range * 4;
      if (ok && !jump) { pen ? ctx.lineTo(px, py) : ctx.moveTo(px, py); pen = true; }
      else { if (pen) { ctx.stroke(); ctx.beginPath(); pen = false; } }
      prev = wy;
    }
    if (pen) ctx.stroke();
  }
}

// ─────────────────────────────────────────────────────────────
// Small zoom button
// ─────────────────────────────────────────────────────────────

function ZBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Graphing Panel
// ─────────────────────────────────────────────────────────────

function GraphingPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exprs, setExprs] = useState<Expr[]>([{ id: "1", text: "", color: COLORS[0] }]);
  const [vp, setVp] = useState<VP>(DEFAULT_VP);
  const vpRef = useRef(vp);
  const panRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [activeId, setActiveId] = useState("1");
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { vpRef.current = vp; }, [vp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawGraph(canvas, exprs, vpRef.current);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawGraph(canvas, exprs, vp);
  }, [exprs, vp]);

  const onMouseDown = (e: React.MouseEvent) => {
    panRef.current = { x: e.clientX, y: e.clientY, cx: vp.cx, cy: vp.cy };
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!panRef.current) return;
    const { x, y, cx, cy } = panRef.current;
    setVp(v => ({ ...v, cx: cx - (e.clientX - x) / v.scale, cy: cy + (e.clientY - y) / v.scale }));
  }, []);
  const onMouseUp = useCallback(() => { panRef.current = null; }, []);
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    setVp(v => ({ ...v, scale: Math.max(4, Math.min(2000, v.scale * f)) }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [onMouseMove, onMouseUp, onWheel]);

  const zoom = (dir: 1 | -1) =>
    setVp(v => ({ ...v, scale: Math.max(4, Math.min(2000, v.scale * (dir > 0 ? 1.4 : 1 / 1.4))) }));

  const addExpr = () => {
    if (exprs.length >= COLORS.length) return;
    const id = String(Date.now());
    setExprs(p => [...p, { id, text: "", color: COLORS[p.length % COLORS.length] }]);
    setActiveId(id);
  };
  const removeExpr = (id: string) => setExprs(p => p.length > 1 ? p.filter(e => e.id !== id) : p);
  const updateExpr = (id: string, text: string) => setExprs(p => p.map(e => e.id === id ? { ...e, text } : e));

  // Insert text at cursor in the active expression input
  const insIntoExpr = (text: string, cursorBack = 0) => {
    const el = inputRefs.current[activeId];
    const expr = exprs.find(e => e.id === activeId);
    if (!expr) return;
    const start = el?.selectionStart ?? expr.text.length;
    const end   = el?.selectionEnd   ?? expr.text.length;
    const next  = expr.text.slice(0, start) + text + expr.text.slice(end);
    updateExpr(activeId, next);
    const cur = start + text.length - cursorBack;
    setTimeout(() => { el?.focus(); el?.setSelectionRange(cur, cur); }, 0);
  };

  const backInExpr = () => {
    const el = inputRefs.current[activeId];
    const expr = exprs.find(e => e.id === activeId);
    if (!expr) return;
    const start = el?.selectionStart ?? expr.text.length;
    const end   = el?.selectionEnd   ?? expr.text.length;
    if (start !== end) { updateExpr(activeId, expr.text.slice(0, start) + expr.text.slice(end)); }
    else if (start > 0) {
      updateExpr(activeId, expr.text.slice(0, start - 1) + expr.text.slice(start));
      setTimeout(() => { el?.focus(); el?.setSelectionRange(start - 1, start - 1); }, 0);
    }
  };

  // Graphing keypad button layout
  type K = { l: string; a: () => void; s: string };
  const Fn  = "bg-[#e8eaed] hover:bg-[#d5d8dd] text-gray-700 text-xs font-medium";
  const Num = "bg-white hover:bg-gray-50 text-gray-800 font-medium border border-gray-200";
  const Op  = "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const Del = "bg-[#e8eaed] hover:bg-red-50 text-red-500 text-xs font-medium";
  const Var = "bg-[#2d70b3]/10 hover:bg-[#2d70b3]/20 text-[#2d70b3] font-bold border border-[#2d70b3]/20";

  const kbdRows: K[][] = [
    [
      { l: "x",   a: () => insIntoExpr("x"),          s: Var },
      { l: "π",   a: () => insIntoExpr("π"),           s: Fn  },
      { l: "e",   a: () => insIntoExpr("e"),            s: Fn  },
      { l: "7",   a: () => insIntoExpr("7"),            s: Num },
      { l: "8",   a: () => insIntoExpr("8"),            s: Num },
      { l: "9",   a: () => insIntoExpr("9"),            s: Num },
      { l: "÷",   a: () => insIntoExpr("/"),            s: Op  },
      { l: "^",   a: () => insIntoExpr("^"),            s: Op  },
    ],
    [
      { l: "sin", a: () => insIntoExpr("sin()", 1),    s: Fn  },
      { l: "cos", a: () => insIntoExpr("cos()", 1),    s: Fn  },
      { l: "tan", a: () => insIntoExpr("tan()", 1),    s: Fn  },
      { l: "4",   a: () => insIntoExpr("4"),            s: Num },
      { l: "5",   a: () => insIntoExpr("5"),            s: Num },
      { l: "6",   a: () => insIntoExpr("6"),            s: Num },
      { l: "×",   a: () => insIntoExpr("*"),            s: Op  },
      { l: "√",   a: () => insIntoExpr("sqrt()", 1),   s: Fn  },
    ],
    [
      { l: "log", a: () => insIntoExpr("log()", 1),    s: Fn  },
      { l: "ln",  a: () => insIntoExpr("ln()", 1),     s: Fn  },
      { l: "abs", a: () => insIntoExpr("abs()", 1),    s: Fn  },
      { l: "1",   a: () => insIntoExpr("1"),            s: Num },
      { l: "2",   a: () => insIntoExpr("2"),            s: Num },
      { l: "3",   a: () => insIntoExpr("3"),            s: Num },
      { l: "−",   a: () => insIntoExpr("-"),            s: Op  },
      { l: "⌫",   a: backInExpr,                        s: Del },
    ],
    [
      { l: "(",   a: () => insIntoExpr("("),            s: Op  },
      { l: ")",   a: () => insIntoExpr(")"),            s: Op  },
      { l: ".",   a: () => insIntoExpr("."),            s: Num },
      { l: "0",   a: () => insIntoExpr("0"),            s: Num },
      { l: "a²",  a: () => insIntoExpr("^2"),           s: Fn  },
      { l: "aᵇ",  a: () => insIntoExpr("^(", 1),       s: Fn  },
      { l: "+",   a: () => insIntoExpr("+"),            s: Op  },
      { l: "=",   a: () => insIntoExpr("="),            s: Op  },
    ],
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Canvas */}
      <div className="relative flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={onMouseDown}
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <ZBtn onClick={() => {}} title="Settings"><Wrench size={13} /></ZBtn>
          <ZBtn onClick={() => zoom(1)} title="Zoom in"><Plus size={13} /></ZBtn>
          <ZBtn onClick={() => zoom(-1)} title="Zoom out"><Minus size={13} /></ZBtn>
          <ZBtn onClick={() => setVp(DEFAULT_VP)} title="Reset"><Home size={13} /></ZBtn>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-t border-b border-gray-200 bg-gray-50 shrink-0">
        <button onClick={addExpr} disabled={exprs.length >= COLORS.length}
          className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 transition-colors" title="Add expression">
          <Plus size={14} className="text-gray-600" />
        </button>
        <button
          onClick={() => { setShowKeypad(v => !v); setCollapsed(false); }}
          className={`p-1.5 rounded transition-colors ${showKeypad ? "bg-gray-300 text-gray-800" : "hover:bg-gray-200 text-gray-600"}`}
          title="Toggle keyboard"
        >
          <Keyboard size={14} />
        </button>
        <button className="p-1.5 rounded opacity-30 cursor-not-allowed">
          <Undo2 size={13} className="text-gray-600" />
        </button>
        <button className="p-1.5 rounded opacity-30 cursor-not-allowed">
          <Redo2 size={13} className="text-gray-600" />
        </button>
        <div className="flex-1" />
        <button className="p-1.5 rounded hover:bg-gray-200 transition-colors">
          <Settings2 size={13} className="text-gray-600" />
        </button>
        <button onClick={() => setCollapsed(v => !v)} className="p-1.5 rounded hover:bg-gray-200 transition-colors">
          <ChevronDown size={13} className={`text-gray-600 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Expression list */}
      {!collapsed && (
        <div className="overflow-y-auto shrink-0" style={{ maxHeight: showKeypad ? 96 : 168 }}>
          {exprs.map((expr, i) => (
            <div
              key={expr.id}
              className={`flex items-center border-b group transition-colors ${activeId === expr.id ? "bg-blue-50/50" : ""} border-gray-100`}
            >
              <span className="text-xs text-gray-400 w-8 text-center py-3 shrink-0 select-none">{i + 1}</span>
              <div className={`w-px h-10 shrink-0 ${activeId === expr.id ? "bg-[#2d70b3]" : "bg-gray-100"}`} />
              <input
                ref={el => { inputRefs.current[expr.id] = el; }}
                type="text"
                value={expr.text}
                onChange={e => updateExpr(expr.id, e.target.value)}
                onFocus={() => setActiveId(expr.id)}
                placeholder="Type an expression"
                className="flex-1 min-w-0 px-3 py-3 text-sm font-mono outline-none bg-transparent placeholder-gray-300"
                style={{ color: expr.color }}
              />
              <button onClick={() => removeExpr(expr.id)}
                className="px-2 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Graphing keypad */}
      {showKeypad && !collapsed && (
        <div className="shrink-0 p-1.5 bg-gray-50 border-t border-gray-200">
          {kbdRows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-8 gap-1 mb-1">
              {row.map((btn, bi) => (
                <button
                  key={bi}
                  onMouseDown={e => { e.preventDefault(); btn.a(); }}
                  className={`py-2.5 rounded text-sm transition-colors ${btn.s}`}
                >
                  {btn.l}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Resize indicator */}
      <div className="flex justify-end px-1.5 pb-0.5 shrink-0">
        <span className="text-gray-300 text-xs select-none" style={{ lineHeight: 1 }}>⇲</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Scientific Panel
// ─────────────────────────────────────────────────────────────

function ScientificPanel() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [ans, setAns] = useState(0);
  const [deg, setDeg] = useState(false);
  const [tab, setTab] = useState<"main" | "func">("main");
  const inputRef = useRef<HTMLInputElement>(null);

  const fmtResult = (n: number): string => {
    if (isNaN(n)) return "undefined";
    if (!isFinite(n)) return n > 0 ? "∞" : "-∞";
    return parseFloat(n.toPrecision(10)).toString();
  };

  const ins = (text: string, cursorBack = 0) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? expr.length;
    const end   = el?.selectionEnd   ?? expr.length;
    const next  = expr.slice(0, start) + text + expr.slice(end);
    setExpr(next);
    setResult(null);
    const cur = start + text.length - cursorBack;
    setTimeout(() => { el?.focus(); el?.setSelectionRange(cur, cur); }, 0);
  };

  const back = () => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? expr.length;
    const end   = el?.selectionEnd   ?? expr.length;
    if (start !== end) { setExpr(expr.slice(0, start) + expr.slice(end)); }
    else if (start > 0) {
      setExpr(expr.slice(0, start - 1) + expr.slice(start));
      setTimeout(() => { el?.focus(); el?.setSelectionRange(start - 1, start - 1); }, 0);
    }
    setResult(null);
  };

  const moveCursor = (dir: -1 | 1) => {
    const el = inputRef.current;
    if (!el) return;
    const p = Math.max(0, Math.min(expr.length, (el.selectionStart ?? expr.length) + dir));
    el.focus(); el.setSelectionRange(p, p);
  };

  const evaluate = () => {
    if (!expr.trim()) return;
    const r = evalSci(expr, deg, ans);
    const s = fmtResult(r);
    setResult(s);
    if (isFinite(r)) setAns(r);
  };

  const clearAll = () => { setExpr(""); setResult(null); };

  // Button styles
  const Fn    = "bg-[#e8eaed] hover:bg-[#d5d8dd] text-gray-700 text-xs font-medium";
  const Num   = "bg-white hover:bg-gray-50 text-gray-800 font-medium border border-gray-200";
  const Op    = "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200";
  const Del   = "bg-[#e8eaed] hover:bg-red-50 text-red-500 text-xs font-medium";
  const Enter = "bg-[#2d70b3] hover:bg-[#245fa0] text-white font-semibold";

  type K = { l: string; a: () => void; s: string };

  const mainRows: K[][] = [
    [
      { l: "a²",  a: () => ins("^2"),         s: Fn  },
      { l: "aᵇ",  a: () => ins("^"),          s: Fn  },
      { l: "|a|", a: () => ins("abs()", 1),   s: Fn  },
      { l: "7",   a: () => ins("7"),           s: Num },
      { l: "8",   a: () => ins("8"),           s: Num },
      { l: "9",   a: () => ins("9"),           s: Num },
      { l: "÷",   a: () => ins("÷"),           s: Op  },
      { l: "%",   a: () => ins("%"),           s: Op  },
      { l: "a/b", a: () => ins("/"),           s: Fn  },
    ],
    [
      { l: "√",   a: () => ins("sqrt()", 1),  s: Fn  },
      { l: "ⁿ√",  a: () => ins("^(1/)", 1),  s: Fn  },
      { l: "π",   a: () => ins("π"),           s: Fn  },
      { l: "4",   a: () => ins("4"),           s: Num },
      { l: "5",   a: () => ins("5"),           s: Num },
      { l: "6",   a: () => ins("6"),           s: Num },
      { l: "×",   a: () => ins("×"),           s: Op  },
      { l: "←",   a: () => moveCursor(-1),     s: Op  },
      { l: "→",   a: () => moveCursor(1),      s: Op  },
    ],
    [
      { l: "sin", a: () => ins("sin()", 1),   s: Fn  },
      { l: "cos", a: () => ins("cos()", 1),   s: Fn  },
      { l: "tan", a: () => ins("tan()", 1),   s: Fn  },
      { l: "1",   a: () => ins("1"),           s: Num },
      { l: "2",   a: () => ins("2"),           s: Num },
      { l: "3",   a: () => ins("3"),           s: Num },
      { l: "−",   a: () => ins("−"),           s: Op  },
      { l: "⌫",   a: back,                     s: Del },
    ],
    [
      { l: "(",   a: () => ins("("),           s: Op  },
      { l: ")",   a: () => ins(")"),           s: Op  },
      { l: ",",   a: () => ins(","),           s: Op  },
      { l: "0",   a: () => ins("0"),           s: Num },
      { l: ".",   a: () => ins("."),           s: Num },
      { l: "ans", a: () => ins("ans"),         s: Fn  },
      { l: "+",   a: () => ins("+"),           s: Op  },
      { l: "↵",   a: evaluate,                 s: Enter },
    ],
  ];

  const funcRows: K[][] = [
    [
      { l: "sin",   a: () => ins("sin()", 1),   s: Fn  },
      { l: "cos",   a: () => ins("cos()", 1),   s: Fn  },
      { l: "tan",   a: () => ins("tan()", 1),   s: Fn  },
      { l: "asin",  a: () => ins("asin()", 1),  s: Fn  },
      { l: "acos",  a: () => ins("acos()", 1),  s: Fn  },
      { l: "atan",  a: () => ins("atan()", 1),  s: Fn  },
      { l: "↵",     a: evaluate,                 s: Enter },
    ],
    [
      { l: "log",   a: () => ins("log()", 1),   s: Fn  },
      { l: "ln",    a: () => ins("ln()", 1),    s: Fn  },
      { l: "exp",   a: () => ins("exp()", 1),   s: Fn  },
      { l: "sqrt",  a: () => ins("sqrt()", 1),  s: Fn  },
      { l: "abs",   a: () => ins("abs()", 1),   s: Fn  },
      { l: "floor", a: () => ins("floor()", 1), s: Fn  },
      { l: "⌫",     a: back,                     s: Del },
    ],
    [
      { l: "π",     a: () => ins("π"),           s: Fn  },
      { l: "e",     a: () => ins("e"),            s: Fn  },
      { l: "^",     a: () => ins("^"),            s: Op  },
      { l: "(",     a: () => ins("("),            s: Op  },
      { l: ")",     a: () => ins(")"),            s: Op  },
      { l: "ans",   a: () => ins("ans"),          s: Fn  },
      { l: "clear", a: clearAll,                  s: Del },
    ],
  ];

  const rows = tab === "main" ? mainRows : funcRows;
  const cols = tab === "main" ? [9, 9, 8, 8] : [7, 7, 7];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Display */}
      <div className="flex-1 min-h-30 px-4 pt-3 pb-3 flex flex-col justify-end overflow-hidden">
        <input
          ref={inputRef}
          type="text"
          value={expr}
          onChange={e => { setExpr(e.target.value); setResult(null); }}
          onKeyDown={e => { if (e.key === "Enter") evaluate(); }}
          className="w-full text-right text-lg text-gray-800 font-mono outline-none bg-transparent placeholder-gray-300"
          placeholder="0"
          autoComplete="off"
          spellCheck={false}
        />
        {result !== null && (
          <p
            className="text-right text-2xl font-mono font-medium mt-1"
            style={{ color: result === "undefined" ? "#e53e3e" : "#2d70b3" }}
          >
            {result}
          </p>
        )}
      </div>

      {/* Tab / mode bar */}
      <div className="flex items-center px-2 py-1 bg-gray-50 border-t border-b border-gray-200 gap-0.5 shrink-0">
        {(["main","func"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors border-b-2 ${
              tab === t ? "text-[#2d70b3] border-[#2d70b3]" : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-300 mx-1" />
        {([["RAD", false], ["DEG", true]] as const).map(([label, val]) => (
          <button
            key={label}
            onClick={() => setDeg(val)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              deg === val
                ? "bg-[#2d70b3]/10 text-[#2d70b3] border border-[#2d70b3]/40"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={() => moveCursor(-1)} className="px-1.5 py-1 text-gray-500 hover:text-gray-700 font-mono text-sm">←</button>
        <button onClick={() => moveCursor(1)}  className="px-1.5 py-1 text-gray-500 hover:text-gray-700 font-mono text-sm">→</button>
        <button onClick={clearAll} className="px-2 py-1 text-xs text-gray-500 hover:text-red-500 transition-colors ml-1">
          clear all
        </button>
        <button className="p-1 text-gray-400 ml-1">
          <Wrench size={11} />
        </button>
      </div>

      {/* Keypad */}
      <div className="p-1.5 bg-gray-50 shrink-0">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="grid gap-1 mb-1"
            style={{ gridTemplateColumns: `repeat(${cols[ri]}, 1fr)` }}
          >
            {row.map((btn, bi) => (
              <button
                key={bi}
                onClick={btn.a}
                className={`py-2.75 rounded text-sm transition-colors ${btn.s}`}
              >
                {btn.l}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main — Bluebook-style header + panels
// ─────────────────────────────────────────────────────────────

type Mode = "graphing" | "scientific";

export function DesmosCalculator({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>("graphing");
  const [pos, setPos] = useState({ x: 80, y: 56 });
  const dragging = useRef(false);
  const offset   = useRef({ x: 0, y: 0 });

  const onDragStart = (e: React.MouseEvent) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    setPos({ x: Math.max(0, e.clientX - offset.current.x), y: Math.max(0, e.clientY - offset.current.y) });
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  const H = mode === "graphing" ? 600 : 540;

  return (
    <div
      className="fixed z-50 flex flex-col rounded-xl shadow-2xl overflow-hidden border border-gray-800/50"
      style={{ left: pos.x, top: pos.y, width: 380, height: H }}
    >
      {/* Dark header — matches Bluebook */}
      <div className="flex items-center shrink-0 h-10 bg-[#1a1a2e] px-3 select-none">
        {/* Mode tabs */}
        <div className="flex items-end gap-4">
          {(["graphing", "scientific"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-sm pb-0.75 capitalize transition-colors leading-none ${
                mode === m
                  ? "text-white border-b border-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Drag handle (center) */}
        <div
          className="flex-1 flex justify-center items-center h-full cursor-grab active:cursor-grabbing"
          onMouseDown={onDragStart}
        >
          <span className="text-gray-500 tracking-[0.35em] text-sm select-none">···</span>
        </div>

        {/* Close */}
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-0.5 rounded">
          <X size={15} />
        </button>
      </div>

      {/* Panel */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {mode === "graphing" ? <GraphingPanel /> : <ScientificPanel />}
      </div>
    </div>
  );
}
