"use client";

import {
  ChangeEvent,
  forwardRef,
  KeyboardEvent,
  FocusEvent,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { MathText } from "@/components/MathText";

export interface SprInputHandle {
  insertAtCursor: (text: string) => void;
  backspaceAtCursor: () => void;
  moveCursor: (dir: -1 | 1) => void;
}

type TextNode = { kind: "text"; id: string; value: string };
type RowNode = { kind: "row"; id: string; children: Node[] };
type FractionNode = { kind: "fraction"; id: string; numerator: RowNode; denominator: RowNode };
type RootNode = { kind: "root"; id: string; nth: boolean; index: TextNode; body: RowNode };
type PowerNode = { kind: "power"; id: string; base: RowNode; exponent: RowNode };
type FunctionNode = { kind: "function"; id: string; name: string; inverse?: boolean; arg: RowNode };
type Node = TextNode | RowNode | FractionNode | RootNode | PowerNode | FunctionNode;

let idCounter = 0;
const makeId = (prefix = "n") => `${prefix}-${++idCounter}`;
const text = (value = "") => ({ kind: "text", id: makeId("t"), value } as TextNode);
const row = (children: Node[] = []) => ({ kind: "row", id: makeId("r"), children } as RowNode);
const emptyFraction = () => ({ kind: "fraction", id: makeId("f"), numerator: row([text("")]), denominator: row([text("")]) } as FractionNode);
const emptyRoot = (nth: boolean) => ({ kind: "root", id: makeId("root"), nth, index: text(""), body: row([text("")]) } as RootNode);
const emptyPower = () => ({ kind: "power", id: makeId("pow"), base: row([text("")]), exponent: row([text("")]) } as PowerNode);
const fn = (name: string, inverse = false) => ({ kind: "function", id: makeId("fn"), name, inverse, arg: row([text("")]) } as FunctionNode);

function cloneNode<T extends Node>(node: T): T {
  if (node.kind === "text") return { ...node } as T;
  if (node.kind === "row") return { ...node, children: node.children.map(cloneNode) } as T;
  if (node.kind === "fraction") return { ...node, numerator: cloneNode(node.numerator), denominator: cloneNode(node.denominator) } as T;
  if (node.kind === "root") return { ...node, index: cloneNode(node.index), body: cloneNode(node.body) } as T;
  if (node.kind === "power") return { ...node, base: cloneNode(node.base), exponent: cloneNode(node.exponent) } as T;
  return { ...node, arg: cloneNode(node.arg) } as T;
}

function serialize(node: Node): string {
  switch (node.kind) {
    case "text": return node.value;
    case "row": return node.children.map(serialize).join("");
    case "fraction": return `${serialize(node.numerator)}/${serialize(node.denominator)}`;
    case "root": return node.nth ? `ⁿ√${node.index.value}(${serialize(node.body)})` : `√(${serialize(node.body)})`;
    case "power": return `${serialize(node.base)}^${serialize(node.exponent)}`;
    case "function": return `${node.name}${node.inverse ? "⁻¹" : ""}(${serialize(node.arg)})`;
  }
}

function normalizeSerialized(s: string): string {
  return s.replace(/\s+/g, "");
}

function splitTopLevel(s: string, separator: string): [string, string] | null {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === separator && depth === 0) return [s.slice(0, i), s.slice(i + 1)];
  }
  return null;
}

function parseRow(raw: string): RowNode {
  const s = normalizeSerialized(raw);
  if (!s) return row([text("")]);

  const children: Node[] = [];
  let buf = "";
  const flush = () => { if (buf) { children.push(text(buf)); buf = ""; } };

  for (let i = 0; i < s.length;) {
    if (s.startsWith("sin⁻¹(", i) || s.startsWith("cos⁻¹(", i) || s.startsWith("tan⁻¹(", i)) {
      const name = s.slice(i, i + 3);
      const end = matchingParen(s, i + 5);
      if (end > i) { flush(); children.push(fn(name, true)); (children[children.length - 1] as FunctionNode).arg = parseRow(s.slice(i + 6, end)); i = end + 1; continue; }
    }
    const fnMatch = s.slice(i).match(/^(sin|cos|tan|log|ln)\(/);
    if (fnMatch) {
      const end = matchingParen(s, i + fnMatch[0].length - 1);
      if (end > i) { flush(); const n = fn(fnMatch[1]); n.arg = parseRow(s.slice(i + fnMatch[0].length, end)); children.push(n); i = end + 1; continue; }
    }
    if (s[i] === "√" || s.startsWith("ⁿ√", i)) {
      const nth = s.startsWith("ⁿ√", i);
      let start = i + (nth ? 2 : 1);
      let end = start;
      let indexValue = "2";
      if (nth) {
        const m = s.slice(start).match(/^(\d+)/);
        if (m) { indexValue = m[1]; start += m[1].length; }
        else indexValue = "";
      }
      if (s[end = start] === "(") end = matchingParen(s, end) + 1;
      else if (/[-+]?\d/.test(s[end] || "")) { while (end < s.length && /[\d.]/.test(s[end])) end++; }
      else end = Math.min(s.length, start + 1);
      flush();
      const r = emptyRoot(nth);
      r.index.value = indexValue;
      r.body = parseRow(s.slice(start, end).replace(/^\((.*)\)$/, "$1"));
      children.push(r); i = end; continue;
    }
    if (s[i] === "(") {
      const end = matchingParen(s, i);
      if (end > i) { flush(); children.push(row([text(s.slice(i + 1, end))])); i = end + 1; continue; }
    }
    // A top-level fraction is parsed as one structural node.
    const slash = findTopLevelSlash(s, i);
    if (slash === i) {
      // handled by the generic scanner below only when a slash is encountered.
    }
    buf += s[i]; i++;
  }

  const slash = splitTopLevel(s, "/");
  if (slash) {
    return row([Object.assign(emptyFraction(), { numerator: parseRow(slash[0]), denominator: parseRow(slash[1]) })]);
  }
  const power = splitTopLevel(s, "^");
  if (power && power[0] && power[1]) {
    return row([Object.assign(emptyPower(), { base: parseRow(power[0]), exponent: parseRow(power[1]) })]);
  }
  return children.length ? row(children) : row([text(s)]);
}

function matchingParen(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")" && --depth === 0) return i;
  }
  return -1;
}

function findTopLevelSlash(s: string, from: number): number {
  let depth = 0;
  for (let i = from; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (s[i] === "/" && depth === 0) return i;
  }
  return -1;
}

function firstText(node: Node): TextNode | null {
  if (node.kind === "text") return node;
  if (node.kind === "row") for (const c of node.children) { const t = firstText(c); if (t) return t; }
  if (node.kind === "fraction") return firstText(node.numerator);
  if (node.kind === "root") return node.index;
  if (node.kind === "power") return firstText(node.base);
  if (node.kind === "function") return firstText(node.arg);
  return null;
}

function findText(node: Node, id: string): TextNode | null {
  if (node.kind === "text") return node.id === id ? node : null;
  if (node.kind === "row") for (const c of node.children) { const r = findText(c, id); if (r) return r; }
  if (node.kind === "fraction") return findText(node.numerator, id) || findText(node.denominator, id);
  if (node.kind === "root") return node.index.id === id ? node.index : findText(node.body, id);
  if (node.kind === "power") return findText(node.base, id) || findText(node.exponent, id);
  if (node.kind === "function") return findText(node.arg, id);
  return null;
}


function replaceText(root: RowNode, id: string, value: string): RowNode {
  const next = cloneNode(root);
  const target = findText(next, id);
  if (target) target.value = value;
  return next;
}

type StructuralNode = FractionNode | RootNode | PowerNode | FunctionNode;

// The NEAREST structural (fraction/root/power/function) ancestor of a text
// slot — used so Backspace can unwrap an empty structure back into plain
// text instead of leaving a permanent, empty symbol the student can never
// remove. Recurses INTO each structural node's own slots first so a
// structure nested inside another (e.g. a root inside a fraction's
// numerator) resolves to the inner one, not the outer one.
function findContainingStructural(node: Node, slotId: string): StructuralNode | null {
  if (node.kind === "row") {
    for (const c of node.children) { const r = findContainingStructural(c, slotId); if (r) return r; }
    return null;
  }
  if (node.kind === "fraction") {
    return (
      findContainingStructural(node.numerator, slotId) ||
      findContainingStructural(node.denominator, slotId) ||
      ((findText(node.numerator, slotId) || findText(node.denominator, slotId)) ? node : null)
    );
  }
  if (node.kind === "root") {
    if (node.index.id === slotId) return node;
    return findContainingStructural(node.body, slotId) || (findText(node.body, slotId) ? node : null);
  }
  if (node.kind === "power") {
    return (
      findContainingStructural(node.base, slotId) ||
      findContainingStructural(node.exponent, slotId) ||
      ((findText(node.base, slotId) || findText(node.exponent, slotId)) ? node : null)
    );
  }
  if (node.kind === "function") {
    return findContainingStructural(node.arg, slotId) || (findText(node.arg, slotId) ? node : null);
  }
  return null;
}

// A structural node counts as "empty" (safe to unwrap on Backspace) only
// when ALL of its editable slots are empty — e.g. a fraction with content
// in the numerator still keeps its denominator editable rather than
// collapsing and losing that numerator.
function isStructuralEmpty(n: StructuralNode): boolean {
  if (n.kind === "fraction") return isRowEmpty(n.numerator) && isRowEmpty(n.denominator);
  if (n.kind === "root") return isRowEmpty(n.body) && (!n.nth || n.index.value === "");
  if (n.kind === "power") return isRowEmpty(n.base) && isRowEmpty(n.exponent);
  return isRowEmpty(n.arg);
}

// The RowNode that directly holds a given (structural) node in its
// children array — needed to splice that node out when unwrapping it.
function findParentRowOfNode(root: RowNode, nodeId: string): RowNode | null {
  if (root.children.some((c) => c.id === nodeId)) return root;
  for (const c of root.children) {
    if (c.kind === "row") { const r = findParentRowOfNode(c, nodeId); if (r) return r; }
    else if (c.kind === "fraction") { const r = findParentRowOfNode(c.numerator, nodeId) || findParentRowOfNode(c.denominator, nodeId); if (r) return r; }
    else if (c.kind === "root") { const r = findParentRowOfNode(c.body, nodeId); if (r) return r; }
    else if (c.kind === "power") { const r = findParentRowOfNode(c.base, nodeId) || findParentRowOfNode(c.exponent, nodeId); if (r) return r; }
    else if (c.kind === "function") { const r = findParentRowOfNode(c.arg, nodeId); if (r) return r; }
  }
  return null;
}

function isRowEmpty(r: RowNode): boolean {
  return r.children.every((c) => c.kind === "text" && c.value === "");
}

// The RowNode that directly holds a given TEXT slot in its children array —
// recurses into nested structures' own rows (numerator/denominator, root
// body, power base/exponent, function arg) so this also works for a slot
// nested inside another structure, not just a top-level one.
function findParentRow(root: RowNode, slotId: string): RowNode | null {
  if (root.children.some((c) => c.kind === "text" && c.id === slotId)) return root;
  for (const c of root.children) {
    if (c.kind === "row") { const r = findParentRow(c, slotId); if (r) return r; }
    else if (c.kind === "fraction") { const r = findParentRow(c.numerator, slotId) || findParentRow(c.denominator, slotId); if (r) return r; }
    else if (c.kind === "root") { const r = findParentRow(c.body, slotId); if (r) return r; }
    else if (c.kind === "power") { const r = findParentRow(c.base, slotId) || findParentRow(c.exponent, slotId); if (r) return r; }
    else if (c.kind === "function") { const r = findParentRow(c.arg, slotId); if (r) return r; }
  }
  return null;
}

function findAndTransformSlash(root: RowNode, slotId: string, pos: number): { root: RowNode; focusId: string; focusPos: number } | null {
  const next = cloneNode(root);
  const slot = findText(next, slotId);
  if (!slot) return null;

  const parent = findParentRow(next, slotId);
  if (!parent) return null;

  const index = parent.children.findIndex(c => c.kind === "text" && c.id === slotId);
  if (index < 0) return null;
  const left = slot.value.slice(0, pos);
  const right = slot.value.slice(pos);

  // Split at the caret: everything to the left becomes numerator, everything
  // to the right becomes denominator. Works even on an empty slot (nothing
  // typed yet) — "/" and "÷" always produce a fraction, not a literal
  // character, matching the "□/□" button's promise.
  const fraction = emptyFraction();
  fraction.numerator = row([text(left)]);
  fraction.denominator = row([text(right)]);
  // HAR DOIM kasrdan keyin bo'sh katakcha qoladi — aks holda kasr
  // tugagach davom etish (masalan "+" qo'yib ikkinchi kasr yozish) uchun
  // hech qanday joy qolmasdi.
  const trailing = text("");
  parent.children.splice(index, 1, fraction, trailing);
  // Agar suratga hali hech narsa yozilmagan bo'lsa — avval o'shanga, aks
  // holda (mavjud matn bo'lindi) maxrajga o'tkazadi.
  const focusRow = left ? fraction.denominator : fraction.numerator;
  return { root: next, focusId: firstText(focusRow)!.id, focusPos: 0 };
}

function insertStructural(root: RowNode, slotId: string, pos: number, kind: "fraction" | "root" | "nthroot" | "power" | "function", name?: string, inverse = false): { root: RowNode; focusId: string; focusPos: number } | null {
  const next = cloneNode(root);
  const slot = findText(next, slotId);
  if (!slot) return null;

  const parent = findParentRow(next, slotId);
  if (!parent) return null;
  const index = parent.children.findIndex(c => c.kind === "text" && c.id === slotId);
  if (index < 0) return null;

  const left = slot.value.slice(0, pos);
  const right = slot.value.slice(pos);
  const before = left ? text(left) : null;
  const after = right ? text(right) : null;
  let structural: Node;
  let focus: TextNode;

  // Strukturadan keyin (root/power/function'da OLDIN ham) HAR DOIM bo'sh
  // katakcha qoladi — bo'lmasa strukturani tugatgach davom etish yoki
  // strelka bilan undan chiqib ketish uchun hech qanday joy qolmasdi.
  if (kind === "fraction") {
    const f = emptyFraction();
    f.numerator = row([before || text("")]);
    f.denominator = row([after || text("")]);
    structural = f;
    focus = firstText(f.denominator)!;
    parent.children.splice(index, 1, structural, text(""));
  } else if (kind === "root" || kind === "nthroot") {
    const r = emptyRoot(kind === "nthroot");
    r.index.value = kind === "root" ? "2" : "";
    r.body = row([text("")]);
    structural = r;
    focus = kind === "nthroot" ? r.index : firstText(r.body)!;
    parent.children.splice(index, 1, before || text(""), structural, after || text(""));
  } else if (kind === "power") {
    const p = emptyPower();
    p.base = row([before || text("")]);
    p.exponent = row([text("")]);
    structural = p;
    focus = firstText(p.exponent)!;
    parent.children.splice(index, 1, structural, after || text(""));
  } else {
    const f = fn(name || "sin", inverse);
    f.arg = row([text("")]);
    structural = f;
    focus = firstText(f.arg)!;
    parent.children.splice(index, 1, before || text(""), structural, after || text(""));
  }

  return { root: next, focusId: focus.id, focusPos: 0 };
}

function sprToLatex(raw: string): string {
  if (!raw) return "";
  let s = raw;
  s = s.replace(/(sin|cos|tan)⁻¹/g, "\\$1^{-1}");
  s = s.replace(/(sin|cos|tan|log|ln)(?=\()/g, "\\$1");
  // Ildiz belgilari ("√", "ⁿ√") argumentini XOM qavslar bo'yicha topadi —
  // shuning uchun quyidagi umumiy "(" -> "\left(" almashtirishdan OLDIN
  // ishlashi shart, aks holda qavslar allaqachon \left/\right'ga
  // aylanib bo'lgan bo'lib, regex hech qachon mos kelmay qolardi (va
  // "√"/"ⁿ√" \sqrt{}ga aylanmasdan, xom belgi bo'lib qolardi).
  s = s.replace(/ⁿ√(\d+)\((.*?)\)/g, (_m, n, g) => `\\sqrt[${n}]{${g}}`);
  s = s.replace(/ⁿ√(\d+)(-?\d+(?:\.\d+)?)/g, (_m, n, g) => `\\sqrt[${n}]{${g}}`);
  s = s.replace(/√\((.*?)\)/g, (_m, g) => `\\sqrt{${g}}`);
  s = s.replace(/√(-?\d+(?:\.\d+)?)/g, (_m, g) => `\\sqrt{${g}}`);
  s = s.replace(/\(/g, "\\left(").replace(/\)/g, "\\right)");
  s = s.replace(/(\\right\)|\d|[a-zA-Z])²/g, "$1^{2}");
  s = s.replace(/(\d)°/g, "$1^{\\circ}");
  s = s.replace(/÷/g, "/");
  s = s.replace(/\*/g, "\\cdot ");
  const NUMBER_SRC = String.raw`(?:\d+(?:\.\d+)?π?|π)`;
  const ATOM_SRC = String.raw`(?:\\(?:sin|cos|tan|log|ln)(?:\^\{-1\})?\\left\([^()]*\\right\)|\\left\([^()]*\\right\)|\\sqrt(?:\[n\])?\{[^{}]*\}|${NUMBER_SRC})`;
  const FRACTION_RE = new RegExp(`(${ATOM_SRC})/(${ATOM_SRC})`, "g");
  return s.replace(FRACTION_RE, "\\frac{$1}{$2}");
}

function collectTextNodes(node: Node, out: TextNode[] = []): TextNode[] {
  if (node.kind === "text") { out.push(node); return out; }
  if (node.kind === "row") node.children.forEach(c => collectTextNodes(c, out));
  else if (node.kind === "fraction") { collectTextNodes(node.numerator, out); collectTextNodes(node.denominator, out); }
  else if (node.kind === "root") { collectTextNodes(node.index, out); collectTextNodes(node.body, out); }
  else if (node.kind === "power") { collectTextNodes(node.base, out); collectTextNodes(node.exponent, out); }
  else if (node.kind === "function") collectTextNodes(node.arg, out);
  return out;
}

export const SprInput = forwardRef<SprInputHandle, {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  onFocus?: (rect: DOMRect) => void;
  useVirtualKeyboard?: boolean;
  showPreview?: boolean;
}>(function SprInput({ value, onChange, maxLength, onFocus, useVirtualKeyboard = false, showPreview = true }, ref) {
  const [tree, setTree] = useState<RowNode>(() => parseRow(value));
  const [activeId, setActiveId] = useState<string>(() => firstText(parseRow(value))?.id || "");
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const cursorRef = useRef({ start: 0, end: 0 });
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const lastExternalValue = useRef(value);

  useEffect(() => {
    if (value !== lastExternalValue.current && value !== serialize(tree)) {
      const parsed = parseRow(value);
      setTree(parsed);
      const first = firstText(parsed);
      setActiveId(first?.id || "");
      cursorRef.current = { start: first?.value.length || 0, end: first?.value.length || 0 };
      lastExternalValue.current = value;
    }
  }, [value, tree]);

  const commit = useCallback((next: RowNode, focusId?: string, focusPos?: number) => {
    setTree(next);
    const serialized = serialize(next);
    if (maxLength == null || serialized.length <= maxLength) {
      lastExternalValue.current = serialized;
      onChange(serialized);
    }
    if (focusId) {
      setActiveId(focusId);
      const p = focusPos ?? 0;
      cursorRef.current = { start: p, end: p };
      requestAnimationFrame(() => {
        const el = inputRefs.current[focusId];
        if (el) { el.focus(); el.setSelectionRange(p, p); onFocus?.(el.getBoundingClientRect()); }
      });
    }
  }, [maxLength, onChange, onFocus]);

  const updateSlot = useCallback((id: string, nextValue: string, caret?: number) => {
    if (maxLength != null && nextValue.length > maxLength) return;
    const next = replaceText(tree, id, nextValue);
    setTree(next);
    lastExternalValue.current = serialize(next);
    onChange(lastExternalValue.current);
    if (caret != null) cursorRef.current = { start: caret, end: caret };
  }, [tree, maxLength, onChange]);

  const handleSlotChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!/^[^{}$\\]*$/.test(v)) return;

    const slot = findText(tree, id);
    const oldValue = slot?.value ?? "";
    const pos = e.target.selectionStart ?? v.length;

    // Fizik klaviaturada faqat "/" va "^" tugmalari haqiqatan mavjud (√,
    // ⁿ√ belgilari klaviaturada yo'q, faqat ekrandagi tugmalar orqali
    // keladi). Shu ikkitasi terilganda ham ekrandagi tugma bilan bir xil
    // TUZILMAVIY o'zgarish qo'llanadi — shu SLOTni alohida qayta ajratish
    // ('parseRow(v)') o'rniga, chunki bu slot boshqa tuzilma ichida (masalan
    // kasr maxrajida yoki ildiz ostida) joylashgan bo'lsa, uni o'rab turgan
    // tashqi tuzilmani butunlay yo'qotib qo'yardi.
    if (v.length === oldValue.length + 1 && pos > 0 && (v[pos - 1] === "/" || v[pos - 1] === "^")) {
      const trigger = v[pos - 1];
      const withoutTrigger = v.slice(0, pos - 1) + v.slice(pos);
      const treeWithoutTrigger = replaceText(tree, id, withoutTrigger);
      const result = trigger === "/"
        ? findAndTransformSlash(treeWithoutTrigger, id, pos - 1)
        : insertStructural(treeWithoutTrigger, id, pos - 1, "power");
      if (result) { commit(result.root, result.focusId, result.focusPos); return; }
    }
    updateSlot(id, v, pos);
  };

  const handleSlotFocus = (id: string, e: FocusEvent<HTMLInputElement>) => {
    setActiveId(id); activeIdRef.current = id;
    const p = e.target.selectionStart ?? e.target.value.length;
    cursorRef.current = { start: p, end: e.target.selectionEnd ?? p };
    onFocus?.(e.target.getBoundingClientRect());
  };

  const insertAtCursor = useCallback((rawText: string) => {
    const id = activeIdRef.current || firstText(tree)?.id;
    if (!id) return;
    const slot = findText(tree, id); if (!slot) return;
    const { start, end } = cursorRef.current;
    const special = rawText.trim();

    if (special === "/" || special === "÷") {
      const result = findAndTransformSlash(tree, id, start);
      if (result) { commit(result.root, result.focusId, result.focusPos); return; }
    }
    if (special === "√") {
      const result = insertStructural(tree, id, start, "root");
      if (result) { commit(result.root, result.focusId, result.focusPos); return; }
    }
    if (special === "ⁿ√" || special === "n√") {
      const result = insertStructural(tree, id, start, "nthroot");
      if (result) { commit(result.root, result.focusId, result.focusPos); return; }
    }
    if (special === "^") {
      const result = insertStructural(tree, id, start, "power");
      if (result) { commit(result.root, result.focusId, result.focusPos); return; }
    }
    const inverseMatch = special.match(/^(sin|cos|tan)⁻¹\(?$/);
    if (inverseMatch) {
      const result = insertStructural(tree, id, start, "function", inverseMatch[1], true);
      if (result) { commit(result.root, result.focusId, result.focusPos); return; }
    }
    const fnMatch = special.match(/^(sin|cos|tan|log|ln)\(?$/);
    if (fnMatch) {
      const result = insertStructural(tree, id, start, "function", fnMatch[1]);
      if (result) { commit(result.root, result.focusId, result.focusPos); return; }
    }
    if (special === "²") {
      const result = insertStructural(tree, id, start, "power");
      if (result) {
        const target = findText(result.root, result.focusId);
        if (target) target.value = "2";
        commit(result.root, result.focusId, 1); return;
      }
    }

    const nextValue = slot.value.slice(0, start) + rawText + slot.value.slice(end);
    updateSlot(id, nextValue, start + rawText.length);
    requestAnimationFrame(() => {
      const el = inputRefs.current[id];
      if (el) { el.focus(); el.setSelectionRange(start + rawText.length, start + rawText.length); }
    });
  }, [tree, commit, updateSlot]);

  const backspaceAtCursor = useCallback(() => {
    const id = activeIdRef.current; const slot = findText(tree, id); if (!slot) return;
    const { start, end } = cursorRef.current;
    if (start !== end) { updateSlot(id, slot.value.slice(0, start) + slot.value.slice(end), start); return; }
    if (start > 0) {
      updateSlot(id, slot.value.slice(0, start - 1) + slot.value.slice(start), start - 1);
      requestAnimationFrame(() => inputRefs.current[id]?.setSelectionRange(start - 1, start - 1));
      return;
    }
    // Bo'sh struktura (kasr/ildiz/daraja/funksiya — hech qaysi qismiga
    // hech narsa yozilmagan) ustida — o'zini olib tashlab, oddiy bo'sh
    // katakchaga qaytadi. Aks holda belgi hech qachon o'chmay, doim
    // ekranda osilib qolardi.
    if (slot.value === "") {
      const containing = findContainingStructural(tree, id);
      if (containing && isStructuralEmpty(containing)) {
        const next = cloneNode(tree);
        const parentRow = findParentRowOfNode(next, containing.id);
        if (parentRow) {
          const idx = parentRow.children.findIndex((c) => c.id === containing.id);
          const empty = text("");
          parentRow.children.splice(idx, 1, empty);
          commit(next, empty.id, 0);
          return;
        }
      }
    }

    // At the beginning of a slot, Backspace behaves like a paper editor:
    // move to the previous editable area (e.g. denominator -> numerator).
    const slots = collectTextNodes(tree);
    const index = slots.findIndex(s => s.id === id);
    if (index > 0) {
      const prev = slots[index - 1];
      activeIdRef.current = prev.id; setActiveId(prev.id);
      cursorRef.current = { start: prev.value.length, end: prev.value.length };
      requestAnimationFrame(() => { const el = inputRefs.current[prev.id]; if (el) { el.focus(); el.setSelectionRange(prev.value.length, prev.value.length); } });
    }
  }, [tree, updateSlot, commit]);

  const moveCursor = useCallback((dir: -1 | 1) => {
    const id = activeIdRef.current;
    const slots = collectTextNodes(tree);
    const index = slots.findIndex(s => s.id === id);
    if (index < 0) return;
    const slot = slots[index];
    const current = cursorRef.current.start;
    if (dir < 0 && current > 0) {
      const p = current - 1;
      cursorRef.current = { start: p, end: p };
      requestAnimationFrame(() => { const el = inputRefs.current[id]; if (el) { el.focus(); el.setSelectionRange(p, p); } });
      return;
    }
    if (dir > 0 && current < slot.value.length) {
      const p = current + 1;
      cursorRef.current = { start: p, end: p };
      requestAnimationFrame(() => { const el = inputRefs.current[id]; if (el) { el.focus(); el.setSelectionRange(p, p); } });
      return;
    }
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= slots.length) return;
    const target = slots[nextIndex];
    const p = dir > 0 ? 0 : target.value.length;
    activeIdRef.current = target.id;
    setActiveId(target.id);
    cursorRef.current = { start: p, end: p };
    requestAnimationFrame(() => { const el = inputRefs.current[target.id]; if (el) { el.focus(); el.setSelectionRange(p, p); onFocus?.(el.getBoundingClientRect()); } });
  }, [tree, onFocus]);

  useImperativeHandle(ref, () => ({ insertAtCursor, backspaceAtCursor, moveCursor }), [insertAtCursor, backspaceAtCursor, moveCursor]);

  const handleKeyDown = (id: string, e: KeyboardEvent<HTMLInputElement>) => {
    const p = e.currentTarget.selectionStart ?? 0;
    const end = e.currentTarget.selectionEnd ?? p;
    cursorRef.current = { start: p, end };
    if (e.key === "/") { e.preventDefault(); insertAtCursor("/"); }
    else if (e.key === "^") { e.preventDefault(); insertAtCursor("^"); }
    else if (e.key === "Backspace") {
      // Fizik klaviaturaning o'zi (native) faqat SHU katakcha ichidagi
      // matnni o'chiradi — bo'sh kasr/ildiz/daraja katakchasi chegarasida
      // (0-pozitsiyada) hech narsa qilmaydi, struktura hech qachon
      // o'chmay qoladi. Shuning uchun har doim o'zimizning
      // backspaceAtCursor orqali o'tkazamiz (ekrandagi tugma bilan bir
      // xil — ichkarida oddiy o'chirish, chegarada strukturani yechish).
      e.preventDefault();
      backspaceAtCursor();
    }
    else if (e.key === "ArrowLeft" && p === 0) { e.preventDefault(); moveCursor(-1); }
    else if (e.key === "ArrowRight" && p === e.currentTarget.value.length) { e.preventDefault(); moveCursor(1); }
    else if (e.key === "Escape") { e.currentTarget.blur(); }
  };

  const setRef = (id: string) => (el: HTMLInputElement | null) => { inputRefs.current[id] = el; };

  const renderRow = (r: RowNode, scale = 1): ReactNode => (
    <span key={r.id} className="inline-flex items-center align-middle">
      {r.children.map((n) => renderNode(n, scale))}
    </span>
  );

  const slotClass = "border-0 outline-none bg-transparent text-center font-mono font-medium p-0 m-0 min-w-[20px] placeholder:text-gray-400 placeholder:font-normal placeholder:text-[13px]";
  // Butun javob hali bo'sh (yagona, hech narsa yozilmagan katakcha) bo'lsa —
  // shunga "Javobni kiriting" ko'rsatkichi chiqadi. Ichma-ich katakchalarga
  // (surat/maxraj, daraja va h.k.) esa chiqmaydi.
  const soleEmptySlotId =
    tree.children.length === 1 && tree.children[0].kind === "text" && tree.children[0].value === ""
      ? tree.children[0].id
      : null;
  const renderText = (n: TextNode, scale: number) => (
    <input
      key={n.id}
      ref={setRef(n.id)}
      value={n.value}
      onChange={(e) => handleSlotChange(n.id, e)}
      onFocus={(e) => handleSlotFocus(n.id, e)}
      onClick={(e) => { cursorRef.current = { start: e.currentTarget.selectionStart ?? 0, end: e.currentTarget.selectionEnd ?? 0 }; setActiveId(n.id); }}
      onKeyUp={(e) => { cursorRef.current = { start: e.currentTarget.selectionStart ?? 0, end: e.currentTarget.selectionEnd ?? 0 }; }}
      onKeyDown={(e) => handleKeyDown(n.id, e)}
      inputMode={useVirtualKeyboard ? "none" : "decimal"}
      autoComplete="off"
      spellCheck={false}
      placeholder={n.id === soleEmptySlotId ? "Javobni kiriting" : undefined}
      aria-label="Mathematical expression input"
      className={slotClass}
      style={{
        width: n.id === soleEmptySlotId
          ? 150
          : Math.max(24, Math.min(180, 12 + Math.max(1, n.value.length) * 13)),
        height: Math.max(30, 34 * scale),
        fontSize: 18 * scale,
        color: "#111827",
        borderBottom: activeId === n.id ? "1px solid #2563eb" : "1px solid transparent",
      }}
    />
  );

  const renderNode = (n: Node, scale = 1): ReactNode => {
    if (n.kind === "text") return renderText(n, scale);
    if (n.kind === "row") return renderRow(n, scale);
    if (n.kind === "fraction") return (
      <span key={n.id} className="inline-flex flex-col items-stretch justify-center align-middle mx-1" style={{ lineHeight: 1 }}>
        <span className="flex justify-center px-1 py-0.5 min-h-7.5">{renderRow(n.numerator, scale * 0.9)}</span>
        <span className="h-0.5 bg-gray-800 w-full min-w-8.5" />
        <span className="flex justify-center px-1 py-0.5 min-h-7.5">{renderRow(n.denominator, scale * 0.9)}</span>
      </span>
    );
    if (n.kind === "root") return (
      <span key={n.id} className="inline-flex items-center align-middle mx-1">
        {n.nth ? <input ref={setRef(n.index.id)} value={n.index.value} onChange={(e) => handleSlotChange(n.index.id, e)} onFocus={(e) => handleSlotFocus(n.index.id, e)} onClick={() => setActiveId(n.index.id)} onKeyUp={(e) => { cursorRef.current = { start: e.currentTarget.selectionStart ?? 0, end: e.currentTarget.selectionEnd ?? 0 }; }} onKeyDown={(e) => handleKeyDown(n.index.id, e)} className={slotClass} style={{ width: 22, height: 22, fontSize: 12, alignSelf: "flex-start" }} /> : null}
        <span className="font-serif" style={{ fontSize: 26 * scale, lineHeight: 0.8 }}>√</span>
        <span className="border-t-2 border-gray-800 pt-1 min-w-7">{renderRow(n.body, scale * 0.95)}</span>
      </span>
    );
    if (n.kind === "power") return (
      <span key={n.id} className="inline-flex items-start align-middle">
        {renderRow(n.base, scale)}
        <span className="relative -top-2 ml-0.5">{renderRow(n.exponent, scale * 0.65)}</span>
      </span>
    );
    return (
      <span key={n.id} className="inline-flex items-center align-middle">
        <span className="font-serif italic text-[18px]">{n.name}<sup>{n.inverse ? "−1" : ""}</sup></span>
        <span className="text-[18px]">(</span>{renderRow(n.arg, scale)}<span className="text-[18px]">)</span>
      </span>
    );
  };

  const serialized = serialize(tree);
  const latex = useMemo(() => sprToLatex(serialized), [serialized]);
  const boxWidth = Math.min(520, Math.max(180, 40 + Math.max(1, serialized.length) * 13));

  const clear = () => {
    const r = row([text("")]); setTree(r); const t = firstText(r)!; setActiveId(t.id); cursorRef.current = { start: 0, end: 0 }; lastExternalValue.current = ""; onChange("");
    requestAnimationFrame(() => inputRefs.current[t.id]?.focus());
  };

  return (
    <div>
      <div className="flex flex-col items-start gap-3">
        <div className="relative rounded-xl border-2 border-gray-500 bg-white px-3 py-2 flex items-center justify-center" style={{ minWidth: boxWidth, minHeight: 82 }}>
          <div className="flex items-center justify-center overflow-x-auto max-w-130 py-2">{renderRow(tree)}</div>
        </div>
        {serialized.trim() && <button type="button" onClick={clear} className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2">Clear</button>}
      </div>

      {showPreview && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <p className="text-sm font-bold text-gray-700 mb-1">Answer Preview:</p>
          <div style={{ minHeight: 40, fontSize: 20 }}>{serialized ? <MathText text={`$${latex}$`} /> : null}</div>
        </div>
      )}

      {showPreview && (
        <p className="mt-3 text-xs text-gray-400">Formatlar: <span className="font-mono">3.5</span> · <span className="font-mono">7/2</span> · <span className="font-mono">-4</span></p>
      )}
    </div>
  );
});