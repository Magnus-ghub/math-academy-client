import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

// SAT SPR javoblarini backend bilan bir xil encoding'da son ko'rinishga o'giradi (masalan "7/2" -> 350)
export function parseSprAnswer(raw: string): number {
  const s = raw.trim()
  if (!s) return -1
  const fraction = s.match(/^(-?\d+)\/(\d+)$/)
  if (fraction) {
    const den = parseInt(fraction[2], 10)
    if (den === 0) return -1
    return Math.round((parseInt(fraction[1], 10) / den) * 100)
  }
  const n = parseFloat(s)
  return isNaN(n) ? -1 : Math.round(n * 100)
}
