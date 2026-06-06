"use client";

import { useState } from "react";
import { Search, Filter, MoreHorizontal, Shield, Ban, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  BLOCKED: "bg-red-100 text-red-700",
  DELETED: "bg-gray-100 text-gray-500",
};

// Placeholder data
const mockUsers = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i + 1}`,
  userName: `Foydalanuvchi ${i + 1}`,
  userPhone: `+998 9${i} ${100 + i} ${10 + i} ${20 + i}`,
  userRole: ["STUDENT", "ACADEM_STUDENT", "TEACHER", "ADMIN"][i % 4],
  userStatus: i % 7 === 0 ? "BLOCKED" : "ACTIVE",
  userAuthType: i % 2 === 0 ? "TELEGRAM" : "GOOGLE",
  createdAt: new Date(2026, 0, i + 1).toLocaleDateString("uz-UZ"),
}));

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = mockUsers.filter((u) => {
    const matchSearch = u.userName.toLowerCase().includes(search.toLowerCase()) ||
      u.userPhone.includes(search);
    const matchRole = roleFilter === "ALL" || u.userRole === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2">
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
              {paginated.map((user, i) => (
                <tr key={user.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {user.userName[0]}
                      </div>
                      <span className="font-medium text-sm">{user.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{user.userPhone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.userRole]}`}>
                      {roleLabels[user.userRole]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.userStatus]}`}>
                      {user.userStatus === "ACTIVE" ? "Faol" : "Bloklangan"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {user.userAuthType === "TELEGRAM" ? "🔵 Telegram" : "🔴 Google"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{user.createdAt}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="p-1 rounded-lg hover:bg-muted transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <UserCheck className="w-4 h-4 mr-2 text-green-600" />
                          Premium berish
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="w-4 h-4 mr-2 text-blue-600" />
                          Rol o'zgartirish
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Ban className="w-4 h-4 mr-2" />
                          Bloklash
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80 disabled:opacity-40 transition-colors"
            >
              ← Oldingi
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => (
                <>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span key={`dots-${p}`} className="px-2 py-1.5 text-xs text-muted-foreground">...</span>
                  )}
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      page === p ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {p}
                  </button>
                </>
              ))
            }
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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