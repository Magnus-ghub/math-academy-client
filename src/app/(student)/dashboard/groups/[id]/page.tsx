"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { useAuthStore, UserGroup } from "@/lib/store/auth.store";
import { GET_GROUP_MATERIALS } from "@/lib/graphql/content";
import { GET_MY_GROUPS } from "@/lib/graphql/group";
import { BookOpen, Play, FileText, Calendar, ArrowLeft, Lock } from "lucide-react";
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

export default function GroupMaterialsPage() {
  const { id } = useParams<{ id: string }>();
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

  const { data, loading, error } = useQuery<{ getGroupMaterials: any[] }>(
    GET_GROUP_MATERIALS,
    { variables: { groupId: id }, skip: !isMember }
  );

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="font-medium mb-1">Guruhga kirish imkoni yo'q</p>
        <p className="text-sm text-muted-foreground mb-4">
          Bu guruhga a'zo emassiz
        </p>
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

  const materials = data?.getGroupMaterials ?? [];

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
            <h1 className="text-2xl font-bold">
              {group.groupName ?? "Guruh materiallari"}
            </h1>
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

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-2xl h-48" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 text-sm">Materiallarni yuklab bo'lmadi</p>
        </div>
      )}

      {!loading && !error && materials.length === 0 && (
        <div className="bg-background border border-border rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-medium mb-1">Hali material yuklanmagan</p>
          <p className="text-sm text-muted-foreground">
            Yangi materiallar tez orada qo'shiladi
          </p>
        </div>
      )}

      {!loading && materials.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m: any) => (
            <MaterialCard key={m.id} material={m} />
          ))}
        </div>
      )}
    </div>
  );
}
