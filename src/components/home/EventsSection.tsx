"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { CalendarDays, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { GET_EVENTS } from "@/lib/graphql/content";
import { cn } from "@/lib/utils";

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

const DURATION = 3000;
const TICK = 16;

function EventCard({ event, active }: { event: Event; active: boolean }) {
  return (
    <div
      className={cn(
        "w-full rounded-3xl overflow-hidden relative shadow-md",
        active && "shadow-xl"
      )}
      style={{ aspectRatio: "3/4" }}
    >
      {event.contentImage ? (
        <img
          src={imgSrc(event.contentImage)}
          alt={event.contentTitle}
          className="w-full h-full object-cover"
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
        {active && event.contentVideo && (
          <a
            href={event.contentVideo}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
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

function SideCard({
  event,
  onClick,
  sizeClass,
  dimClass,
}: {
  event: Event;
  onClick: () => void;
  sizeClass: string;
  dimClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn("group relative shrink-0", sizeClass)}
      aria-label={event.contentTitle || "Boshqa e'lon"}
    >
      <EventCard event={event} active={false} />
      <div className={cn("absolute inset-0 rounded-3xl pointer-events-none transition-colors duration-300", dimClass)} />
    </button>
  );
}

export default function EventsSection() {
  const { data, loading } = useQuery<EventsData>(GET_EVENTS);
  const events: Event[] = data?.getEvents ?? [];
  const hasMultiple = events.length > 1;

  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = (index: number) => {
    const len = events.length;
    if (len === 0) return;
    setActive(((index % len) + len) % len);
    setProgress(0);
  };

  // Progress bar avtomatik to'lib, DURATION tugaganda keyingi cardga o'tadi
  useEffect(() => {
    if (paused || !hasMultiple) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + (TICK / DURATION) * 100;
        if (next >= 100) {
          setActive((a) => (a + 1) % events.length);
          return 0;
        }
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [paused, hasMultiple, events.length]);

  if (!loading && events.length === 0) return null;

  const leftIndex = (active - 1 + events.length) % events.length;
  const rightIndex = (active + 1) % events.length;
  const farLeftIndex = (active - 2 + events.length) % events.length;
  const farRightIndex = (active + 2) % events.length;
  const showNear = events.length >= 3;
  const showFar = events.length >= 5;

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

          {hasMultiple && (
            <div className="hidden sm:flex gap-2 absolute right-0 top-0">
              <button onClick={() => goTo(active - 1)} className="w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors shadow-sm" aria-label="Oldingi">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => goTo(active + 1)} className="w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors shadow-sm" aria-label="Keyingi">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="flex justify-center">
            <div className="w-[72vw] sm:w-64 md:w-80 rounded-3xl bg-muted animate-pulse" style={{ aspectRatio: "3/4" }} />
          </div>
        ) : (
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
              {showFar && (
                <SideCard
                  event={events[farLeftIndex]}
                  onClick={() => goTo(farLeftIndex)}
                  sizeClass="hidden lg:block w-24 xl:w-50"
                  dimClass="bg-black/55 group-hover:bg-black/35"
                />
              )}

              {showNear && (
                <SideCard
                  event={events[leftIndex]}
                  onClick={() => goTo(leftIndex)}
                  sizeClass="hidden sm:block w-40 md:w-64"
                  dimClass="bg-black/40 group-hover:bg-black/20"
                />
              )}

              <div className="shrink-0 z-10 w-[72vw] sm:w-64 md:w-72 xl:w-80">
                <EventCard event={events[active]} active />
                {hasMultiple && (
                  <div className="mt-3 w-full h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>

              {showNear && (
                <SideCard
                  event={events[rightIndex]}
                  onClick={() => goTo(rightIndex)}
                  sizeClass="hidden sm:block w-40 md:w-64"
                  dimClass="bg-black/40 group-hover:bg-black/20"
                />
              )}

              {showFar && (
                <SideCard
                  event={events[farRightIndex]}
                  onClick={() => goTo(farRightIndex)}
                  sizeClass="hidden lg:block w-24 xl:w-50"
                  dimClass="bg-black/55 group-hover:bg-black/35"
                />
              )}
            </div>

            {/* Dots */}
            {hasMultiple && (
              <div className="flex justify-center gap-2 mt-6">
                {events.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === active ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`${i + 1}-slayd`}
                  />
                ))}
              </div>
            )}

            {/* Mobile prev/next */}
            {hasMultiple && (
              <div className="flex sm:hidden justify-center gap-3 mt-4">
                <button onClick={() => goTo(active - 1)} className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => goTo(active + 1)} className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-8 flex justify-center">
          <a
            href="https://t.me/QabulAdmin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#2AABEE] hover:bg-[#229ED9] px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            Admin bilan bog'lanish
          </a>
        </div>
      </div>
    </section>
  );
}
