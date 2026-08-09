"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { GET_DELETED_TESTS, RESTORE_TEST } from "@/lib/graphql/test";

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

export default function TrashPage() {
  const { data, loading, refetch } = useQuery<{ getDeletedTests: any[] }>(GET_DELETED_TESTS);
  const tests = data?.getDeletedTests || [];

  const [restoreTest, { loading: restoring }] = useMutation(RESTORE_TEST, {
    onCompleted: () => {
      toast.success("Test tiklandi — Qoralama bo'limiga qaytdi");
      refetch();
    },
    onError: () => toast.error("Tiklashda xatolik yuz berdi"),
  });

  return (
    <div>
      <Link
        href="/admin/tests"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Testlarga qaytish
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-muted-foreground" />
          Savatcha
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          O'chirilgan testlar. Ularning ma'lumotlari va talabalarning eski natijalari saqlanib qolgan, faqat testlar ro'yxatidan yashirilgan.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Savatcha bo'sh
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test: any) => (
            <div
              key={test.id}
              className="border border-border rounded-2xl p-4 flex flex-col gap-2 opacity-80"
            >
              <span className="w-fit px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {testTypeLabel(test)}
              </span>
              <h3 className="font-semibold text-sm leading-snug line-clamp-2">{test.testTitle}</h3>
              <p className="text-xs text-muted-foreground">
                {test.totalQuestions} savol · {new Date(test.createdAt).toLocaleDateString("uz-UZ")}
              </p>
              <button
                onClick={() => restoreTest({ variables: { testId: test.id } })}
                disabled={restoring}
                className="mt-1 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3 h-3" />
                Qayta tiklash
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
