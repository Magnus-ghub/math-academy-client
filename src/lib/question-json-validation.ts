// Admin JSON/AI import orqali yuklanadigan savol shaklini tekshiradi.
// Uch xil admin modal (CreateTestModal, ImportTestModal, JsonReplaceQuestionsModal)
// avval buni alohida-alohida (triplicate) tekshirar edi — endi bitta joyda.
export function isValidQuestionShape(q: any, testType?: string): boolean {
  if (!q?.questionText || !Array.isArray(q.options)) return false;
  const qt = q.questionType || "SINGLE";

  if (qt === "MATCHING") {
    return q.options.length >= 2 && typeof q.correctAnswer === "number";
  }
  if (qt === "TWO_PART") {
    return (
      q.options.length === 0 &&
      typeof q.correctAnswer === "number" &&
      typeof q.correctAnswerB === "number"
    );
  }
  // SPR — hozircha faqat SAT va MILLIY_SERTIFIKAT uchun ruxsat etilgan
  if (q.options.length === 0) {
    return (testType === "SAT" || testType === "MILLIY_SERTIFIKAT") && typeof q.correctAnswer === "number";
  }
  return q.options.length === 4 && typeof q.correctAnswer === "number";
}
