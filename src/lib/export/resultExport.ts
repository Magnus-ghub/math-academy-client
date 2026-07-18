import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ResultRow {
  userName?: string | null;
  userLastName?: string | null;
  userPhone?: string | null;
  userEmail?: string | null;
  resultStatus: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  duration: number;
  finishedAt?: string | null;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  COMPLETED: "Yakunlangan",
  IN_PROGRESS: "Jarayonda",
  ABANDONED: "Tashlab ketilgan",
  TIME_UP: "Vaqt tugadi",
};

function sanitizeFileName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "").trim() || "test";
}

function toRows(results: ResultRow[]) {
  return results.map((r, i) => ({
    "№": i + 1,
    Ism: r.userName ?? "—",
    Familiya: r.userLastName ?? "—",
    Telefon: r.userPhone ?? "—",
    Email: r.userEmail ?? "—",
    Holat: statusLabels[r.resultStatus] ?? r.resultStatus,
    "Ball (%)": Number(r.score).toFixed(1),
    "To'g'ri javob": `${r.correctAnswers}/${r.totalQuestions}`,
    "Davomiylik (daqiqa)": r.duration,
    Sana: new Date(r.finishedAt ?? r.createdAt).toLocaleDateString("uz-UZ"),
  }));
}

export function exportResultsToExcel(results: ResultRow[], testTitle: string) {
  const rows = toRows(results);
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Natijalar");
  XLSX.writeFile(workbook, `${sanitizeFileName(testTitle)}-natijalar.xlsx`);
}

export function exportResultsToPdf(results: ResultRow[], testTitle: string) {
  const rows = toRows(results);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.text(testTitle, 14, 14);
  autoTable(doc, {
    startY: 20,
    head: [Object.keys(rows[0] ?? {})],
    body: rows.map((r) => Object.values(r)),
    styles: { fontSize: 8 },
  });
  doc.save(`${sanitizeFileName(testTitle)}-natijalar.pdf`);
}
