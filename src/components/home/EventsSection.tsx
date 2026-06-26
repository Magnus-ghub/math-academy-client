"use client";

import { useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { CalendarDays, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { GET_EVENTS } from "@/lib/graphql/content";

interface Event {
  id: string;
  contentTitle: string;
  contentDesc: string;
  contentImage: string;
  contentVideo: string;
  publishedAt: string;
  createdAt: string;
}

interface EventsData {
  getEvents: Event[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";
const imgSrc = (path?: string | null) =>
  !path ? "" : path.startsWith("http") ? path : `${API_BASE}${path}`;

function EventCard({ event }: { event: Event }) {
  return (
    <div
      className="shrink-0 w-[72vw] sm:w-72 md:w-80 rounded-3xl overflow-hidden relative group shadow-md hover:shadow-xl transition-shadow duration-500"
      style={{ aspectRatio: "3/4", scrollSnapAlign: "start" }}
    >
      {event.contentImage ? (
        <img
          src={imgSrc(event.contentImage)}
          alt={event.contentTitle}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
        />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <CalendarDays className="w-20 h-20 text-primary/30" />
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col gap-2.5">
        {event.contentTitle && (
          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">
            {event.contentTitle}
          </h3>
        )}
        {event.contentVideo && (
          <a
            href={event.contentVideo}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start inline-flex items-center gap-1.5 bg-white text-primary text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors duration-200 shadow"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Bog'lanish
          </a>
        )}
      </div>
    </div>
  );
}

export default function EventsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, loading } = useQuery<EventsData>(GET_EVENTS);
  const events: Event[] = data?.getEvents ?? [];

  if (!loading && events.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("div[style]");
    const step = (card?.offsetWidth ?? 300) + 20;
    el.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" });
  };

  return (
    <section id="events" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 relative">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">
            Kurslar va e'lonlar
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto hidden sm:block">
            Akademiyaning so'nggi kurs e'lonlari va yangiliklari
          </p>

          {events.length > 0 && (
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
          <div className="flex gap-5 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shrink-0 w-72 md:w-80 rounded-3xl bg-muted animate-pulse" style={{ aspectRatio: "3/4" }} />
            ))}
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              className="flex gap-4 md:gap-5 overflow-x-auto pb-2"
              style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
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

        {/* Footer CTA */}
        <div className="mt-8 flex justify-center">
          <a
            href="https://t.me/saidxonov_academy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary border border-border hover:border-primary/40 px-5 py-2.5 rounded-xl transition-colors duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            Admin bilan bog'lanish
          </a>
        </div>
      </div>
    </section>
  );
}
