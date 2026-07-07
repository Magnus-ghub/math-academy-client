"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { ChevronLeft, ChevronRight, Trophy, Award } from "lucide-react";
import { GET_SUCCESS_STORIES } from "@/lib/graphql/content";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const imgSrc = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

interface Story {
  id: string;
  contentTitle: string;
  contentDesc: string;
  contentImage: string;
}

export default function SuccessStoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, loading } = useQuery<{ getSuccessStories: Story[] }>(GET_SUCCESS_STORIES);
  const stories: Story[] = data?.getSuccessStories ?? [];
  const canLoop = stories.length > 2;
  const renderedStories = canLoop ? [...stories, ...stories] : stories;

  // Uzluksiz avtomatik aylanish (marquee)
  useEffect(() => {
    if (!canLoop) return;
    const el = scrollRef.current;
    if (!el) return;
    let frame: number;
    const step = () => {
      if (!pausedRef.current) {
        el.scrollLeft += 0.6;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [canLoop, stories.length]);

  const pauseThenResume = () => {
    pausedRef.current = true;
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      pausedRef.current = false;
    }, 2500);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    pauseThenResume();
    const cardWidth = el.querySelector("div")?.offsetWidth ?? 320;
    el.scrollBy({ left: dir === "right" ? cardWidth + 16 : -(cardWidth + 16), behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            Muvaffaqiyatli o'quvchilar
          </h2>
          <p className="text-muted-foreground">
            O'quvchilarimizning haqiqiy sertifikatlari
          </p>

          {/* Arrows — top-right */}
          {stories.length > 0 && (
            <div className="hidden sm:flex gap-2 absolute right-0 top-0">
              <button
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors shadow-sm"
                aria-label="Oldingi"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors shadow-sm"
                aria-label="Keyingi"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="shrink-0 w-56 md:w-64 rounded-2xl bg-muted animate-pulse" style={{ aspectRatio: "210/297" }} />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Hozircha natijalar yo'q</p>
          </div>
        ) : (
          <>
            <div
              ref={scrollRef}
              onMouseEnter={() => (pausedRef.current = true)}
              onMouseLeave={() => (pausedRef.current = false)}
              onTouchStart={() => (pausedRef.current = true)}
              onTouchEnd={pauseThenResume}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
              style={{
                scrollSnapType: canLoop ? undefined : "x mandatory",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {renderedStories.map((story, i) => (
                <div
                  key={`${story.id}-${i}`}
                  className="shrink-0 w-[72vw] sm:w-56 md:w-64 group"
                  style={{ scrollSnapAlign: canLoop ? undefined : "start" }}
                >
                  {/* A4 certificate image */}
                  <div
                    className="relative w-full rounded-2xl overflow-hidden bg-muted border border-border shadow-md group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300"
                    style={{ aspectRatio: "210/297" }}
                  >
                    {story.contentImage ? (
                      <img
                        src={imgSrc(story.contentImage)}
                        alt={story.contentTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Award className="w-16 h-16 text-muted-foreground/20" />
                      </div>
                    )}

                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 to-transparent" />

                    {/* Name + desc over image */}
                    <div className="absolute bottom-0 inset-x-0 p-3">
                      <p className="text-white font-bold text-sm leading-tight truncate">
                        {story.contentTitle}
                      </p>
                      {story.contentDesc && (
                        <p className="text-white/75 text-xs mt-0.5 truncate">
                          {story.contentDesc}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile arrows */}
            <div className="flex sm:hidden justify-center gap-3 mt-4">
              <button
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border border-border bg-background flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
