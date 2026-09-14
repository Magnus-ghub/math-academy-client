"use client";

import { useState } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";

interface Props { onClose: () => void; }

// ── Reference Sheet SVG shapes (real SAT style) ─────────────────────

function RefCircle() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      <circle cx="45" cy="40" r="28" fill="none" stroke="#222" strokeWidth="1.5"/>
      <circle cx="45" cy="40" r="2.5" fill="#222"/>
      <line x1="45" y1="40" x2="73" y2="40" stroke="#222" strokeWidth="1"/>
      <text x="57" y="35" fontSize="11" fill="#222" fontStyle="italic">r</text>
    </svg>
  );
}

function RefRectangle() {
  return (
    <svg viewBox="0 0 90 70" className="w-full h-full">
      <rect x="8" y="12" width="64" height="38" fill="none" stroke="#222" strokeWidth="1.5"/>
      <text x="40" y="9" fontSize="11" fill="#222" textAnchor="middle" fontStyle="italic">ℓ</text>
      <text x="78" y="34" fontSize="11" fill="#222" fontStyle="italic">w</text>
    </svg>
  );
}

function RefTriangle() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      <polygon points="8,70 82,70 35,12" fill="none" stroke="#222" strokeWidth="1.5"/>
      <line x1="35" y1="12" x2="35" y2="70" stroke="#222" strokeWidth="1" strokeDasharray="4,3"/>
      <rect x="35" y="62" width="8" height="8" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="45" y="79" fontSize="11" fill="#222" fontStyle="italic">b</text>
      <text x="22" y="44" fontSize="11" fill="#222" fontStyle="italic">h</text>
    </svg>
  );
}

function RefPythagorean() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      <polygon points="10,68 80,68 10,14" fill="none" stroke="#222" strokeWidth="1.5"/>
      <rect x="10" y="60" width="8" height="8" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="44" y="79" fontSize="11" fill="#222" textAnchor="middle" fontStyle="italic">a</text>
      <text x="4"  y="44" fontSize="11" fill="#222" fontStyle="italic">b</text>
      <text x="48" y="38" fontSize="11" fill="#222" fontStyle="italic">c</text>
    </svg>
  );
}

function RefSpecialTriangles() {
  return (
    <svg viewBox="0 0 160 90" className="w-full h-full">
      {/* 30-60-90 */}
      <polygon points="8,78 72,78 8,18" fill="none" stroke="#222" strokeWidth="1.5"/>
      <rect x="8" y="70" width="8" height="8" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="14" y="30" fontSize="9" fill="#222">60°</text>
      <text x="20" y="76" fontSize="9" fill="#222">30°</text>
      <text x="36" y="86" fontSize="9" fill="#222" fontStyle="italic">x</text><text x="46" y="86" fontSize="9" fill="#222">√3</text>
      <text x="0"  y="52" fontSize="9" fill="#222" fontStyle="italic">x</text>
      <text x="38" y="44" fontSize="9" fill="#222">2</text><text x="44" y="44" fontSize="9" fill="#222" fontStyle="italic">x</text>
      {/* 45-45-90 */}
      <polygon points="88,78 152,78 152,18" fill="none" stroke="#222" strokeWidth="1.5"/>
      <rect x="144" y="70" width="8" height="8" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="90"  y="72" fontSize="9" fill="#222">45°</text>
      <text x="136" y="30" fontSize="9" fill="#222">45°</text>
      <text x="114" y="86" fontSize="9" fill="#222" fontStyle="italic">s</text>
      <text x="155" y="52" fontSize="9" fill="#222" fontStyle="italic">s</text>
      <text x="108" y="44" fontSize="9" fill="#222" fontStyle="italic">s</text><text x="116" y="44" fontSize="9" fill="#222">√2</text>
    </svg>
  );
}

function RefBox() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      {/* Front face */}
      <rect x="18" y="30" width="46" height="36" fill="none" stroke="#222" strokeWidth="1.5"/>
      {/* Top face */}
      <polygon points="18,30 36,14 82,14 64,30" fill="none" stroke="#222" strokeWidth="1.5"/>
      {/* Right face */}
      <polygon points="64,30 82,14 82,50 64,66" fill="none" stroke="#222" strokeWidth="1.5"/>
      <text x="38" y="78" fontSize="10" fill="#222" fontStyle="italic">ℓ</text>
      <text x="72" y="36" fontSize="10" fill="#222" fontStyle="italic">w</text>
      <text x="6"  y="50" fontSize="10" fill="#222" fontStyle="italic">h</text>
    </svg>
  );
}

function RefCylinder() {
  return (
    <svg viewBox="0 0 90 86" className="w-full h-full">
      <ellipse cx="45" cy="20" rx="28" ry="10" fill="none" stroke="#222" strokeWidth="1.5"/>
      <ellipse cx="45" cy="66" rx="28" ry="10" fill="none" stroke="#222" strokeWidth="1.5"/>
      <line x1="17" y1="20" x2="17" y2="66" stroke="#222" strokeWidth="1.5"/>
      <line x1="73" y1="20" x2="73" y2="66" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="20" x2="73" y2="20" stroke="#222" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="57" y="17" fontSize="10" fill="#222" fontStyle="italic">r</text>
      <text x="76" y="46" fontSize="10" fill="#222" fontStyle="italic">h</text>
    </svg>
  );
}

function RefSphere() {
  return (
    <svg viewBox="0 0 90 80" className="w-full h-full">
      <circle cx="45" cy="40" r="30" fill="none" stroke="#222" strokeWidth="1.5"/>
      <ellipse cx="45" cy="40" rx="30" ry="10" fill="none" stroke="#222" strokeWidth="1" strokeDasharray="4,3"/>
      <circle cx="45" cy="40" r="2.5" fill="#222"/>
      <line x1="45" y1="40" x2="45" y2="10" stroke="#222" strokeWidth="1"/>
      <text x="48" y="27" fontSize="11" fill="#222" fontStyle="italic">r</text>
    </svg>
  );
}

function RefCone() {
  return (
    <svg viewBox="0 0 90 84" className="w-full h-full">
      <ellipse cx="45" cy="68" rx="28" ry="10" fill="none" stroke="#222" strokeWidth="1.5"/>
      <line x1="17" y1="68" x2="45" y2="14" stroke="#222" strokeWidth="1.5"/>
      <line x1="73" y1="68" x2="45" y2="14" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="14" x2="45" y2="68" stroke="#222" strokeWidth="1" strokeDasharray="3,2"/>
      <rect x="45" y="62" width="7" height="7" fill="none" stroke="#222" strokeWidth="1"/>
      <text x="48" y="44" fontSize="10" fill="#222" fontStyle="italic">h</text>
      <text x="55" y="76" fontSize="10" fill="#222" fontStyle="italic">r</text>
    </svg>
  );
}

function RefPyramid() {
  return (
    <svg viewBox="0 0 90 84" className="w-full h-full">
      {/* Base */}
      <polygon points="20,70 70,70 82,54 32,54" fill="none" stroke="#222" strokeWidth="1.5"/>
      {/* Apex to corners */}
      <line x1="45" y1="14" x2="20" y2="70" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="14" x2="70" y2="70" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="14" x2="82" y2="54" stroke="#222" strokeWidth="1.5"/>
      <line x1="45" y1="14" x2="32" y2="54" stroke="#222" strokeWidth="1" strokeDasharray="3,2"/>
      {/* Height */}
      <line x1="45" y1="14" x2="45" y2="62" stroke="#222" strokeWidth="1" strokeDasharray="3,2"/>
      <text x="44" y="78" fontSize="10" fill="#222" fontStyle="italic">ℓ</text>
      <text x="73" y="65" fontSize="10" fill="#222" fontStyle="italic">w</text>
      <text x="48" y="40" fontSize="10" fill="#222" fontStyle="italic">h</text>
    </svg>
  );
}

export function ReferenceSheet({ onClose }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      /* ── Mini floating panel (default) ── */
      <div className="fixed right-4 top-16 z-50 w-80 max-h-[calc(100vh-80px)] flex flex-col rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a2e] text-white shrink-0">
          <span className="text-sm font-semibold">Reference</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(true)}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
              title="Expand"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable compact content */}
        <div className="overflow-y-auto flex-1 px-3 py-3 space-y-3">
          {/* Row 1 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center">
              <div className="w-14 h-11"><RefCircle /></div>
              <p className="text-[10px] text-center leading-tight mt-0.5"><i>A</i>=π<i>r</i>² <i>C</i>=2π<i>r</i></p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-11"><RefRectangle /></div>
              <p className="text-[10px] text-center leading-tight mt-0.5"><i>A</i>=<i>ℓw</i></p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-11"><RefTriangle /></div>
              <p className="text-[10px] text-center leading-tight mt-0.5"><i>A</i>=½<i>bh</i></p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-11"><RefPythagorean /></div>
              <p className="text-[10px] text-center leading-tight mt-0.5"><i>c</i>²=<i>a</i>²+<i>b</i>²</p>
            </div>
          </div>

          {/* Special triangles — full width */}
          <div className="flex flex-col items-center border border-gray-100 rounded-lg p-2">
            <div className="w-full h-14"><RefSpecialTriangles /></div>
            <p className="text-[10px] font-semibold text-gray-600 mt-0.5">Special Right Triangles</p>
          </div>

          {/* 3D shapes */}
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center">
              <div className="w-14 h-11"><RefBox /></div>
              <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=<i>ℓwh</i></p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-11"><RefCylinder /></div>
              <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=π<i>r</i>²<i>h</i></p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-11"><RefSphere /></div>
              <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=4/3π<i>r</i>³</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-11"><RefCone /></div>
              <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=⅓π<i>r</i>²<i>h</i></p>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-14 h-11"><RefPyramid /></div>
              <p className="text-[10px] text-center leading-tight mt-0.5"><i>V</i>=⅓<i>ℓwh</i></p>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-gray-100 pt-2 space-y-1">
            <p className="text-[10px] text-gray-500">• Arc degrees in a circle = 360</p>
            <p className="text-[10px] text-gray-500">• Arc radians in a circle = 2π</p>
            <p className="text-[10px] text-gray-500">• Triangle angle sum = 180°</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    /* ── Full-screen expanded view ── */
    <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-3 bg-[#1a1a2e] text-white shrink-0">
        <h2 className="font-semibold text-base">Reference</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(false)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            title="Shrink"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 py-8">
        <div className="grid grid-cols-7 gap-6 mb-8">
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-16"><RefCircle /></div>
            <p className="text-xs text-center leading-snug mt-1"><i>A</i> = π<i>r</i>²<br /><i>C</i> = 2π<i>r</i></p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-16"><RefRectangle /></div>
            <p className="text-xs text-center leading-snug mt-1"><i>A</i> = <i>ℓw</i></p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-16"><RefTriangle /></div>
            <p className="text-xs text-center leading-snug mt-1"><i>A</i> = ½<i>bh</i></p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-16"><RefPythagorean /></div>
            <p className="text-xs text-center leading-snug mt-1"><i>c</i>² = <i>a</i>² + <i>b</i>²</p>
          </div>
          <div className="col-span-2 flex flex-col items-center gap-1">
            <div className="w-full h-16"><RefSpecialTriangles /></div>
            <p className="text-xs text-center font-semibold mt-1">Special Right Triangles</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-16"><RefBox /></div>
            <p className="text-xs text-center leading-snug mt-1"><i>V</i> = <i>ℓwh</i></p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-6 mb-8">
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-16"><RefCylinder /></div>
            <p className="text-xs text-center leading-snug mt-1"><i>V</i> = π<i>r</i>²<i>h</i></p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-16"><RefSphere /></div>
            <p className="text-xs text-center leading-snug mt-1"><i>V</i> = 4/3 π<i>r</i>³</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-16"><RefCone /></div>
            <p className="text-xs text-center leading-snug mt-1"><i>V</i> = ⅓ π<i>r</i>²<i>h</i></p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-16"><RefPyramid /></div>
            <p className="text-xs text-center leading-snug mt-1"><i>V</i> = ⅓ <i>ℓwh</i></p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 space-y-2">
          <p className="text-sm text-gray-700">The number of degrees of arc in a circle is 360.</p>
          <p className="text-sm text-gray-700">The number of radians of arc in a circle is 2π.</p>
          <p className="text-sm text-gray-700">The sum of the measures in degrees of the angles of a triangle is 180.</p>
        </div>
      </div>
    </div>
  );
}
