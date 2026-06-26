"use client";

import { useState } from "react";
import { MessageCircle, Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const contacts = [
  {
    icon: MessageCircle,
    label: "Telegram",
    value: "@QabulAdmin",
    href: "https://t.me/QabulAdmin",
    color: "bg-[#2AABEE]/10 text-[#2AABEE]",
  },
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
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setSending(true);
    setError("");

    const token = process.env.NEXT_PUBLIC_TELEGRAM_CONTACT_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CONTACT_CHAT_ID;

    const text = [
      "📬 <b>Yangi murojaat</b>",
      "",
      `👤 <b>Ism:</b> ${form.name}`,
      form.phone ? `📞 <b>Telefon:</b> ${form.phone}` : null,
      `💬 <b>Xabar:</b> ${form.message}`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
        }
      );
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Xabar yuborilmadi. Iltimos qayta urinib ko'ring.");
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setForm({ name: "", phone: "", message: "" });
    setSubmitted(false);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Aloqa</h1>
        <p className="text-muted-foreground text-lg">
          Savollaringiz bo'lsa, biz bilan bog'laning
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">

        {/* Contact info */}
        <div>
          <h2 className="text-xl font-bold mb-6">Bog'lanish usullari</h2>
          <div className="space-y-3 mb-8">
            {contacts.map((c) => (
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

          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Ish vaqti:</strong> Dushanba — Shanba,
              09:00 — 18:00. Telegram orqali 24/7 javob berishga harakat qilamiz.
            </p>
          </div>
        </div>

        {/* Form */}
        <div>
          <h2 className="text-xl font-bold mb-6">Xabar yuborish</h2>

          {submitted ? (
            <div className="bg-background rounded-2xl border border-border p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Xabar yuborildi!</h3>
                <p className="text-muted-foreground text-sm">
                  Tez orada siz bilan bog'lanamiz. Telegram orqali ham murojaat qilishingiz mumkin.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-primary hover:underline"
              >
                Yangi xabar yuborish
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-background rounded-2xl border border-border p-6 space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Ismingiz <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Ism Familiya"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Telefon 
                </label>
                <Input
                  type="tel"
                  placeholder="+998 90 000 00 00"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Xabar <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={4}
                  placeholder="Savolingizni yozing..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              {error && (
                <p className="text-xs text-destructive text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={sending || !form.name.trim() || !form.message.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                {sending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
