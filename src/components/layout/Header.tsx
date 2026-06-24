"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
  { href: "/tests", label: "Testlar" },
  { href: "/#events", label: "Tadbirlar" },
  { href: "/#faq", label: "FAQ" },
  { href: "/about", label: "Haqida" },
  { href: "/contact", label: "Aloqa" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
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
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
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
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User />
                  Profil
                </DropdownMenuItem>
                {user.userRole === UserRole.ADMIN && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <Shield />
                    Admin panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
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
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" className="flex items-center gap-2">
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
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "text-primary bg-primary/8"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        router.push(dashboardLink);
                        setOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-destructive"
                    >
                      Chiqish
                    </button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setOpen(false)}>
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
  );
}
