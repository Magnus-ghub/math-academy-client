"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Search, CheckCircle, XCircle, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  GET_PENDING_COMMENTS,
  APPROVE_COMMENT,
  REJECT_COMMENT,
} from "@/lib/graphql/comment";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};

export default function AdminCommentsPage() {
  const [search, setSearch] = useState("");

  const { data, loading, refetch } = useQuery<{ getPendingComments: any[] }>(
    GET_PENDING_COMMENTS
  );
  const comments = data?.getPendingComments || [];

  const [approveComment] = useMutation(APPROVE_COMMENT, {
    onCompleted: () => {
      toast.success("Izoh tasdiqlandi");
      refetch();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const [rejectComment] = useMutation(REJECT_COMMENT, {
    onCompleted: () => {
      toast.success("Izoh rad etildi");
      refetch();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const filtered = comments.filter((c) =>
    c.text.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Izohlar</h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} ta kutilmoqda
          </p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Izoh bo'yicha qidirish..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <p>Kutilayotgan izohlar yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment: any) => (
            <div
              key={comment.id}
              className="bg-background rounded-2xl border border-border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      U
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (comment.rating || 0)
                              ? "fill-accent text-accent"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(comment.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "{comment.text}"
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[comment.commentStatus]}`}>
                      {statusLabels[comment.commentStatus]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {comment.commentType === "TEST" ? "Test izohi" : "Umumiy"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => approveComment({ variables: { commentId: comment.id } })}
                    className="p-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rejectComment({ variables: { commentId: comment.id } })}
                    className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}