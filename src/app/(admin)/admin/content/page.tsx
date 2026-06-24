"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Search, Eye, X, Loader2, ImageIcon, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GET_ALL_CONTENT, DELETE_CONTENT, UPDATE_CONTENT, CREATE_CONTENT, UPDATE_CONTENT_FULL } from "@/lib/graphql/content";
import { useAuthStore } from "@/lib/store/auth.store";
import ConfirmModal from "@/components/admin/ConfirmModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const imgSrc = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

const typeLabels: Record<string, string> = {
  SUCCESS_STORY: "Muvaffaqiyat",
  TEACHER: "O'qituvchi",
  EVENT: "Tadbir",
  NEWS: "Yangilik",
  FAQ: "FAQ",
  BANNER: "Banner",
  BOOK: "Kitob",
};

const typeColors: Record<string, string> = {
  SUCCESS_STORY: "bg-green-100 text-green-700",
  TEACHER: "bg-blue-100 text-blue-700",
  EVENT: "bg-accent/10 text-accent",
  NEWS: "bg-purple-100 text-purple-700",
  FAQ: "bg-gray-100 text-gray-700",
  BANNER: "bg-primary/10 text-primary",
  BOOK: "bg-orange-100 text-orange-700",
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

const CONTENT_TYPES = Object.entries(typeLabels).filter(([k]) => k !== "BOOK");

interface ContentForm {
  contentType: string;
  contentTitle: string;
  contentDesc: string;
  contentImage: string;
  contentVideo: string;
}

const defaultForm: ContentForm = {
  contentType: "SUCCESS_STORY",
  contentTitle: "",
  contentDesc: "",
  contentImage: "",
  contentVideo: "",
};

export default function AdminContentPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [form, setForm] = useState<ContentForm>(defaultForm);
  const [imgUploading, setImgUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const { accessToken } = useAuthStore();
  const { data, loading, refetch } = useQuery<{ getAllContent: any[] }>(GET_ALL_CONTENT);
  const contents = data?.getAllContent || [];

  const [deleteContent] = useMutation(DELETE_CONTENT, {
    onCompleted: () => { toast.success("Kontent o'chirildi"); refetch(); },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const [updateStatus] = useMutation(UPDATE_CONTENT, {
    onCompleted: () => { toast.success("Holat yangilandi"); refetch(); },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const [createContent] = useMutation(CREATE_CONTENT, {
    onError: () => toast.error("Saqlashda xatolik"),
  });

  const [updateContent] = useMutation(UPDATE_CONTENT_FULL, {
    onError: () => toast.error("Saqlashda xatolik"),
  });

  const filtered = contents.filter((c) => {
    const matchSearch = c.contentTitle.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || c.contentType === typeFilter;
    return matchSearch && matchType;
  });

  const openCreate = () => {
    setEditId(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (content: any) => {
    setEditId(content.id);
    setForm({
      contentType: content.contentType,
      contentTitle: content.contentTitle ?? "",
      contentDesc: content.contentDesc ?? "",
      contentImage: content.contentImage ?? "",
      contentVideo: content.contentVideo ?? "",
    });
    setShowModal(true);
  };

  const handleImageUpload = async (file: File) => {
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });
      const json = await res.json();
      if (json.url) setForm((f) => ({ ...f, contentImage: json.url }));
      else toast.error("Rasm yuklanmadi");
    } catch {
      toast.error("Rasm yuklanmadi");
    } finally {
      setImgUploading(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!form.contentTitle.trim()) { toast.error("Nomini kiriting"); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateContent({
          variables: {
            contentId: editId,
            input: {
              contentType: form.contentType,
              contentTitle: form.contentTitle.trim(),
              contentDesc: form.contentDesc.trim() || undefined,
              contentImage: form.contentImage || null,
              contentVideo: form.contentVideo.trim() || undefined,
            },
          },
        });
        toast.success("Kontent yangilandi");
      } else {
        const res = await createContent({
          variables: {
            input: {
              contentType: form.contentType,
              contentTitle: form.contentTitle.trim(),
              contentDesc: form.contentDesc.trim() || undefined,
              contentImage: form.contentImage || undefined,
              contentVideo: form.contentVideo.trim() || undefined,
            },
          },
        });
        const newId = res.data?.createContent?.id;
        if (publish && newId) {
          await updateStatus({ variables: { contentId: newId, input: { contentStatus: "PUBLISHED" } } });
        }
        toast.success(publish ? "Nashr qilindi" : "Qoralama saqlandi");
      }
      setShowModal(false);
      setForm(defaultForm);
      setEditId(null);
      refetch();
    } finally {
      setSaving(false);
    }
  };

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
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
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
                  src={imgSrc(content.contentImage)}
                  alt={content.contentTitle}
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
              )}

              <h3 className="font-semibold text-sm mb-1">{content.contentTitle}</h3>
              {content.contentDesc && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{content.contentDesc}</p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {content.viewCount} ko'rish
                </div>
                <span>{new Date(content.createdAt).toLocaleDateString("uz-UZ")}</span>
              </div>

              <div className="flex gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => openEdit(content)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Tahrir
                </button>
                <button
                  onClick={() => updateStatus({
                    variables: {
                      contentId: content.id,
                      input: { contentStatus: content.contentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
                    },
                  })}
                  className="flex-1 text-xs py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
                >
                  {content.contentStatus === "PUBLISHED" ? "Yashirish" : "Nashr qilish"}
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: content.id, title: content.contentTitle })}
                  className="px-3 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Kontentni o'chirish"
        description={`"${deleteTarget?.title}" o'chiriladi. Bu amalni qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        onConfirm={() => {
          if (deleteTarget) deleteContent({ variables: { contentId: deleteTarget.id } });
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h3 className="font-bold">{editId ? "Kontentni tahrirlash" : "Yangi kontent"}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Type */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Kontent turi</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setForm((f) => ({ ...f, contentType: key }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        form.contentType === key
                          ? "bg-primary text-white border-primary"
                          : "bg-muted border-transparent text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nomi *</label>
                <Input
                  placeholder="Kontent nomi..."
                  value={form.contentTitle}
                  onChange={(e) => setForm((f) => ({ ...f, contentTitle: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tavsif</label>
                <textarea
                  placeholder="Tavsif yozing..."
                  value={form.contentDesc}
                  onChange={(e) => setForm((f) => ({ ...f, contentDesc: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                />
              </div>

              {/* Image */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rasm</label>
                {form.contentImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={imgSrc(form.contentImage)} alt="preview" className="w-full h-40 object-cover" />
                    <button
                      onClick={() => setForm((f) => ({ ...f, contentImage: "" }))}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => imgInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors text-xs font-medium"
                    >
                      Almashtirish
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imgInputRef.current?.click()}
                    disabled={imgUploading}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {imgUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-xs font-medium">Rasm yuklash</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }}
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Video URL (ixtiyoriy)</label>
                <Input
                  placeholder="https://youtube.com/..."
                  value={form.contentVideo}
                  onChange={(e) => setForm((f) => ({ ...f, contentVideo: e.target.value }))}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-border shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="py-2.5 px-4 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Bekor
              </button>
              {editId ? (
                <button
                  onClick={() => handleSave()}
                  disabled={saving || imgUploading}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Saqlash
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving || imgUploading}
                    className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Qoralama
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving || imgUploading}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Nashr qilish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
