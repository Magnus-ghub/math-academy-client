"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client/react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { GET_FAQS } from "@/lib/graphql/content";

interface FAQ {
  id: string;
  contentTitle: string;
  contentDesc: string;
}

export default function FAQSection() {
  const [open, setOpen] = useState<string | null>(null);

  const { data, loading } = useQuery<{ getFaqs: FAQ[] }>(GET_FAQS);
  const faqs: FAQ[] = data?.getFaqs ?? [];

  if (!loading && faqs.length === 0) return null;

  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Ko'p so'raladigan savollar
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Javob topa olmadingizmi? Telegram kanalimizga yozing
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-2xl bg-muted animate-pulse" />
              ))
            : faqs.map((faq) => {
                const isOpen = open === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen ? "border-primary/30 bg-primary/5" : "border-border bg-background"
                    }`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className={`w-4 h-4 shrink-0 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="font-semibold text-sm">{faq.contentTitle}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-4 pl-12">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {faq.contentDesc}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/60 border border-border rounded-2xl px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Savolingiz qoldimi?</p>
              <p className="text-xs text-muted-foreground">Biz bilan bog'laning, javob beramiz</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="shrink-0 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Bog'lanish
          </Link>
        </div>
      </div>
    </section>
  );
}
