"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { X, Search, UserPlus, Check, Loader2 } from "lucide-react";
import { SEARCH_USERS } from "@/lib/graphql/user";
import { ADD_USER_TO_GROUP, GET_GROUP_MEMBER_IDS } from "@/lib/graphql/group";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  STUDENT: "Talaba",
  ACADEM_STUDENT: "Premium",
  TEACHER: "O'qituvchi",
  ADMIN: "Admin",
};

const roleColors: Record<string, string> = {
  STUDENT: "bg-gray-100 text-gray-600",
  ACADEM_STUDENT: "bg-blue-100 text-blue-700",
  TEACHER: "bg-green-100 text-green-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

interface Group {
  id: string;
  groupName: string;
  durationMonths: number;
}

interface Props {
  group: Group | null;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddUserToGroupModal({ group, onClose, onAdded }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const { data: membersData, loading: membersLoading } = useQuery<{ getGroupMemberIds: string[] }>(
    GET_GROUP_MEMBER_IDS,
    { variables: { groupId: group?.id }, skip: !group, fetchPolicy: "network-only" }
  );

  const existingMemberIds = new Set([
    ...(membersData?.getGroupMemberIds ?? []),
    ...addedIds,
  ]);

  const { data: searchData, loading: searching } = useQuery<{ searchUsers: any[] }>(
    SEARCH_USERS,
    { variables: { search: debouncedSearch }, skip: debouncedSearch.length < 2 }
  );

  const users = searchData?.searchUsers ?? [];

  const [addUser, { loading: adding }] = useMutation(ADD_USER_TO_GROUP, {
    onCompleted: (data: any) => {
      const userId = data.addUserToGroup.userId;
      setAddedIds((prev) => new Set([...prev, userId]));
      onAdded();
      toast.success("Foydalanuvchi guruhga qo'shildi");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  if (!group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl border border-border shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div>
            <h2 className="font-semibold">A'zo qo'shish</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{group.groupName} · {group.durationMonths} oy</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, telefon yoki Telegram ID..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {debouncedSearch.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <p>Kamida 2 ta harf kiriting</p>
            </div>
          ) : membersLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
              <p>Foydalanuvchi topilmadi</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {users.map((user: any) => {
                const isAlready = existingMemberIds.has(user.id);
                return (
                  <li key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {user.userName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.userName || "—"} {user.userLastName || ""}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.userPhone || user.telegramId || "—"}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${roleColors[user.userRole]}`}>
                      {roleLabels[user.userRole] || user.userRole}
                    </span>
                    {isAlready ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        Guruhda
                      </span>
                    ) : (
                      <button
                        onClick={() => addUser({ variables: { groupId: group.id, userId: user.id } })}
                        disabled={adding}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Qo'shish
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            {addedIds.size > 0 ? `${addedIds.size} ta yangi a'zo qo'shildi` : "Natijalar maksimal 20 ta ko'rsatiladi"}
          </p>
        </div>
      </div>
    </div>
  );
}
