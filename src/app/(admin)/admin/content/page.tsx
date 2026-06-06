"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";

const typeLabels: Record<string, string> = {
  SUCCESS_STORY: "Muvaffaqiyat",
  TEACHER: "O'qituvchi",
  EVENT: "Tadbir",
  NEWS: "Yangilik",
  FAQ: "FAQ",
  BANNER: "Banner",
};

const typeColors: Record<string, string> = {
  SUCCESS_STORY: "bg-green-100 text-green-700",
  TEACHER: "bg-blue-100 text-blue-700",
  EVENT: "bg-accent/10 text-accent",
  NEWS: "bg-purple-100 text-purple-700",
  FAQ: "bg-gray-100 text-gray-700",
  BANNER: "bg-primary/10 text-primary",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Qoralama",
  PUBLISHED: "Nashr",
  ARCHIVED: "Arxiv",
};

const mockContents = Array.from({ length: 12 }, (_, i) => ({
  id: `content-${i + 1}`,
  title: `Kontent ${i + 1}`,
  contentType: Object.keys(typeLabels)[i % 6],
  contentStatus: ["PUBLISHED", "DRAFT", "ARCHIVED"][i % 3],
  viewCount: i * 23,
  createdAt: new Date(2026, 0, i + 1).toLocaleDateString("uz-UZ"),
}));

export default function AdminContentPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = mockContents.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || c.contentType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kontent</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} ta kontent</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Yangi kontent
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Kontent nomi bo'yicha..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", ...Object.keys(typeLabels)].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === type
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type === "ALL" ? "Barchasi" : typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((content) => (
          <div key={content.id} className="bg-background rounded-2xl border border-border p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[content.contentType]}`}>
                {typeLabels[content.contentType]}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[content.contentStatus]}`}>
                {statusLabels[content.contentStatus]}
              </span>
            </div>
            <h3 className="font-semibold text-sm mb-3">{content.title}</h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {content.viewCount} ko'rishlar
              </div>
              <span>{content.createdAt}</span>
            </div>
            <div className="flex gap-2 pt-3 border-t border-border">
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                <Pencil className="w-3 h-3" />
                Tahrirlash
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors">
                <Trash2 className="w-3 h-3" />
                O'chirish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}