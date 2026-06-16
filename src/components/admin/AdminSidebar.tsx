"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, BookOpen, FolderOpen, CreditCard, MessageSquare, Flag, FileText, ChevronRight, LogOut, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter } from "next/navigation";

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Foydalanuvchilar" },
  { href: "/admin/groups", icon: FolderOpen, label: "Guruhlar" },
  { href: "/admin/tests", icon: BookOpen, label: "Testlar" },
  { href: "/admin/payments", icon: CreditCard, label: "To'lovlar" },
  { href: "/admin/content", icon: FileText, label: "Kontent" },
  { href: "/admin/comments", icon: MessageSquare, label: "Izohlar" },
  { href: "/admin/reports", icon: Flag, label: "Reportlar" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
          <Image src="/logo.jpg" alt="Saidxonov Academy" width={36} height={36} className="rounded-lg" />
          <div>
            <p className="font-bold text-sm text-white">Saidxonov</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800 space-y-1">
        {/* Profile card */}
        <Link
          href="/admin/profile"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-2",
            pathname === "/admin/profile"
              ? "bg-primary text-white"
              : "hover:bg-gray-800"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.userName?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user?.userName || "Admin"} {user?.userLastName || ""}
            </p>
            <p className="text-xs text-gray-400 truncate">Profilni ko'rish</p>
          </div>
          <UserCircle className="w-4 h-4 text-gray-400 shrink-0" />
        </Link>

        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          ← Saytga qaytish
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-gray-950 text-white flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-950 text-white rounded-xl shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 z-50 w-64 h-full bg-gray-950 text-white transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}