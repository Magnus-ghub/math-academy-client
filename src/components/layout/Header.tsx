"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";
import {
  Menu,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store/auth.store";
import { UserRole } from "@/lib/enums/user.enum";

const navLinks = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/", label: "Kurslar", section: "events" },
  { href: "/tests", label: "Testlar" },
  { href: "/about", label: "Biz Haqimizda" },
  { href: "/contact", label: "Aloqa" },
  { href: "/", label: "FAQ", section: "faq" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const pendingSection = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === "/" && pendingSection.current) {
      const id = pendingSection.current;
      pendingSection.current = null;
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [pathname]);

  const handleSectionClick = (e: React.MouseEvent, section: string) => {
    e.preventDefault();
    setOpen(false);
    if (pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      pendingSection.current = section;
      router.push("/");
    }
  };

  const isActive = (href: string, section?: string) => {
    if (section) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const dashboardLink =
    user?.userRole === UserRole.ADMIN ? "/admin" : "/dashboard";

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Saidxonov Academy"
            width={40}
            height={40}
            className="rounded-md"
          />
          <span className="font-bold text-lg text-primary hidden sm:block">
            Saidxonov Academy
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
            link.section ? (
              <button
                key={link.label}
                onClick={(e) => handleSectionClick(e, link.section!)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* User menu */}
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={user.userImage || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                    {user.userName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2.5 py-0.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.userImage || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                          {user.userName?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground leading-tight">
                          {user.userName} {user.userLastName || ""}
                        </span>
                        <span className="text-xs text-muted-foreground leading-tight">
                          {user.userRole === UserRole.ADMIN
                            ? "Admin"
                            : user.userRole === UserRole.TEACHER
                              ? "O'qituvchi"
                              : "O'quvchi"}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(dashboardLink)}>
                  <LayoutDashboard />
                  Dashboard
                </DropdownMenuItem>
                {user.userRole === UserRole.ADMIN && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <Shield />
                    Admin panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setShowLogoutConfirm(true)}>
                  <LogOut />
                  Chiqish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Kirish
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 flex flex-col p-0">
              {/* Logo */}
              <div className="px-6 pt-14 pb-5 border-b border-border">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                  <Image
                    src="/logo.jpg"
                    alt="Saidxonov Academy"
                    width={36}
                    height={36}
                    className="rounded-md"
                  />
                  <span className="font-bold text-primary">
                    Saidxonov Academy
                  </span>
                </Link>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col gap-0.5 px-4 py-4 flex-1">
                {navLinks.map((link) =>
                  link.section ? (
                    <button
                      key={link.label}
                      onClick={(e) => handleSectionClick(e, link.section!)}
                      className="px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "text-primary bg-primary/8"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>

              {/* Auth buttons */}
              <div className="px-4 pb-8 pt-2 border-t border-border">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2 pt-4">
                    <button
                      onClick={() => { router.push(dashboardLink); setOpen(false); }}
                      className="w-full py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setOpen(false); setShowLogoutConfirm(true); }}
                      className="w-full py-3 rounded-xl border border-border text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      Chiqish
                    </button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)} className="block pt-4">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Kirish
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
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
