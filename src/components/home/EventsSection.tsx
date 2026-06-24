"use client";

import { useQuery } from "@apollo/client/react";
import { CalendarDays, PlayCircle, ArrowUpRight } from "lucide-react";
import { GET_EVENTS } from "@/lib/graphql/content";

interface EventsData {
  getEvents: Event[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const imgSrc = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

interface Event {
  id: string;
  contentTitle: string;
  contentDesc: string;
  contentImage: string;
  contentVideo: string;
  publishedAt: string;
  createdAt: string;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

function EventCard({ event }: { event: Event }) {
  const date = formatDate(event.publishedAt ?? event.createdAt);

  return (
    <div className="shrink-0 w-95 md:w-80 rounded-2xl overflow-hidden relative group cursor-pointer"
      style={{ aspectRatio: "4/3" }}>

      {/* Full image */}
      {event.contentImage ? (
        <img
          src={imgSrc(event.contentImage)}
          alt={event.contentTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <CalendarDays className="w-16 h-16 text-primary/30" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      {/* Video play overlay */}
      {event.contentVideo && (
        <a
          href={event.contentVideo}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
            <PlayCircle className="w-8 h-8 text-primary" />
          </div>
        </a>
      )}

      {/* Info overlay — bottom */}
      <div className="absolute bottom-0 inset-x-0 p-5">
        {/* Title */}
        <h3 className="text-white font-bold text-base leading-tight line-clamp-2 mb-2">
          {event.contentTitle}
        </h3>

        {/* Desc */}
        {event.contentDesc && (
          <p className="text-white/65 text-xs leading-relaxed line-clamp-2 mb-3">
            {event.contentDesc}
          </p>
        )}

        {/* Link */}
        {event.contentVideo && (
          <a
            href={event.contentVideo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white border border-white/30 hover:border-white/60 px-3 py-1.5 rounded-full transition-colors"
          >
            Videoni ko'rish
            <ArrowUpRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function EventsSection() {
  const { data, loading } = useQuery<EventsData>(GET_EVENTS);
  const events: Event[] = data?.getEvents ?? [];

  if (!loading && events.length === 0) return null;

  // Duplicate for seamless infinite loop
  const looped = events.length > 0 ? [...events, ...events, ...events] : [];
  // Speed: wider content = longer duration
  const duration = Math.max(20, events.length * 8);

  return (
    <section id="events" className="py-20 overflow-hidden">
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .marquee-track {
          animation: marquee-scroll ${duration}s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            So'nggi yangiliklar
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Akademiyadagi muhim tadbirlar va e'lonlar
          </p>
        </div>
      </div>

      {/* Marquee */}
      {loading ? (
        <div className="flex gap-4 px-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-72 md:w-80 rounded-2xl bg-muted animate-pulse"
              style={{ aspectRatio: "4/5" }}
            />
          ))}
        </div>
      ) : (
        /* Edge fade masks */
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-r from-background to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-l from-background to-transparent" />

          <div className="flex marquee-track gap-4 w-max px-4">
            {looped.map((event, i) => (
              <EventCard key={`${event.id}-${i}`} event={event} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
