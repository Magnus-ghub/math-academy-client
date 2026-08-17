"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  Plus,
  Search,
  Clock,
  FileQuestion,
  Eye,
  Pencil,
  Trash2,
  BarChart3,
  LayoutGrid,
  CheckCircle2,
  FileText,
  Archive,
  Info,
  ChevronDown,
  Check,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GET_ALL_TESTS, UPDATE_TEST, DELETE_TEST } from "@/lib/graphql/test";
import { GET_TEST_SALES_STATS } from "@/lib/graphql/payment";
import CreateTestModal from "@/components/admin/CreateTestModal";
import { testTypeStyles } from "@/lib/testTypeStyles";

const dtmTypeLabels: Record<string, string> = {
  MAJBURIY: "DTM Majburiy",
  ASOSIY: "DTM Asosiy",
  FULL: "Full DTM",
};

const testTypeLabel = (test: any): string => {
  if (test.testType === "DTM" && test.dtmType) return dtmTypeLabels[test.dtmType] ?? "DTM";
  const labels: Record<string, string> = {
    MILLIY_SERTIFIKAT: "Milliy",
    ATTESTATSIYA: "Attestatsiya",
    SAT: "SAT",
    DTM: "DTM",
  };
  return labels[test.testType] ?? test.testType;
};

const accessColors: Record<string, string> = {
  PUBLIC: "bg-green-100 text-green-700",
  PREMIUM: "bg-blue-100 text-blue-700",
  GROUP: "bg-orange-100 text-orange-700",
};

const accessLabels: Record<string, string> = {
  PUBLIC: "Ommaviy",
  PREMIUM: "Premium",
  GROUP: "Guruh",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Qoralama",
  PUBLISHED: "Nashr",
  ARCHIVED: "Arxiv",
};

const statusDotColors: Record<string, string> = {
  DRAFT: "bg-gray-400",
  PUBLISHED: "bg-green-500",
  ARCHIVED: "bg-red-500",
};

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const PAGE_SIZE = 10;

const statusTabs = [
  { key: "ALL", label: "Barchasi", icon: LayoutGrid },
  { key: "PUBLISHED", label: "Nashr etilgan", icon: CheckCircle2 },
  { key: "DRAFT", label: "Qoralama", icon: FileText },
  { key: "ARCHIVED", label: "Arxiv", icon: Archive },
] as const;

const statusTabHints: Record<string, string> = {
  DRAFT: "Qoralamalar talaba panelida ko'rinmaydi. Nashr qilinguncha uni faqat tahrirlash sahifasidagi \"Ko'rish\" tugmasi orqali sinab ko'rishingiz mumkin.",
  ARCHIVED: "Arxivlangan testlar talaba panelidan yashiriladi, ammo avval topshirilgan natijalar saqlanib qoladi. Kerak bo'lsa qayta nashr qilib qaytarish mumkin.",
};

export default function AdminTestsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dtmFilter, setDtmFilter] = useState("");
  const [statusTab, setStatusTab] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("PUBLISHED");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [statusMenuFor, setStatusMenuFor] = useState<string | null>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!statusMenuFor) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target as Node)) {
        setStatusMenuFor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [statusMenuFor]);

  const { data, loading, refetch } = useQuery<{ getAllTests: any[] }>(GET_ALL_TESTS, {
    variables: { includeArchived: true },
  });
  const tests = data?.getAllTests || [];

  const { data: salesData } = useQuery<{
    getTestSalesStats: { testId: string; count: number; revenue: number }[];
  }>(GET_TEST_SALES_STATS);
  const salesByTestId = new Map(
    (salesData?.getTestSalesStats ?? []).map((s) => [s.testId, s])
  );

  const [updateTest] = useMutation(UPDATE_TEST, {
    onCompleted: () => {
      toast.success("Test holati yangilandi");
      refetch();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const [deleteTest, { loading: deleting }] = useMutation(DELETE_TEST, {
    onCompleted: () => {
      toast.success("Test o'chirildi");
      setDeleteTarget(null);
      refetch();
    },
    onError: () => toast.error("O'chirishda xatolik yuz berdi"),
  });

  const bySearchAndType = tests.filter((t: any) => {
    const matchSearch = t.testTitle.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || t.testType === typeFilter;
    const matchDtm = typeFilter !== "DTM" || !dtmFilter || t.dtmType === dtmFilter;
    return matchSearch && matchType && matchDtm;
  });

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: bySearchAndType.length, PUBLISHED: 0, DRAFT: 0, ARCHIVED: 0 };
    for (const t of bySearchAndType) counts[t.testStatus] = (counts[t.testStatus] ?? 0) + 1;
    return counts;
  }, [bySearchAndType]);

  const filtered = statusTab === "ALL" ? bySearchAndType : bySearchAndType.filter((t: any) => t.testStatus === statusTab);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = (test: any, status: string) => {
    updateTest({
      variables: {
        testId: test.id,
        input: { testStatus: status },
      },
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Testlar</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} ta test</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tests/trash"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Savatcha
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Yangi test
          </button>
        </div>
      </div>

      {showModal && (
        <CreateTestModal onClose={() => setShowModal(false)} onSuccess={() => refetch()} />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-2xl border border-border p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Testni o'chirish</h3>
                <p className="text-xs text-muted-foreground">Test ro'yxatdan yashiriladi, ma'lumotlari saqlanib qoladi</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              <span className="font-medium text-foreground">"{deleteTarget.title}"</span> ro'yxatlardan yashirilsinmi? Talabalarning avval topshirgan natijalari buzilmaydi.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">
                Bekor qilish
              </button>
              <button onClick={() => deleteTest({ variables: { testId: deleteTarget.id } })} disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleting ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto">
        {statusTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setStatusTab(key); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              statusTab === key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs ${
              statusTab === key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              {statusCounts[key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {statusTabHints[statusTab] && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{statusTabHints[statusTab]}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Test nomi bo'yicha..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "ALL", label: "Hammasi" },
            { key: "MILLIY_SERTIFIKAT", label: "Milliy" },
            { key: "ATTESTATSIYA", label: "Attestatsiya" },
            { key: "SAT", label: "SAT" },
            { key: "DTM", label: "DTM" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => { setTypeFilter(key); setDtmFilter(""); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === key ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* DTM sub-filter */}
      {typeFilter === "DTM" && (
        <div className="flex gap-2 flex-wrap mb-4 pl-1">
          {[
            { key: "", label: "Barchasi" },
            { key: "MAJBURIY", label: "Majburiy blok" },
            { key: "ASOSIY", label: "Asosiy blok" },
            { key: "FULL", label: "Full DTM" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => { setDtmFilter(key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                dtmFilter === key
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
              }`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Cards grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {statusTab === "ALL" && "Testlar topilmadi"}
          {statusTab === "PUBLISHED" && "Nashr etilgan testlar topilmadi"}
          {statusTab === "DRAFT" && "Qoralama testlar yo'q"}
          {statusTab === "ARCHIVED" && "Arxivlangan testlar yo'q"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((test: any) => {
            const style = testTypeStyles[test.testType as keyof typeof testTypeStyles];
            const isArchived = test.testStatus === "ARCHIVED";
            const sales = salesByTestId.get(test.id);
            return (
            <div key={test.id} className={`border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-sm transition-all ${style?.cardBg ?? "bg-background border-border"} ${style?.ring ?? "hover:border-primary/30"} ${isArchived ? "opacity-70 saturate-50" : ""}`}>
              {/* Top badges */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style?.badge ?? "bg-muted text-muted-foreground"}`}>
                  {testTypeLabel(test)}
                </span>

                <div className="relative" ref={statusMenuFor === test.id ? statusMenuRef : undefined}>
                  <button
                    onClick={() => setStatusMenuFor(statusMenuFor === test.id ? null : test.id)}
                    className={`flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full text-xs font-medium transition-colors hover:brightness-95 ${statusColors[test.testStatus]}`}
                  >
                    {statusLabels[test.testStatus]}
                    <ChevronDown className={`w-3 h-3 transition-transform ${statusMenuFor === test.id ? "rotate-180" : ""}`} />
                  </button>

                  {statusMenuFor === test.id && (
                    <div className="absolute z-20 top-full right-0 mt-1.5 w-40 rounded-xl border border-border bg-background shadow-lg p-1">
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            if (s !== test.testStatus) handleStatusChange(test, s);
                            setStatusMenuFor(null);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-muted transition-colors text-left"
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${statusDotColors[s]}`} />
                          <span className="flex-1">{statusLabels[s]}</span>
                          {test.testStatus === s && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="flex-1">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">{test.testTitle}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(test.createdAt).toLocaleDateString("uz-UZ")}
                </p>
              </div>

              {/* Access */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium ${accessColors[test.testAccess]}`}>
                  {accessLabels[test.testAccess]}
                </span>
                {test.testAccess === "PREMIUM" && (
                  <span
                    className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"
                    title={sales ? `Jami daromad: ${sales.revenue.toLocaleString("uz-UZ")} so'm` : undefined}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    {sales ? `${sales.count} marta sotildi` : "Hali sotilmagan"}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileQuestion className="w-3.5 h-3.5" />
                  {test.totalQuestions} savol
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {test.duration} daq
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {test.totalAttempts}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <Link href={`/admin/tests/${test.id}/edit`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                    <Pencil className="w-3 h-3" />
                    Tahrirlash
                  </button>
                </Link>

                <Link href={`/admin/tests/${test.id}/results`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                    <BarChart3 className="w-3 h-3" />
                    Natijalar
                  </button>
                </Link>

                <a
                  href={`${test.testType === "SAT" ? `/sat/${test.id}` : `/exam/${test.id}`}?retake=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  title="Talaba ko'radigan sahifada ko'ring. Natija saqlanmaydi"
                >
                  <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                    <Eye className="w-3 h-3" />
                    Ko'rish
                  </button>
                </a>

                <button onClick={() => setDeleteTarget({ id: test.id, title: test.testTitle })}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors">
              ← Oldingi
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors">
              Keyingi →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}