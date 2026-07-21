"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Star, CheckCircle2, X } from "lucide-react";
import { CREATE_COMMENT } from "@/lib/graphql/comment";

const STORAGE_KEY = "platform_review_submitted";

export function ReviewPrompt() {
  const [visible, setVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    setVisible(!localStorage.getItem(STORAGE_KEY));
  }, []);

  const [createComment, { loading }] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      setSubmitted(true);
      localStorage.setItem(STORAGE_KEY, "1");
    },
  });

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    createComment({
      variables: { input: { commentType: "GENERAL", rating, text: text.trim() || "—" } },
    });
  };

  if (submitted) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm font-medium">
          Rahmat! Fikringiz tasdiqlangach saytda ko'rinadi.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-2xl p-5 mb-6 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Yopish"
      >
        <X className="w-4 h-4" />
      </button>

      <p className="font-bold text-sm mb-1">Platformani baholang</p>
      <p className="text-xs text-muted-foreground mb-3 pr-6">
        Fikringiz bizga muhim — boshqa o'quvchilarga yordam bering
      </p>

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(n)}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                n <= (hoverRating || rating) ? "fill-accent text-accent" : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Fikringizni yozing (ixtiyoriy)..."
        rows={2}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background resize-none mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={rating === 0 || loading}
        className="bg-primary text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Yuborilmoqda..." : "Yuborish"}
      </button>
    </div>
  );
}
