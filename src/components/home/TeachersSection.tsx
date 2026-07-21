"use client";

import { useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { ChevronLeft, ChevronRight, UserCircle, Star } from "lucide-react";
import { GET_TEACHERS } from "@/lib/graphql/content";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const imgSrc = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

interface Teacher {
  id: string;
  contentTitle: string;
  contentDesc: string;
  contentImage: string;
}

export default function TeachersSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, loading } = useQuery<{ getTeachers: Teacher[] }>(GET_TEACHERS);
  const teachers: Teacher[] = data?.getTeachers ?? [];

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("div")?.offsetWidth ?? 260;
    el.scrollBy({ left: dir === "right" ? cardWidth + 24 : -(cardWidth + 24), behavior: "smooth" });
  };

  if (!loading && teachers.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O'qituvchilarimiz
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tajribali va malakali o'qituvchilar jamoasi
          </p>

          {/* Desktop arrows */}
          {teachers.length > 0 && (
            <div className="hidden sm:flex gap-2 absolute right-0 top-0">
              <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors shadow-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors shadow-sm">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shrink-0 w-64 rounded-2xl bg-muted animate-pulse" style={{ height: 320 }} />
            ))}
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible"
              style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {teachers.map((teacher) => {
                const lines = (teacher.contentDesc ?? "").split("\n").map(l => l.trim()).filter(Boolean);
                const role = lines[0] ?? "";
                const subject = lines[1] ?? "";
                const stat = lines[2] ?? "";

                return (
                  <div
                    key={teacher.id}
                    className="shrink-0 w-[72vw] sm:w-64 md:w-auto group bg-background rounded-3xl border border-border/60 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/30 transition-all duration-300"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    {/* Image */}
                    <div className="relative w-full aspect-4/5 bg-muted overflow-hidden">
                      {teacher.contentImage ? (
                        <img
                          src={imgSrc(teacher.contentImage)}
                          alt={teacher.contentTitle}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserCircle className="w-20 h-20 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/15 to-transparent pointer-events-none" />
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-1.5">{teacher.contentTitle}</h3>
                      {role && (
                        <span className="inline-block bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                          {role}
                        </span>
                      )}
                      {subject && <p className="text-muted-foreground text-xs mb-3">{subject}</p>}
                      {stat && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary border-t border-border/60 pt-3">
                          <Star className="w-3 h-3 fill-primary shrink-0" />
                          {stat}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile arrows */}
            <div className="flex sm:hidden justify-center gap-3 mt-4">
              <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
