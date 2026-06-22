"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Search, Clock, FileQuestion, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GET_ALL_TESTS, UPDATE_TEST, DELETE_TEST } from "@/lib/graphql/test";
import CreateTestModal from "@/components/admin/CreateTestModal";

const testTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary",
  SAT: "bg-accent/10 text-accent",
  MILLIY_SERTIFIKAT: "bg-green-100 text-green-700",
  ATTESTATSIYA: "bg-purple-100 text-purple-700",
  MAJBURIY_BLOK: "bg-orange-100 text-orange-700",
  DTM_GROUP: "bg-primary/20 text-primary",
  SAT_GROUP: "bg-accent/20 text-accent",
  MILLIY_GROUP: "bg-green-200 text-green-700",
  ATTESTATSIYA_GROUP: "bg-purple-200 text-purple-700",
  MAJBURIY_BLOK_GROUP: "bg-orange-200 text-orange-700",
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

const PAGE_SIZE = 10;

export default function AdminTestsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const { data, loading, refetch } = useQuery<{ getAllTests: any[] }>(GET_ALL_TESTS);
  const tests = data?.getAllTests || [];

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

  const filtered = tests.filter((t: any) => {
    const matchSearch = t.testTitle.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || t.testType === typeFilter;
    return matchSearch && matchType;
  });

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
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yangi test
        </button>
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
                <p className="text-xs text-muted-foreground">Bu amalni qaytarib bo'lmaydi</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              <span className="font-medium text-foreground">"{deleteTarget.title}"</span> va uning barcha savollarini o'chirishni tasdiqlaysizmi?
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
            { key: "ALL", label: "Barchasi" },
            { key: "DTM", label: "DTM" },
            { key: "SAT", label: "SAT" },
            { key: "MILLIY_SERTIFIKAT", label: "Milliy" },
            { key: "ATTESTATSIYA", label: "Attestatsiya" },
            { key: "MAJBURIY_BLOK", label: "Majburiy blok" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => { setTypeFilter(key); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === key ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Testlar topilmadi
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((test: any) => (
            <div key={test.id} className="bg-background border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 hover:shadow-sm transition-all">
              {/* Top badges */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${testTypeColors[test.testType]}`}>
                  {test.testType.replace("_GROUP", " G").replace("_", " ")}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[test.testStatus]}`}>
                  {statusLabels[test.testStatus]}
                </span>
              </div>

              {/* Title */}
              <div className="flex-1">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">{test.testTitle}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(test.createdAt).toLocaleDateString("uz-UZ")}
                </p>
              </div>

              {/* Access */}
              <span className={`w-fit px-2 py-0.5 rounded-full text-xs font-medium ${accessColors[test.testAccess]}`}>
                {accessLabels[test.testAccess]}
              </span>

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

                {test.testStatus === "DRAFT" && (
                  <button onClick={() => handleStatusChange(test, "PUBLISHED")}
                    className="flex-1 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors">
                    Nashr
                  </button>
                )}
                {test.testStatus === "PUBLISHED" && (
                  <button onClick={() => handleStatusChange(test, "ARCHIVED")}
                    className="flex-1 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-medium hover:bg-orange-200 transition-colors">
                    Arxiv
                  </button>
                )}
                {test.testStatus === "ARCHIVED" && (
                  <button onClick={() => handleStatusChange(test, "PUBLISHED")}
                    className="flex-1 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors">
                    Qayta nashr
                  </button>
                )}

                <button onClick={() => setDeleteTarget({ id: test.id, title: test.testTitle })}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
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