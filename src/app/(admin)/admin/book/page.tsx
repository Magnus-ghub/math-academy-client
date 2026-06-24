"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Trash2, Save, Upload, Loader2, BookMarked, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GET_BOOK, CREATE_CONTENT, UPDATE_CONTENT_FULL } from "@/lib/graphql/content";
import { useAuthStore } from "@/lib/store/auth.store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";
const imgSrc = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};

interface Store {
  name: string;
  address: string;
  phone: string;
}

export default function AdminBookPage() {
  const { accessToken } = useAuthStore();
  const [bookId, setBookId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    contentTitle: "",
    contentDesc: "",
    contentImage: "",
    price: "",
    year: "",
    published: false,
  });

  const [stores, setStores] = useState<Store[]>([
    { name: "", address: "", phone: "" },
  ]);

  const { data, loading } = useQuery<{ getBook: any }>(GET_BOOK, { fetchPolicy: "network-only" });

  useEffect(() => {
    const book = data?.getBook;
    if (!book) return;
    setBookId(book.id);
    setForm({
      contentTitle: book.contentTitle ?? "",
      contentDesc: book.contentDesc ?? "",
      contentImage: book.contentImage ?? "",
      price: "",
      year: "",
      published: book.contentStatus === "PUBLISHED",
    });
    if (book.metaJson) {
      try {
        const meta = JSON.parse(book.metaJson);
        setForm((f) => ({ ...f, price: meta.price ?? "", year: meta.year ?? "" }));
        if (Array.isArray(meta.stores) && meta.stores.length > 0) {
          setStores(meta.stores);
        }
      } catch {}
    }
  }, [data]);

  const [createContent] = useMutation<{ createContent: { id: string | null } }>(CREATE_CONTENT);
  const [updateContent] = useMutation(UPDATE_CONTENT_FULL);

  const uploadImage = async (file: File) => {
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, contentImage: data.url }));
      else toast.error("Rasm yuklanmadi");
    } catch {
      toast.error("Rasm yuklanmadi");
    } finally {
      setImgUploading(false);
    }
  };

  const handleSave = async (publish?: boolean) => {
    if (!form.contentTitle.trim()) {
      toast.error("Kitob nomini kiriting");
      return;
    }

    setSaving(true);
    try {
      const metaJson = JSON.stringify({
        price: form.price,
        year: form.year,
        stores: stores.filter((s) => s.name.trim()),
      });

      const targetStatus = publish !== undefined
        ? (publish ? "PUBLISHED" : "DRAFT")
        : (form.published ? "PUBLISHED" : "DRAFT");

      const baseFields = {
        contentTitle: form.contentTitle,
        contentDesc: form.contentDesc || undefined,
        contentImage: form.contentImage || undefined,
        metaJson,
      };

      if (bookId) {
        await updateContent({
          variables: {
            contentId: bookId,
            input: { ...baseFields, contentStatus: targetStatus },
          },
        });
        toast.success("Kitob ma'lumotlari saqlandi");
      } else {
        const res = await createContent({
          variables: {
            input: { ...baseFields, contentType: "BOOK" },
          },
        });
        const newId = res.data?.createContent?.id;
        setBookId(newId ?? null);
        // Status ni alohida update qilamiz (nashr yoki qoralama)
        if (newId && targetStatus === "PUBLISHED") {
          await updateContent({
            variables: {
              contentId: newId,
              input: { contentStatus: "PUBLISHED" },
            },
          });
        }
        toast.success("Kitob yaratildi");
      }

      if (publish !== undefined) {
        setForm((f) => ({ ...f, published: publish }));
      }
    } catch {
      toast.error("Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const addStore = () =>
    setStores([...stores, { name: "", address: "", phone: "" }]);

  const removeStore = (i: number) =>
    setStores(stores.filter((_, idx) => idx !== i));

  const updateStore = (i: number, field: keyof Store, value: string) =>
    setStores(stores.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Kitob ma'lumotlari</h1>
            <p className="text-xs text-muted-foreground">
              {form.published ? (
                <span className="text-green-600 font-medium">Saytda ko'rinmoqda</span>
              ) : (
                <span className="text-orange-500 font-medium">Qoralama — saytda ko'rinmaydi</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Saqlash
          </button>
          {!form.published ? (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              Nashr etish
            </button>
          ) : (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-40 transition-colors"
            >
              Yashirish
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Book cover */}
        <div className="bg-background rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-sm mb-4">Kitob muqovasi</h2>
          <div className="flex items-start gap-4">
            {form.contentImage ? (
              <div className="relative shrink-0">
                <img
                  src={imgSrc(form.contentImage)}
                  alt="kitob muqovasi"
                  className="w-28 h-40 object-cover rounded-xl border border-border"
                />
                <button
                  onClick={() => setForm((f) => ({ ...f, contentImage: "" }))}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => imgRef.current?.click()}
                disabled={imgUploading}
                className="w-28 h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 shrink-0"
              >
                {imgUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Rasm yuklash
                  </>
                )}
              </button>
            )}
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Kitob nomi *</label>
                <Input
                  placeholder="Masalan: DTM Matematika 2025"
                  value={form.contentTitle}
                  onChange={(e) => setForm({ ...form, contentTitle: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Narxi</label>
                  <Input
                    placeholder="85 000 so'm"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Yili</label>
                  <Input
                    placeholder="2025"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <input
            ref={imgRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f);
              e.target.value = "";
            }}
          />
        </div>

        {/* Description */}
        <div className="bg-background rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-sm mb-3">Tavsif</h2>
          <textarea
            className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={4}
            placeholder="Kitob haqida qisqacha ma'lumot..."
            value={form.contentDesc}
            onChange={(e) => setForm({ ...form, contentDesc: e.target.value })}
          />
        </div>

        {/* Stores */}
        <div className="bg-background rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Savdo markazlari</h2>
            <button
              onClick={addStore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Qo'shish
            </button>
          </div>

          <div className="space-y-3">
            {stores.map((store, i) => (
              <div key={i} className="bg-muted/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-primary">{i + 1}-savdo markazi</span>
                  {stores.length > 1 && (
                    <button
                      onClick={() => removeStore(i)}
                      className="p-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Savdo markazi nomi"
                  value={store.name}
                  onChange={(e) => updateStore(i, "name", e.target.value)}
                />
                <Input
                  placeholder="Manzil (tuman, ko'cha...)"
                  value={store.address}
                  onChange={(e) => updateStore(i, "address", e.target.value)}
                />
                <Input
                  placeholder="+998 90 123 45 67"
                  value={store.phone}
                  onChange={(e) => updateStore(i, "phone", e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-2xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Saqlash
        </button>
      </div>
    </div>
  );
}
