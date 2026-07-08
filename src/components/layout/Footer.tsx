"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

type FooterLink = { href: string; label: string; section?: string };

const footerLinks: Record<string, FooterLink[]> = {
  'Platforma': [
    { href: '/tests', label: 'Testlar' },
    { href: '/#pricing', label: 'Narxlar', section: 'pricing' },
    { href: '/#how-it-works', label: 'Qanday ishlaydi', section: 'how-it-works' },
  ],
  'Kabinet': [
    { href: '/login', label: 'Kirish' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/results', label: 'Natijalarim' },
  ],
  'Yordam': [
    { href: '/contact', label: 'Aloqa' },
    { href: '/#faq', label: 'FAQ', section: 'faq' },
    { href: 'https://t.me/MatematikaMilliy_Sertifikat', label: 'Telegram kanal' },
  ],
};

export function Footer() {
  const router = useRouter();
  const pathname = usePathname();
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
    if (pathname === "/") {
      document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
    } else {
      pendingSection.current = section;
      router.push("/");
    }
  };

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/logo.jpg"
                alt="Saidxonov Academy"
                width={36}
                height={36}
                className="rounded-md"
              />
              <span className="font-bold text-white text-lg">Saidxonov Academy</span>
            </div>
            <p className="text-sm leading-relaxed">
              O'zbekistondagi eng yaxshi matematika tayyorgarlik markazi.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(({ href, label, section }) => (
                  <li key={href}>
                    {section ? (
                      <button
                        onClick={(e) => handleSectionClick(e, section)}
                        className="text-sm hover:text-white transition-colors text-left"
                      >
                        {label}
                      </button>
                    ) : (
                      <Link
                        href={href}
                        className="text-sm hover:text-white transition-colors"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p>© 2026 Saidxonov Academy. Barcha huquqlar himoyalangan.</p>
          <p className="text-xs">
            <span className="text-primary font-semibold">Saidxonov Academy</span> — Matematika tayyorgarlik platformasi
          </p>
        </div>
      </div>
    </footer>
  );
}
