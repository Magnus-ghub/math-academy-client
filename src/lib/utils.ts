import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ComputeEngine } from "@cortex-js/compute-engine"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export function limitWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(" ")
}

// TWO_PART (Milliy Sertifikat) savolining questionText'i umumiy shart va "a)"/"b)"
// qismlarini bitta matnda "\n" bilan ajratib saqlaydi (AI promptidagi konventsiya).
// Har bir qism o'z javob maydoni ustida alohida ko'rsatilishi uchun shu matnni
// uchga ajratamiz. Format mos kelmasa (eski/formatlanmagan ma'lumot), stem'ga
// butun matnni qaytaramiz, partA/partB bo'sh qoladi — chaqiruvchi shu holda
// eski (butun matn + bare "a)"/"b)" belgi) ko'rinishga qaytishi kerak.
export function splitTwoPartText(text: string): { stem: string; partA: string; partB: string } {
  // Ba'zan AI natijasida haqiqiy qator ko'chirish o'rniga so'zma-so'z "\n"
  // (backslash+n, ikkita belgi) tushib qoladi (MathText'dagi
  // normalizeLiteralNewlines bilan bir xil muammo) — shuning uchun "a)"/"b)"
  // belgisidan oldingi shunday holatlarni ham haqiqiy qatorga aylantiramiz.
  // Faqat "a)"/"b)"dan oldingi holatga tegamiz — \nabla kabi haqiqiy LaTeX
  // buyruqlarga (keyingi harf ")" bilan davom etmagani uchun) tegilmaydi.
  const normalized = text.replace(/\\n(?=\s*[ab]\))/gi, "\n")
  const lines = normalized.split("\n")
  const aIndex = lines.findIndex((l) => /^\s*a\)/i.test(l))
  const bIndex = lines.findIndex((l) => /^\s*b\)/i.test(l))
  if (aIndex === -1 || bIndex === -1 || bIndex <= aIndex) {
    return { stem: text, partA: "", partB: "" }
  }
  return {
    stem: lines.slice(0, aIndex).join("\n"),
    partA: lines.slice(aIndex, bIndex).join("\n"),
    partB: lines.slice(bIndex).join("\n"),
  }
}

// MathLive kutubxonasi ichida allaqachon ishlatiladigan Compute Engine —
// LaTeX ifodasini (masalan "\frac{9-3\sqrt{5}}{2}") HAQIQIY son qiymatiga
// aylantira oladi. Oldingi versiya faqat regex bilan "\frac{butun}{butun}"
// yoki oddiy o'nlik sonni tushunar edi — kvadrat ildiz ishtirok etgan har
// qanday javobni (Milliy Sertifikatda juda keng tarqalgan) yo NOTO'G'RI
// deb belgilar edi ("\frac{9-3\sqrt{5}}{2}" -1 qaytarardi), yo battari,
// javobni jimgina buzib tashlardi ("18\sqrt{3}" parseFloat orqali shunchaki
// "18" deb o'qilib, √3 ko'paytiruvchisi butunlay yo'qolib ketardi).
let computeEngine: ComputeEngine | null = null

function getEngine(): ComputeEngine {
  if (!computeEngine) {
    computeEngine = new ComputeEngine()
    // Standart holda ComputeEngine "15^\circ" kabi darajali burchak
    // belgisini RADIANGA aylantirib hisoblaydi (15° -> 0.2618) — lekin
    // butun tizim (admin javob kaliti, "correctAnswer" konventsiyasi)
    // burchakni har doim ODDIY GRADUS soni sifatida (masalan 15° -> 15,
    // hech qanday aylantirishsiz) kutadi. Shu moslikni saqlash uchun
    // "deg" rejimiga o'tkazamiz — shunda "15^\circ" to'g'ridan-to'g'ri
    // 15 deb hisoblanadi.
    computeEngine.angularUnit = "deg"
  }
  return computeEngine
}

// SAT SPR javoblarini backend bilan bir xil encoding'da son ko'rinishga o'giradi (masalan "7/2" -> 350)
// Milliy Sertifikat (MathLive) LaTeX ("\frac{9-3\sqrt{5}}{2}" kabi ildizli ifodalar) qaytarganda ham ishlaydi.
export function parseSprAnswer(raw: string): number {
  const s = raw.trim()
  if (!s) return -1
  const computeEngine = getEngine()
  try {
    // Qochirilmagan "%" LaTeX'da izoh (comment) belgisi — Compute Engine
    // buni "foiz" deb emas, oddiy chegara deb o'qib, "25%" ni "25" (0.25
    // emas!) deb hisoblab qo'yadi. JSON import/eski yozuvlarda "%" qochirilmay
    // kelishi mumkin — shuning uchun bu yerda ham "\%"ga aylantiramiz.
    // \dfrac/\tfrac — \frac'ning ko'rinish variantlari; backend'dagi eski
    // Compute Engine ularni tanimaydi, ikki tomon bir xil ishlashi uchun bu
    // yerda ham \frac'ga aylantiramiz.
    const n = computeEngine
      .parse(s.replace(/\\[dt]frac(?![a-zA-Z])/g, "\\frac").replace(/(?<!\\)%/g, "\\%"))
      .N()
    if (!n.isReal || n.re === undefined || !Number.isFinite(n.re)) return -1
    return Math.round(n.re * 100)
  } catch {
    return -1
  }
}
