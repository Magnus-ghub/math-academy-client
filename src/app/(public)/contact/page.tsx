import { MessageCircle, Mail, MapPin, ArrowUpRight } from "lucide-react";

const otherContacts = [
  {
    icon: Mail,
    label: "Email",
    value: "info@saidxonovacademy.uz",
    href: "#",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: MapPin,
    label: "Manzil",
    value: "Termiz, O'zbekiston",
    href: "#",
    color: "bg-primary/10 text-primary",
  },
];

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Aloqa</h1>
        <p className="text-muted-foreground text-lg">
          Savollaringiz bo'lsa, biz bilan bog'laning
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-8">
        {/* Telegram — asosiy aloqa kanali */}
        <a
          href="https://t.me/QabulAdmin"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center text-center gap-4 p-8 md:p-10 rounded-3xl bg-[#2AABEE] text-white shadow-lg shadow-[#2AABEE]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1.5">Qabul Admin bilan bog'laning</h2>
            <p className="text-white/85 text-sm leading-relaxed max-w-sm">
              Barcha savollaringizga tezkor javob olish uchun Telegram orqali yozing —
              admin har bir murojaatga shaxsan javob beradi.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-white text-[#2AABEE] text-sm font-semibold px-5 py-2.5 rounded-xl group-hover:bg-white/90 transition-colors">
            @QabulAdmin
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </a>

        {/* Boshqa aloqa usullari */}
        <div className="space-y-3">
          {otherContacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-border hover:shadow-md transition-all group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {c.value}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Ish vaqti:</strong> Dushanba — Shanba,
            09:00 — 18:00. Telegram orqali 24/7 javob berishga harakat qilamiz.
          </p>
        </div>
      </div>
    </div>
  );
}
