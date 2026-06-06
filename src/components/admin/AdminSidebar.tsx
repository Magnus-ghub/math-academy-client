"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderOpen,
  CreditCard,
  MessageSquare,
  Flag,
  FileText,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Saidxonov Academy"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div>
            <p className="font-bold text-sm">Saidxonov</p>
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
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          ← Saytga qaytish
        </Link>
      </div>
    </aside>
  );
}