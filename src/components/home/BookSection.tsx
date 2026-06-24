"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { MapPin, Phone, X, ShoppingBag, BookOpen, Star, CheckCircle2 } from "lucide-react";
import { GET_BOOK } from "@/lib/graphql/content";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";
const imgSrc = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

interface Store {
  name: string;
  address: string;
  phone: string;
}

interface Book {
  contentStatus: string;
  metaJson?: string | null;
  contentImage?: string | null;
  contentTitle: string;
  contentDesc?: string | null;
}

interface BookData {
  getBook: Book | null;
}

export default function BookSection() {
  const [showStores, setShowStores] = useState(false);

  const { data, loading } = useQuery<BookData>(GET_BOOK);
  const book = data?.getBook;

  if (loading || !book || book.contentStatus !== "PUBLISHED") return null;

  let meta: { price?: string; year?: string; stores?: Store[] } = {};
  try {
    meta = JSON.parse(book.metaJson ?? "{}");
  } catch {}

  const stores: Store[] = meta.stores?.filter((s: Store) => s.name) ?? [];

  return (
    <>
      <section className="relative py-24 overflow-hidden bg-linear-to-br from-primary via-primary to-primary/80">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-150 h-150 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-100 h-100 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section label */}
          <div className="flex justify-center mb-10">
            <span className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20">
              <BookOpen className="w-3.5 h-3.5" />
              Jamshid Saidxonov muallif kitobi
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-5xl mx-auto">
            {/* Book image */}
            <div className="shrink-0 flex items-center justify-center">
              <div className="relative">
                {/* glow */}
                <div className="absolute inset-0 blur-3xl bg-white/20 rounded-3xl scale-110 pointer-events-none" />
                {book.contentImage ? (
                  <img
                    src={imgSrc(book.contentImage)}
                    alt={book.contentTitle}
                    className="relative w-110 md:w-105 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] object-cover"
                    style={{ aspectRatio: "4/4" }}
                  />
                ) : (
                  <div
                    className="relative w-56 md:w-72 rounded-2xl bg-white/10 flex items-center justify-center"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <BookOpen className="w-20 h-20 text-white/30" />
                  </div>
                )}
                {/* Stars badge */}
                <div className="absolute -bottom-4 -right-4 bg-accent text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  Yangi kitob
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-white flex-1 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
                {book.contentTitle}
              </h2>

              {book.contentDesc && (
                <ul className="mb-8 space-y-2.5 text-left">
                  {book.contentDesc
                    .split("\n")
                    .map((line: string) => line.trim())
                    .filter((line: string) => line.length > 0)
                    .map((line: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-white/85 text-base">
                        <CheckCircle2 className="w-5 h-5 text-white/50 shrink-0 mt-0.5" />
                        {line}
                      </li>
                    ))}
                </ul>
              )}

              {/* Price + CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                {meta.price && (
                  <div className="bg-white/15 border border-white/25 rounded-2xl px-6 py-3 text-center">
                    <p className="text-xs text-white/60 mb-0.5">Narxi</p>
                    <p className="text-2xl font-black">{meta.price}</p>
                  </div>
                )}

                {stores.length > 0 && (
                  <button
                    onClick={() => setShowStores(true)}
                    className="flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-2xl text-sm hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Qayerdan sotib olish mumkin?
                  </button>
                )}
              </div>

              {meta.year && (
                <p className="mt-5 text-xs text-white/45">
                  Spectrum Nashriyoti · {meta.year}-yil
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stores modal */}
      {showStores && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-bold">Sotib olish joylari</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stores.length} ta savdo markazi
                </p>
              </div>
              <button
                onClick={() => setShowStores(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {stores.map((store, i) => (
                <div key={i} className="bg-muted/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="font-semibold text-sm">{store.name}</p>
                  </div>
                  {store.address && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2 pl-8">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {store.address}
                    </div>
                  )}
                  {store.phone && (
                    <a
                      href={`tel:${store.phone}`}
                      className="flex items-center gap-2 text-xs text-primary hover:underline pl-8 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {store.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <button
                onClick={() => setShowStores(false)}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
