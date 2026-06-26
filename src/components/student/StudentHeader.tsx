"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Sun, Moon, LogOut, House } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/tests": "Testlar",
  "/dashboard/results": "Natijalarim",
  "/dashboard/leaderboard": "Reyting",
  "/dashboard/groups": "Guruhlarim",
  "/dashboard/profile": "Profil",
};

export default function StudentHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const title =
    Object.entries(pageTitles).find(([path]) => pathname === path)?.[1] ??
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path + "/"))?.[1] ??
    "Dashboard";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <header className="h-14 shrink-0 border-b border-border bg-background px-4 md:px-6 flex items-center justify-between gap-4">
        <h1 className="font-semibold text-sm md:text-base truncate pl-10 md:pl-0">
          {title}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          {/* Back to site */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Saytga qaytish"
          >
            <House className="w-4 h-4" />
            <span className="hidden sm:inline">Saytga qaytish</span>
          </Link>

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
          <button
            className="relative p-2 rounded-xl hover:bg-muted transition-colors"
            title="Bildirishnomalar"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Avatar */}
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors"
          >
            {user?.userImage ? (
              <Image
                src={user.userImage}
                alt={user.userName ?? "Student"}
                width={30}
                height={30}
                className="rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-7.5 h-7.5 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0">
                {user?.userName?.[0]?.toUpperCase() ?? "S"}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold leading-none">
                {user?.userName ?? "Student"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {user?.userRole ?? "Student"}
              </p>
            </div>
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
