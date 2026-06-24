"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Search, Ban, Pencil, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GET_ALL_USERS, ADMIN_UPDATE_USER } from "@/lib/graphql/user";
import { toast } from "sonner";
import EditUserModal from "@/components/admin/EditUserModal";

const roleColors: Record<string, string> = {
  STUDENT: "bg-gray-100 text-gray-700",
  ACADEM_STUDENT: "bg-blue-100 text-blue-700",
  TEACHER: "bg-green-100 text-green-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

const roleLabels: Record<string, string> = {
  STUDENT: "Talaba",
  ACADEM_STUDENT: "Premium",
  TEACHER: "O'qituvchi",
  ADMIN: "Admin",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  BLOCKED: "bg-red-100 text-red-600",
};

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data, loading, refetch } = useQuery<{ getAllUsers: any[] }>(GET_ALL_USERS);
  const users = data?.getAllUsers || [];

  const [adminUpdateUser] = useMutation<
    { adminUpdateUser: { userStatus: string } },
    { userId: string; input: { userStatus: string } }
  >(ADMIN_UPDATE_USER, {
    onCompleted: (data) => {
      refetch();
      const status = data.adminUpdateUser.userStatus;
      toast.success(status === "BLOCKED" ? "Foydalanuvchi bloklandi" : "Foydalanuvchi blokdan chiqarildi");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const filtered = users.filter((u) => {
    const matchSearch =
      u.userName?.toLowerCase().includes(search.toLowerCase()) ||
      u.userLastName?.toLowerCase().includes(search.toLowerCase()) ||
      u.userPhone?.includes(search) ||
      u.telegramId?.includes(search);
    const matchRole = roleFilter === "ALL" || u.userRole === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} ta foydalanuvchi</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Ism, telefon yoki Telegram ID..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "STUDENT", "ACADEM_STUDENT", "TEACHER", "ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === role
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {role === "ALL" ? "Barchasi" : roleLabels[role]}
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
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Foydalanuvchi</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Telefon</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Rol</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Holat</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Kirish</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Sana</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.map((user: any, i: number) => (
                <tr
                  key={user.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {user.userName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.userName || "—"}</p>
                        {user.userLastName && (
                          <p className="text-xs text-muted-foreground">{user.userLastName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.userPhone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.userRole]}`}>
                      {roleLabels[user.userRole]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.userStatus] || "bg-gray-100 text-gray-600"}`}>
                      {user.userStatus === "ACTIVE" ? "Faol" : "Bloklangan"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {user.userAuthType === "TELEGRAM" ? "🔵 Telegram" : "🔴 Google"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Tahrirlash"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      {user.userStatus === "BLOCKED" ? (
                        <button
                          onClick={() => adminUpdateUser({ variables: { userId: user.id, input: { userStatus: "ACTIVE" } } })}
                          className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                          title="Blokdan chiqarish"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                        </button>
                      ) : (
                        <button
                          onClick={() => adminUpdateUser({ variables: { userId: user.id, input: { userStatus: "BLOCKED" } } })}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Bloklash"
                        >
                          <Ban className="w-3.5 h-3.5 text-red-500" />
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
            {filtered.length === 0
              ? "0 ta natija"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} / ${filtered.length}`}
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

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSaved={() => refetch()}
      />
    </div>
  );
}
