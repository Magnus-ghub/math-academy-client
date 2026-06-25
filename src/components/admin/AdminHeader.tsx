"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Sun, Moon } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/lib/store/auth.store";

const GET_REPORTS_COUNT = gql`
  query GetReportsCount {
    getPendingReports {
      id
    }
  }
`;

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Foydalanuvchilar",
  "/admin/groups": "Guruhlar",
  "/admin/tests": "Testlar",
  "/admin/payments": "To'lovlar",
  "/admin/content": "Kontent",
  "/admin/book": "Kitob",
  "/admin/comments": "Izohlar",
  "/admin/reports": "Reportlar",
  "/admin/profile": "Profil",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const { theme, setTheme } = useTheme();

  const { data } = useQuery<{ getPendingReports: { id: string }[] }>(GET_REPORTS_COUNT, {
    pollInterval: 60_000,
  });

  const pendingCount = data?.getPendingReports?.length ?? 0;

  const title =
    Object.entries(pageTitles).find(([path]) => pathname === path)?.[1] ??
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path + "/"))?.[1] ??
    "Admin Panel";

  return (
    <header className="h-14 shrink-0 border-b border-border bg-background px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Page title */}
      <h1 className="font-semibold text-sm md:text-base truncate pl-10 md:pl-0">
        {title}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative p-2 rounded-xl hover:bg-muted transition-colors"
          title="Tema o'zgartirish"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-2 left-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Notification bell */}
        <Link
          href="/admin/reports"
          className="relative p-2 rounded-xl hover:bg-muted transition-colors"
          title="Reportlar"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {pendingCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <Link
          href="/admin/profile"
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors"
        >
          {user?.userImage ? (
            <Image
              src={user.userImage}
              alt={user.userName ?? "Admin"}
              width={30}
              height={30}
              className="rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-7.5 h-7.5 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.userName?.[0]?.toUpperCase() ?? "A"}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold leading-none">
              {user?.userName ?? "Admin"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Admin</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
