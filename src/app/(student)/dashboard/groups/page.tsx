"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Users, Calendar, BookOpen, FlaskConical, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore, UserGroup } from "@/lib/store/auth.store";
import { GET_MY_GROUPS } from "@/lib/graphql/group";
import { REFRESH_MY_GROUPS } from "@/lib/graphql/auth";

const groupTypeLabels: Record<string, string> = {
  DTM: "DTM",
  SAT: "SAT",
  MILLIY_SERTIFIKAT: "Milliy Sertifikat",
  ATTESTATSIYA: "Attestatsiya",
};

const groupTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary",
  SAT: "bg-accent/10 text-accent",
  MILLIY_SERTIFIKAT: "bg-green-100 text-green-700",
  ATTESTATSIYA: "bg-purple-100 text-purple-700",
};

export default function GroupsPage() {
  const { groups: storeGroups, setAuth, user, accessToken } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading } = useQuery<{ getMyGroups: UserGroup[] }>(GET_MY_GROUPS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.getMyGroups && user && accessToken) {
      setAuth(user, accessToken, data.getMyGroups);
    }
  }, [data]);

  const [refreshMyGroups] = useMutation(REFRESH_MY_GROUPS, {
    onCompleted: (res: any) => {
      const { user: freshUser, accessToken: freshToken, groups: freshGroups } = res.refreshMyGroups;
      setAuth(freshUser, freshToken, freshGroups);
      setRefreshing(false);
      toast.success("Guruhlar yangilandi!");
    },
    onError: (err) => {
      setRefreshing(false);
      toast.error(err.message || "Guruhlarni yangilashda xatolik");
    },
  });

  const handleRefresh = () => {
    setRefreshing(true);
    refreshMyGroups();
  };

  const groups = data?.getMyGroups ?? storeGroups;

  const activeGroups = groups.filter((g) => new Date(g.expiresAt) > new Date());
  const expiredGroups = groups.filter((g) => new Date(g.expiresAt) <= new Date());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Guruhlarim</h1>
          <p className="text-muted-foreground text-sm">A'zo bo'lgan guruhlaringiz</p>
        </div>
        {user?.telegramId && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Guruhlarni yangilash
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-medium mb-1">Hali guruhga a'zo emassiz</p>
          <p className="text-sm text-muted-foreground mb-4">
            Telegram guruhga a'zo bo'lib, "Guruhlarni yangilash" tugmasini bosing
          </p>
          {user?.telegramId ? (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Guruhlarni yangilash
            </button>
          ) : (
            <Link href="/login">
              <button className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                Telegram orqali kirish
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {activeGroups.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Faol ({activeGroups.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-background rounded-2xl border border-border p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${groupTypeColors[group.groupType] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {groupTypeLabels[group.groupType] ?? group.groupType}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Faol
                      </span>
                    </div>
                    {group.groupName && (
                      <p className="font-semibold text-sm mb-2">{group.groupName}</p>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>
                          Muddat:{" "}
                          {new Date(group.expiresAt).toLocaleDateString("uz-UZ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/groups/${group.groupId}`} className="flex-1">
                        <button className="w-full bg-primary/10 text-primary py-2 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          Materiallar
                        </button>
                      </Link>
                      <Link
                        href={`/dashboard/groups/${group.groupId}`}
                        className="flex-1"
                      >
                        <button className="w-full bg-accent/10 text-accent py-2 rounded-xl text-sm font-medium hover:bg-accent/20 transition-colors flex items-center justify-center gap-1.5">
                          <FlaskConical className="w-4 h-4" />
                          Testlar
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiredGroups.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Muddati o'tgan ({expiredGroups.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expiredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-muted/30 rounded-2xl border border-border p-5 opacity-60"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${groupTypeColors[group.groupType] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {groupTypeLabels[group.groupType] ?? group.groupType}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                        Muddati o'tgan
                      </span>
                    </div>
                    {group.groupName && (
                      <p className="font-semibold text-sm mb-2">{group.groupName}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>
                        {new Date(group.expiresAt).toLocaleDateString("uz-UZ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
