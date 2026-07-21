"use client";

import { useQuery } from "@apollo/client/react";
import { Star, Quote } from "lucide-react";
import { GET_PUBLIC_COMMENTS } from "@/lib/graphql/comment";

interface PublicComment {
  id: string;
  text: string;
  rating?: number;
  userName?: string;
  userImage?: string;
  createdAt: string;
}

export default function TestimonialsSection() {
  const { data, loading } = useQuery<{ getPublicComments: PublicComment[] }>(GET_PUBLIC_COMMENTS);
  const comments = data?.getPublicComments ?? [];

  if (!loading && comments.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            O'quvchilar fikri
          </h2>
          <p className="text-muted-foreground">
            Platformamiz haqida haqiqiy foydalanuvchilar nima deydi
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comments.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="bg-background rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <Quote className="w-7 h-7 text-primary/20 mb-3" />

                {typeof c.rating === "number" && (
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < c.rating! ? "fill-accent text-accent" : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                  "{c.text}"
                </p>

                <div className="flex items-center gap-2.5 pt-3 border-t border-border/60">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden">
                    {c.userImage ? (
                      <img src={c.userImage} alt={c.userName ?? ""} className="w-full h-full object-cover" />
                    ) : (
                      (c.userName?.[0] ?? "U").toUpperCase()
                    )}
                  </div>
                  <p className="text-xs font-semibold">{c.userName ?? "Foydalanuvchi"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
