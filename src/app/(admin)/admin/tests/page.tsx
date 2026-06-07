"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Search, Clock, FileQuestion, Eye, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GET_ALL_TESTS, UPDATE_TEST, DELETE_QUESTION } from "@/lib/graphql/test";
import CreateTestModal from "@/components/admin/CreateTestModal";

const testTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary",
  SAT: "bg-accent/10 text-accent",
  MILLIY_SERTIFIKAT: "bg-green-100 text-green-700",
  ATTESTATSIYA: "bg-purple-100 text-purple-700",
  DTM_GROUP: "bg-primary/20 text-primary",
  SAT_GROUP: "bg-accent/20 text-accent",
  MILLIY_GROUP: "bg-green-200 text-green-700",
  ATTESTATSIYA_GROUP: "bg-purple-200 text-purple-700",
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

  const { data, loading, refetch } = useQuery<{ getAllTests: any[] }>(GET_ALL_TESTS);
  const tests = data?.getAllTests || [];

  const [updateTest] = useMutation(UPDATE_TEST, {
    onCompleted: () => {
      toast.success("Test holati yangilandi");
      refetch();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
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
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
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
        <CreateTestModal
          onClose={() => setShowModal(false)}
          onSuccess={() => refetch()}
        />
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
          {["ALL", "DTM", "SAT", "MILLIY_SERTIFIKAT", "ATTESTATSIYA"].map((type) => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === type
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type === "ALL" ? "Barchasi" : type === "MILLIY_SERTIFIKAT" ? "Milliy" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Test nomi</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Tur</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Kirish</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Holat</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Savollar</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Vaqt</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Urinish</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((test: any, i: number) => (
                <tr
                  key={test.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{test.testTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(test.createdAt).toLocaleDateString("uz-UZ")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${testTypeColors[test.testType]}`}>
                      {test.testType.replace("_GROUP", " G")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${accessColors[test.testAccess]}`}>
                      {accessLabels[test.testAccess]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[test.testStatus]}`}>
                      {statusLabels[test.testStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm">
                      <FileQuestion className="w-3 h-3 text-muted-foreground" />
                      {test.totalQuestions}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {test.duration} daq
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {test.totalAttempts}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {test.testStatus === "DRAFT" && (
                        <button
                          onClick={() => handleStatusChange(test, "PUBLISHED")}
                          className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          Nashr
                        </button>
                      )}
                      {test.testStatus === "PUBLISHED" && (
                        <button
                          onClick={() => handleStatusChange(test, "ARCHIVED")}
                          className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          Arxiv
                        </button>
                      )}
                      {test.testStatus === "ARCHIVED" && (
                        <button
                          onClick={() => handleStatusChange(test, "PUBLISHED")}
                          className="px-2 py1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          Qayta nashr
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
            >
              ← Oldingi
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
            >
              Keyingi →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}