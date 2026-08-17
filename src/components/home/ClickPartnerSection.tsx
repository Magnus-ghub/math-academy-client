import { ShieldCheck, CreditCard, Zap } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Xavfsiz to'lov",
    desc: "Rasmiy shartnoma asosida himoyalangan tranzaksiyalar",
  },
  {
    icon: CreditCard,
    title: "Istalgan karta",
    desc: "Uzcard, Humo yoki xalqaro kartalar bilan to'lash imkoniyati",
  },
  {
    icon: Zap,
    title: "Tezkor tasdiqlash",
    desc: "To'lov bir necha soniyada amalga oshadi",
  },
];

export default function ClickPartnerSection() {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-background p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-32 h-20 rounded-2xl flex items-center justify-center bg-gray-950 px-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/click-logo.svg" alt="Click" className="w-full h-auto" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Rasmiy hamkor</span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold mb-2">CLICK bilan rasmiy hamkorlikdamiz</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Saidxonov Academy CLICK to'lov tizimi bilan rasmiy shartnoma asosida ishlaydi. Balansingizni
                CLICK orqali — istalgan bank kartasi, QR kod yoki telefon raqami bilan xavfsiz va tezkor
                to'ldirishingiz mumkin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
