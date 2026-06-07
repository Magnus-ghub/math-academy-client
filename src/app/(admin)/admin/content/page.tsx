"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GET_ALL_CONTENT, DELETE_CONTENT, UPDATE_CONTENT } from "@/lib/graphql/content";

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

export default function AdminContentPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const { data, loading, refetch } = useQuery<{ getAllContent: any[] }>(GET_ALL_CONTENT);
  const contents = data?.getAllContent || [];

  const [deleteContent] = useMutation(DELETE_CONTENT, {
    onCompleted: () => {
      toast.success("Kontent o'chirildi");
      refetch();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const [updateContent] = useMutation(UPDATE_CONTENT, {
    onCompleted: () => {
      toast.success("Holat yangilandi");
      refetch();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const filtered = contents.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || c.contentType === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-48 animate-pulse" />
        ))}
      </div>
    );
  }

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

      {filtered.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <p>Kontent topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((content: any) => (
            <div key={content.id} className="bg-background rounded-2xl border border-border p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[content.contentType]}`}>
                  {typeLabels[content.contentType]}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[content.contentStatus]}`}>
                  {statusLabels[content.contentStatus]}
                </span>
              </div>

              {content.contentImage && (
                <img
                  src={content.contentImage}
                  alt={content.title}
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
              )}

              <h3 className="font-semibold text-sm mb-3">{content.title}</h3>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {content.viewCount} ko'rish
                </div>
                <span>{new Date(content.createdAt).toLocaleDateString("uz-UZ")}</span>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => updateContent({
                    variables: {
                      contentId: content.id,
                      input: {
                        contentStatus: content.contentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                      },
                    },
                  })}
                  className="flex-1 text-xs py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
                >
                  {content.contentStatus === "PUBLISHED" ? "Yashirish" : "Nashr qilish"}
                </button>
                <button
                  onClick={() => deleteContent({ variables: { contentId: content.id } })}
                  className="flex-1 text-xs py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium transition-colors"
                >
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}