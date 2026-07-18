"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Camera, Save, CheckCircle, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GET_ME, UPDATE_USER, GET_UZ_REGIONS } from "@/lib/graphql/user";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

function authTypeLabel(type: string) {
  if (type === "TELEGRAM") return "🔵 Telegram";
  if (type === "GOOGLE") return "🔴 Google";
  if (type === "EMAIL") return "📧 Email";
  return type;
}

const TOIFA_LABELS: Record<string, string> = {
  MUTAXASSIS: "Mutaxassis toifasi",
  IKKINCHI_TOIFA: "Ikkinchi toifa",
  BIRINCHI_TOIFA: "Birinchi toifa",
  OLIY_TOIFA: "Oliy toifa",
};

export default function ProfilePage() {
  const { updateUser, accessToken } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    userName: "",
    userLastName: "",
    userPhone: "",
    userRegion: "",
    userDistrict: "",
    userDesc: "",
  });

  const { data, loading } = useQuery<{ getMe: any }>(GET_ME);
  const user = data?.getMe;

  const { data: regionsData } = useQuery<{ getUzbekistanRegions: { code: string; name: string; districts: string[] }[] }>(
    GET_UZ_REGIONS
  );
  const regions = regionsData?.getUzbekistanRegions ?? [];
  const selectedRegion = regions.find((r) => r.name === form.userRegion);

  useEffect(() => {
    if (user) {
      setForm({
        userName: user.userName || "",
        userLastName: user.userLastName || "",
        userPhone: user.userPhone || "",
        userRegion: user.userRegion || "",
        userDistrict: user.userDistrict || "",
        userDesc: user.userDesc || "",
      });
    }
  }, [user]);

  const [updateUserMutation, { loading: updating }] = useMutation(UPDATE_USER, {
    onCompleted: (data: any) => {
      updateUser(data.updateUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.success("Profil saqlandi!");
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        await updateUserMutation({ variables: { input: { userImage: data.url } } });
      } else {
        toast.error("Rasm yuklanmadi");
      }
    } catch {
      toast.error("Rasm yuklashda xatolik");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    updateUserMutation({
      variables: {
        input: {
          userName: form.userName || undefined,
          userLastName: form.userLastName || undefined,
          userPhone: form.userPhone || undefined,
          userRegion: form.userRegion || undefined,
          userDistrict: form.userDistrict || undefined,
          userDesc: form.userDesc || undefined,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-lg">
        <div className="bg-muted rounded-2xl h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl font-bold">Profilim</h1>
        <p className="text-muted-foreground text-sm">Ma'lumotlaringizni tahrirlang</p>
      </div>

      {/* Main profile card */}
      <div className="bg-background rounded-2xl border border-border p-6">
        {/* Avatar + info */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="relative shrink-0">
            {user?.userImage ? (
              <img src={user.userImage} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {user?.userName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-60"
            >
              {uploadingImage ? (
                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
            </button>
          </div>
          <div className="min-w-0">
            <p className="font-bold">{user?.userName || "Foydalanuvchi"}</p>
            <p className="text-sm text-muted-foreground">
              {authTypeLabel(user?.userAuthType)} orqali kirgan
            </p>

            {/* Email */}
            {user?.userEmail && (
              <div className="flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{user.userEmail}</span>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-0.5">{user?.userRole}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ism</label>
              <Input
                placeholder="Ismingiz"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Familiya</label>
              <Input
                placeholder="Familiyangiz"
                value={form.userLastName}
                onChange={(e) => setForm({ ...form, userLastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Telefon</label>
            <Input
              placeholder="+998 90 000 00 00"
              value={form.userPhone}
              onChange={(e) => setForm({ ...form, userPhone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Viloyat</label>
              <select
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.userRegion}
                onChange={(e) =>
                  setForm({ ...form, userRegion: e.target.value, userDistrict: "" })
                }
              >
                <option value="">Tanlanmagan</option>
                {regions.map((r) => (
                  <option key={r.code} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Tuman</label>
              <select
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                value={form.userDistrict}
                onChange={(e) => setForm({ ...form, userDistrict: e.target.value })}
                disabled={!selectedRegion}
              >
                <option value="">Tanlanmagan</option>
                {selectedRegion?.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">O'zingiz haqingizda</label>
            <textarea
              className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={3}
              placeholder="Qisqacha ma'lumot..."
              value={form.userDesc}
              onChange={(e) => setForm({ ...form, userDesc: e.target.value })}
            />
          </div>

          {user?.telegramId && (
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-700">
                🔵 Telegram ID: <span className="font-mono font-bold">{user.telegramId}</span>
              </p>
            </div>
          )}

          {user?.teacherCategory && (
            <div className="p-3 bg-purple-50 rounded-xl">
              <p className="text-xs text-purple-700">
                🏅 Toifa: <span className="font-bold">{TOIFA_LABELS[user.teacherCategory] ?? user.teacherCategory}</span>
              </p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={updating}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            {saved ? (
              <><CheckCircle className="w-4 h-4" /> Saqlandi!</>
            ) : updating ? "Saqlanmoqda..." : (
              <><Save className="w-4 h-4" /> Saqlash</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
