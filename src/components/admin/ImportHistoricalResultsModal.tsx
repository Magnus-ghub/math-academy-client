"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { X, Upload, Loader2, AlertCircle, FileSpreadsheet, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  GET_IMPORTED_RESULTS_COUNT,
  IMPORT_HISTORICAL_RESULTS,
  CLEAR_IMPORTED_RESULTS,
} from "@/lib/graphql/result";

interface Props {
  testId: string;
  currentQuestionCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedFile {
  fileName: string;
  headers: string[];
  rows: Record<string, unknown>[];
}

const RAW_SCORE_HEADER_RE = /xom\s*bali/i;
const ITEM_COLUMN_RE = /^v\d+$/i;

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

export function ImportHistoricalResultsModal({ testId, currentQuestionCount, onClose, onSuccess }: Props) {
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [rawScoreColumn, setRawScoreColumn] = useState<string>("");
  const [totalPoints, setTotalPoints] = useState<number>(currentQuestionCount || 0);
  const [parseError, setParseError] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);

  const { data: countData, loading: countLoading, refetch: refetchCount } = useQuery<{
    getImportedResultsCount: number;
  }>(GET_IMPORTED_RESULTS_COUNT, { variables: { testId } });

  const [importResults, { loading: importing }] = useMutation<{
    importHistoricalResults: { importedCount: number };
  }>(IMPORT_HISTORICAL_RESULTS);
  const [clearResults, { loading: clearing }] = useMutation<{ clearImportedResults: number }>(
    CLEAR_IMPORTED_RESULTS,
  );

  const validScores = useMemo(() => {
    if (!parsed || !rawScoreColumn) return [];
    return parsed.rows
      .map((row) => toNumberOrNull(row[rawScoreColumn]))
      .filter((n): n is number => n !== null && Number.isInteger(n) && n >= 0 && n <= totalPoints);
  }, [parsed, rawScoreColumn, totalPoints]);

  const handleFile = async (file: File) => {
    setParseError("");
    setParsed(null);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
      if (rows.length === 0) {
        setParseError("Faylda qator topilmadi.");
        return;
      }
      const headers = Object.keys(rows[0]);
      setParsed({ fileName: file.name, headers, rows });

      const guessedRawCol = headers.find((h) => RAW_SCORE_HEADER_RE.test(h));
      setRawScoreColumn(guessedRawCol ?? headers[0]);

      const itemColumnCount = headers.filter((h) => ITEM_COLUMN_RE.test(h)).length;
      if (itemColumnCount > 0) setTotalPoints(itemColumnCount);
    } catch {
      setParseError("Fayl o'qib bo'lmadi. .xlsx formatida ekanligini tekshiring.");
    }
  };

  const handleImport = async () => {
    if (validScores.length === 0) return;
    try {
      const { data } = await importResults({
        variables: { input: { testId, totalPoints, rawScores: validScores } },
      });
      const count = data?.importHistoricalResults?.importedCount ?? 0;
      toast.success(`${count} ta tarixiy natija qo'shildi`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Import qilishda xatolik");
    }
  };

  const handleClear = async () => {
    try {
      const { data } = await clearResults({ variables: { testId } });
      toast.success(`${data?.clearImportedResults ?? 0} ta tarixiy natija o'chirildi`);
      setConfirmingClear(false);
      refetchCount();
    } catch (e: any) {
      toast.error(e.message || "Tozalashda xatolik");
    }
  };

  const importedCount = countData?.getImportedResultsCount ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-lg">Eski natijalarni import qilish</h2>
            <p className="text-xs text-muted-foreground">
              Rasch kogortasini eski Excel ma&apos;lumotlari bilan boyitish
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl text-sm">
            <span className="text-muted-foreground">
              Hozir import qilingan: {countLoading ? "..." : <strong className="text-foreground">{importedCount}</strong>}
            </span>
            {importedCount > 0 && (
              confirmingClear ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    disabled={clearing}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-40"
                  >
                    {clearing ? "O'chirilmoqda..." : "Ha, tozalash"}
                  </button>
                  <button onClick={() => setConfirmingClear(false)} className="text-xs text-muted-foreground hover:underline">
                    Bekor qilish
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingClear(true)}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Tozalash
                </button>
              )
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">.xlsx fayl</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="w-full text-sm border border-border rounded-xl px-3 py-2.5 bg-background file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-medium"
            />
          </div>

          {parseError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}

          {parsed && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                {parsed.fileName} — {parsed.rows.length} qator o&apos;qildi
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Xom ball ustuni</label>
                <select
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                  value={rawScoreColumn}
                  onChange={(e) => setRawScoreColumn(e.target.value)}
                >
                  {parsed.headers.map((h) => (
                    <option key={h} value={h}>
                      {h || "(bo'sh sarlavha)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Jami ball (savollar soni)</label>
                <input
                  type="number"
                  min={1}
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(Number(e.target.value))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Testdagi hozirgi savollar soni: {currentQuestionCount}. Eski test bilan mos kelishi kerak.
                </p>
              </div>

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm">
                <strong className="text-primary">{validScores.length}</strong> ta qator yaroqli
                (0–{totalPoints} oralig&apos;ida butun son).
                {validScores.length < parsed.rows.length && (
                  <span className="text-muted-foreground">
                    {" "}
                    {parsed.rows.length - validScores.length} ta qator o&apos;tkazib yuborildi.
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={validScores.length === 0 || importing}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {importing ? "Import qilinmoqda..." : `${validScores.length} ta natijani import qilish`}
          </button>
        </div>
      </div>
    </div>
  );
}
