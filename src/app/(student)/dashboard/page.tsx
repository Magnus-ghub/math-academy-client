// app/(dashboard)/layout.tsx
import React from "react";
import Link from "next/link";
import { BookOpen, BookOpenCheck, GraduationCap, User } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Student Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background p-4 fixed h-full">
        <div className="flex items-center gap-2 px-2 py-4 border-b mb-4">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-md text-primary">Student Panel</span>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <BookOpen className="h-4 w-4" /> Kurslarim
          </Link>
          <Link href="/dashboard/exams" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <BookOpenCheck className="h-4 w-4" /> Imtihonlar
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
            <User className="h-4 w-4" /> Profil
          </Link>
        </nav>
      </aside>

      {/* Main Content Side */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* Kichik Dashboard Header */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-40">
          <h1 className="font-semibold text-lg">Xush kelibsiz!</h1>
          {/* Bu yerga xabarnomalar yoki profil tugmasini qo'yish mumkin */}
        </header>
        
        {/* Sahifa kontenti */}
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}