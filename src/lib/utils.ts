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
