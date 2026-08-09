import { getAttestatsiyaToifa } from "@/lib/attestatsiya";
import { getMilliySertifikatEstimatedGrade } from "@/lib/milliySertifikat";

export interface ResultScoreInput {
  testType?: string | null;
  score: number;
  satScore?: number | null;
  rawPoints?: number | null;
  totalPoints?: number | null;
  correctAnswers: number;
  totalQuestions: number;
}

export interface ResultScoreDisplay {
  /** Katta raqam — natija doirasi/chipi markazida ko'rsatiladi */
  value: string;
  /** Status matni — masalan "Oliy toifa", "742 / 800", "A'lo" */
  label: string;
  colorClass: string;
}

function genericScoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function genericScoreLabel(score: number) {
  if (score >= 80) return "A'lo";
  if (score >= 60) return "Yaxshi";
  return "Qoniqarli";
}

// DTM foizda baholanadi. Boshqa test turlari (SAT, ATTESTATSIYA,
// MILLIY_SERTIFIKAT) uchun o'ziga xos baholash mezoni va statusi bor —
// natija sahifasidagi kabi shu mezonlar hamma joyda ko'rsatilishi kerak.
export function getResultScoreDisplay(result: ResultScoreInput): ResultScoreDisplay {
  if (result.testType === "SAT") {
    return {
      value: result.satScore != null ? `${result.satScore}` : "-",
      label: result.satScore != null ? `${result.satScore} / 800` : "Ball yo'q",
      colorClass: genericScoreColor(result.score),
    };
  }

  if (result.testType === "ATTESTATSIYA") {
    const percentage = result.totalQuestions > 0 ? (result.correctAnswers / result.totalQuestions) * 100 : 0;
    const toifa = getAttestatsiyaToifa(percentage);
    return {
      value: `${result.correctAnswers * 2}`,
      label: toifa ? toifa.label : "Siz toifa imtihonidan oʻta olmadingiz",
      colorClass: toifa ? toifa.color : "text-muted-foreground",
    };
  }

  if (result.testType === "MILLIY_SERTIFIKAT") {
    if (result.rawPoints == null) {
      return { value: "-", label: "Ball yo'q", colorClass: "text-muted-foreground" };
    }
    const percentage = result.totalPoints ? (result.rawPoints / result.totalPoints) * 100 : 0;
    const grade = getMilliySertifikatEstimatedGrade(percentage);
    return {
      value: `${result.rawPoints}`,
      label: grade ? `${grade.label} daraja (taxminiy)` : "Sertifikat talabini bajarmadingiz.",
      colorClass: grade ? grade.color : "text-muted-foreground",
    };
  }

  return {
    value: `${Math.round(result.score)}%`,
    label: genericScoreLabel(result.score),
    colorClass: genericScoreColor(result.score),
  };
}
