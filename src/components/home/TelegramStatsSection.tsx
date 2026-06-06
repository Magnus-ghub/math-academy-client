import { ExternalLink } from "lucide-react";

const stats = [
  { value: "45 000+", label: "Yangi obunachi", emoji: "👥" },
  { value: "35.2M+", label: "Ko'rishlar", emoji: "👁️" },
  { value: "276 000+", label: "Reaksiyalar", emoji: "👍" },
  { value: "2 288+", label: "Darslar", emoji: "📚" },
];

export default function TelegramStatsSection() {
  return (
    <section className="py-16 bg-linear-to-br from-[#2AABEE]/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#2AABEE] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.022 9.531c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.22 14.367l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.596.219z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">Rasmiy Telegram kanalimiz</h2>
                <p className="text-sm text-muted-foreground">Matematika Milliy Sertifikat — Jamshid Saidxonov</p>
              </div>
            </div>
            
            <a
              href="https://t.me/MatematikaMilliy_Sertifikat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#2AABEE] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#229ED9] transition-colors"
            >
              Kanalga o'tish
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-background rounded-2xl border border-border p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <p className="text-2xl font-black text-primary mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            * Telemetrio.io ma'lumotlari asosida — 2025-yil dekabr holati
          </p>
        </div>
      </div>
    </section>
  );
}