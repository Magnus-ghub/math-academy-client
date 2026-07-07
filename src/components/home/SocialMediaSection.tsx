import { ExternalLink } from "lucide-react";

const socials = [
  {
    name: "Telegram",
    handle: "Matematika Milliy Sertifikat",
    href: "https://t.me/MatematikaMilliy_Sertifikat",
    color: "#2AABEE",
    icon: (
      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.022 9.531c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.22 14.367l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.596.219z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    handle: "Jamshid Saidxonov",
    href: "https://youtube.com/@jamshid_saidxonov?si=PaQtL5LpqfGw03Z0",
    color: "#FF0000",
    icon: (
      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "jamshid_saidxonov",
    href: "https://www.instagram.com/jamshid_saidxonov?igsh=Njc5cmtjZnhmOXV1",
    color: "#E1306C",
    icon: (
      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
];

export default function SocialMediaSection() {
  return (
    <section className="py-16 bg-linear-to-br from-[#2AABEE]/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold mb-1">Ijtimoiy tarmoqlarda kuzatib boring</h2>
            <p className="text-sm text-muted-foreground">Jamshid Saidxonov — Matematika Milliy Sertifikat</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center gap-3 bg-background rounded-2xl border border-border p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.handle}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Ochish
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
