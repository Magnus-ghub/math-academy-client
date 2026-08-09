export interface Toifa {
  label: string;
  color: string;
  bg: string;
  border: string;
  ustama?: string;
}

// Chegaralar to'g'ri javoblar foizi (0-100) bo'yicha — savollar soni 50 dan
// farq qilsa ham (kam yoki ko'p) to'g'ri ishlashi uchun. Backend'dagi
// getAttestationCategory bilan bir xil bo'lishi kerak.
export function getAttestatsiyaToifa(percentage: number): Toifa | null {
  if (percentage >= 86) return { label: "Oliy toifa", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300", ustama: "+ 70% ustama" };
  if (percentage >= 80) return { label: "Oliy toifa", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300" };
  if (percentage >= 70) return { label: "Birinchi toifa", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300" };
  if (percentage >= 60) return { label: "Ikkinchi toifa", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-300" };
  if (percentage >= 56) return { label: "Mutaxassis", color: "text-green-700", bg: "bg-green-50", border: "border-green-300" };
  return null;
}
