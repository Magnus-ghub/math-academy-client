export interface EstimatedGrade {
  label: string;
  color: string;
  bg: string;
  border: string;
}

// Milliy Sertifikatning RASMIY bahosi (A+/A/B+/B/C+/C) Rasch-uslubida
// kogortaga nisbatan hisoblanadi (backend'dagi getMilliySertifikatGrade,
// finalScore T-ball asosida) — buni oldindan yoki har bir ro'yxat elementi
// uchun hisoblash mumkin emas (kamida 100 talaba topshirishi kerak).
// Shu sabab bu yerda XOM BALL foizi asosida TAXMINIY daraja ko'rsatiladi —
// rasmiy Rasch balli bilan farqlanishi mumkin, shuning uchun har doim
// "taxminiy" deb belgilanadi va rasmiysi bilan aralashtirilmasligi kerak.
export function getMilliySertifikatEstimatedGrade(percentage: number): EstimatedGrade | null {
  if (percentage >= 90) return { label: "A+", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300" };
  if (percentage >= 80) return { label: "A", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300" };
  if (percentage >= 70) return { label: "B+", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-300" };
  if (percentage >= 60) return { label: "B", color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-300" };
  if (percentage >= 50) return { label: "C+", color: "text-green-700", bg: "bg-green-50", border: "border-green-300" };
  if (percentage >= 40) return { label: "C", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" };
  return null;
}
