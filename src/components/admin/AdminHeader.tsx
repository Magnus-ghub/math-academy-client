"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Sun, Moon, House, LogOut } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";

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
  "/admin/recovery": "Tiklash so'rovlari",
  "/admin/profile": "Profil",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const { data } = useQuery<{ getPendingReports: { id: string }[] }>(GET_REPORTS_COUNT, {
    pollInterval: 60_000,
  });

  const pendingCount = data?.getPendingReports?.length ?? 0;

  const title =
    Object.entries(pageTitles).find(([path]) => pathname === path)?.[1] ??
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path + "/"))?.[1] ??
    "Admin Panel";

  return (
    <>
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

          {/* Back to site */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Saytga qaytish"
          >
            <House className="w-4 h-4" />
            <span className="hidden sm:inline">Saytga qaytish</span>
          </Link>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-xl hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors"
            title="Chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}
