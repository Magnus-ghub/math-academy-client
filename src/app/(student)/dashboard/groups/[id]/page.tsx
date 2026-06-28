"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuthStore, UserGroup } from "@/lib/store/auth.store";
import { GET_GROUP_MATERIALS } from "@/lib/graphql/content";
import { GET_MY_GROUPS } from "@/lib/graphql/group";
import { GET_TESTS } from "@/lib/graphql/test";
import {
  BookOpen,
  Play,
  FileText,
  Calendar,
  ArrowLeft,
  Lock,
  Clock,
  FileQuestion,
  FlaskConical,
} from "lucide-react";
import Link from "next/link";

function MaterialCard({ material }: { material: any }) {
  const hasVideo = !!material.contentVideo;
  const meta = material.metaJson ? JSON.parse(material.metaJson) : {};

  return (
    <div className="bg-background border border-border rounded-2xl overflow-hidden">
      {material.contentImage && (
        <div className="relative aspect-video bg-muted">
          {hasVideo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 text-primary ml-1" />
              </div>
            </div>
          ) : null}
          <img
            src={material.contentImage}
            alt={material.contentTitle}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            {hasVideo ? (
              <Play className="w-4 h-4 text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {material.contentTitle}
            </h3>
            {meta.duration && (
              <span className="text-xs text-muted-foreground mt-0.5 block">
                {meta.duration}
              </span>
            )}
          </div>
        </div>

        {material.contentDesc && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {material.contentDesc}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(material.createdAt).toLocaleDateString("uz-UZ")}
          </span>
          {hasVideo && (
            <a
              href={material.contentVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              Ko'rish
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const testTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary border-primary/20",
  SAT: "bg-accent/10 text-accent border-accent/20",
  MILLIY_SERTIFIKAT: "bg-green-50 text-green-700 border-green-200",
  ATTESTATSIYA: "bg-purple-50 text-purple-700 border-purple-200",
};

const dtmTypeLabels: Record<string, string> = {
  MAJBURIY: "DTM Majburiy",
  ASOSIY: "DTM Asosiy",
  FULL: "Full DTM",
};

function getTestLabel(test: any): string {
  if (test.testType === "DTM" && test.dtmType) return dtmTypeLabels[test.dtmType] ?? "DTM";
  const labels: Record<string, string> = {
    DTM: "DTM",
    SAT: "SAT",
    MILLIY_SERTIFIKAT: "Milliy",
    ATTESTATSIYA: "Attestatsiya",
  };
  return labels[test.testType] ?? test.testType;
}

function TestCard({ test }: { test: any }) {
  return (
    <div
      className={`bg-background rounded-2xl border-2 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 ${testTypeColors[test.testType] || "border-border"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${testTypeColors[test.testType]}`}
        >
          {getTestLabel(test)}
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
          Guruh testi
        </div>
      </div>

      <h3 className="font-bold mb-3 text-foreground">{test.testTitle}</h3>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <FileQuestion className="w-3 h-3" />
          {test.totalQuestions} savol
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {test.duration} daq
        </div>
        <span>{test.totalAttempts} urinish</span>
      </div>

      <Link href={test.testType === "SAT" ? `/sat/${test.id}` : `/exam/${test.id}`}>
        <button className="w-full py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
          {test.testType === "SAT" ? "Start SAT →" : "Boshlash →"}
        </button>
      </Link>
    </div>
  );
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"materials" | "tests">("materials");
  const { groups: storeGroups, setAuth, user, accessToken } = useAuthStore();

  const { data: groupsData } = useQuery<{ getMyGroups: UserGroup[] }>(GET_MY_GROUPS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (groupsData?.getMyGroups && user && accessToken) {
      setAuth(user, accessToken, groupsData.getMyGroups);
    }
  }, [groupsData]);

  const groups = groupsData?.getMyGroups ?? storeGroups;
  const group = groups.find((g) => g.groupId === id);
  const isExpired = group ? new Date(group.expiresAt) <= new Date() : false;
  const isMember = !!group && !isExpired;

  const { data: materialsData, loading: materialsLoading, error: materialsError } = useQuery<{
    getGroupMaterials: any[];
  }>(GET_GROUP_MATERIALS, { variables: { groupId: id }, skip: !isMember });

  const { data: testsData, loading: testsLoading } = useQuery<{ getTests: any[] }>(GET_TESTS, {
    skip: !isMember,
  });

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="font-medium mb-1">Guruhga kirish imkoni yo'q</p>
        <p className="text-sm text-muted-foreground mb-4">Bu guruhga a'zo emassiz</p>
        <Link href="/dashboard/groups">
          <button className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            Guruhlarimga qaytish
          </button>
        </Link>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-12 h-12 text-red-400/50 mb-4" />
        <p className="font-medium mb-1">Obuna muddati tugagan</p>
        <p className="text-sm text-muted-foreground mb-4">
          Muddati: {new Date(group.expiresAt).toLocaleDateString("uz-UZ")}
        </p>
        <Link href="/dashboard/groups">
          <button className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            Orqaga
          </button>
        </Link>
      </div>
    );
  }

  const materials = materialsData?.getGroupMaterials ?? [];
  const groupTests = (testsData?.getTests ?? []).filter(
    (t: any) => t.testAccess === "GROUP" && t.groupId === id
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/groups"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Guruhlarimga qaytish
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{group.groupName ?? "Guruh"}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Obuna tugashi:{" "}
              <span className="text-foreground font-medium">
                {new Date(group.expiresAt).toLocaleDateString("uz-UZ")}
              </span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            Faol
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab("materials")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "materials"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Materiallar
          {materials.length > 0 && (
            <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
              {materials.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "tests"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Testlar
          {groupTests.length > 0 && (
            <span className="bg-accent/10 text-accent text-xs px-1.5 py-0.5 rounded-full">
              {groupTests.length}
            </span>
          )}
        </button>
      </div>

      {/* Materials Tab */}
      {activeTab === "materials" && (
        <>
          {materialsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-2xl h-48" />
              ))}
            </div>
          )}

          {materialsError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-600 text-sm">Materiallarni yuklab bo'lmadi</p>
            </div>
          )}

          {!materialsLoading && !materialsError && materials.length === 0 && (
            <div className="bg-background border border-border rounded-2xl p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-medium mb-1">Hali material yuklanmagan</p>
              <p className="text-sm text-muted-foreground">
                Yangi materiallar tez orada qo'shiladi
              </p>
            </div>
          )}

          {!materialsLoading && materials.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((m: any) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tests Tab */}
      {activeTab === "tests" && (
        <>
          {testsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-2xl h-48" />
              ))}
            </div>
          )}

          {!testsLoading && groupTests.length === 0 && (
            <div className="bg-background border border-border rounded-2xl p-12 text-center">
              <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-medium mb-1">Hali test yuklanmagan</p>
              <p className="text-sm text-muted-foreground">
                Yangi testlar tez orada qo'shiladi
              </p>
            </div>
          )}

          {!testsLoading && groupTests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupTests.map((test: any) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
