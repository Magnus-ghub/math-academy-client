"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle, Star } from "lucide-react";
import { Input } from "@/components/ui/input";

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

const mockComments = Array.from({ length: 15 }, (_, i) => ({
  id: `comment-${i + 1}`,
  userName: `Foydalanuvchi ${i + 1}`,
  text: `Bu test juda yaxshi va foydali bo'ldi. ${i + 1}-sharh`,
  commentType: i % 2 === 0 ? "TEST" : "GENERAL",
  commentStatus: ["PENDING", "APPROVED", "REJECTED"][i % 3],
  rating: (i % 5) + 1,
  createdAt: new Date(2026, 0, i + 1).toLocaleDateString("uz-UZ"),
}));

export default function AdminCommentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  const filtered = mockComments.filter((c) => {
    const matchSearch = c.userName.toLowerCase().includes(search.toLowerCase()) ||
      c.text.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || c.commentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Izohlar</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} ta izoh</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Izoh yoki foydalanuvchi..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {status === "ALL" ? "Barchasi" : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((comment) => (
          <div key={comment.id} className="bg-background rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                    {comment.userName[0]}
                  </div>
                  <span className="font-medium text-sm">{comment.userName}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < comment.rating ? "fill-accent text-accent" : "text-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">{comment.createdAt}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{comment.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[comment.commentStatus]}`}>
                    {statusLabels[comment.commentStatus]}
                  </span>
                  <span className="text-xs text-muted-foreground">{comment.commentType === "TEST" ? "Test izohi" : "Umumiy"}</span>
                </div>
              </div>
              {comment.commentStatus === "PENDING" && (
                <div className="flex gap-2 shrink-0">
                  <button className="p-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}