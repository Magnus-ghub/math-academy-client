"use client";

import { useState } from "react";
import { MessageCircle, Mail, Phone, MapPin, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

const contacts = [
  { icon: MessageCircle, label: "Telegram", value: "@Jamshid_Saidxonov", href: "https://t.me/Jamshid_Saidxonov", color: "bg-[#2AABEE]/10 text-[#2AABEE]" },
  { icon: Mail, label: "Email", value: "info@saidxonovacademy.uz", href: "mailto:info@saidxonovacademy.uz", color: "bg-accent/10 text-accent" },
  { icon: MapPin, label: "Manzil", value: "Termiz, O'zbekiston", href: "#", color: "bg-primary/10 text-primary" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

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
          <div className="space-y-4 mb-8">
            {contacts.map((contact) => (
              <a
                key={contact.label}
                href={contact.href}
                className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-border hover:shadow-md transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${contact.color}`}>
                  <contact.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{contact.label}</p>
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {contact.value}
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
          <div className="bg-background rounded-2xl border border-border p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ismingiz</label>
              <Input
                placeholder="Ism Familiya"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Telefon</label>
              <Input
                placeholder="+998 90 000 00 00"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Xabar</label>
              <textarea
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                rows={4}
                placeholder="Savolingizni yozing..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
              <Send className="w-4 h-4" />
              Yuborish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}