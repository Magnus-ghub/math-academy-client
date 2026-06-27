"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Camera, Save, CheckCircle, Eye, EyeOff, Lock, Mail, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GET_ME, UPDATE_USER } from "@/lib/graphql/user";
import { CHANGE_PASSWORD } from "@/lib/graphql/auth";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

function authTypeLabel(type: string) {
  if (type === "TELEGRAM") return "🔵 Telegram";
  if (type === "GOOGLE") return "🔴 Google";
  if (type === "EMAIL") return "📧 Email";
  return type;
}

export default function ProfilePage() {
  const { updateUser, accessToken } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    userName: "",
    userLastName: "",
    userPhone: "",
    userAddress: "",
    userDesc: "",
  });

  // Parol o'zgartirish holati
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });

  const { data, loading } = useQuery<{ getMe: any }>(GET_ME);
  const user = data?.getMe;

  useEffect(() => {
    if (user) {
      setForm({
        userName: user.userName || "",
        userLastName: user.userLastName || "",
        userPhone: user.userPhone || "",
        userAddress: user.userAddress || "",
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

  const [changePassword, { loading: changingPw }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      toast.success("Parol muvaffaqiyatli o'zgartirildi!");
      setPwForm({ current: "", newPw: "", confirm: "" });
      setShowPasswordSection(false);
    },
    onError: (err: any) => {
      const msg = err.graphQLErrors?.[0]?.message;
      toast.error(msg ?? "Parolni o'zgartirishda xatolik");
    },
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
          userAddress: form.userAddress || undefined,
          userDesc: form.userDesc || undefined,
        },
      },
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("Parollar bir xil emas");
      return;
    }
    changePassword({
      variables: {
        newPassword: pwForm.newPw,
        currentPassword: user?.hasPassword ? pwForm.current : undefined,
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

          <div>
            <label className="text-sm font-medium mb-1.5 block">Manzil</label>
            <Input
              placeholder="Shahar, tuman"
              value={form.userAddress}
              onChange={(e) => setForm({ ...form, userAddress: e.target.value })}
            />
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

      {/* Password section — faqat email mavjud bo'lsa ko'rsatish */}
      {user?.userEmail && (
        <div className="bg-background rounded-2xl border border-border p-6">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">
                {user?.hasPassword ? "Parolni o'zgartirish" : "Parol o'rnatish"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {showPasswordSection ? "Yopish ↑" : "Ochish ↓"}
            </span>
          </button>

          {showPasswordSection && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3 pt-4 border-t border-border">
              {user?.hasPassword && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Joriy parol</label>
                  <div className="relative">
                    <input
                      type={showPw.current ? "text" : "password"}
                      value={pwForm.current}
                      onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                      placeholder="Joriy parolingiz"
                      className="w-full border border-border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                      required
                    />
                    <button type="button" onClick={() => setShowPw({ ...showPw, current: !showPw.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block">Yangi parol</label>
                <div className="relative">
                  <input
                    type={showPw.newPw ? "text" : "password"}
                    value={pwForm.newPw}
                    onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                    placeholder="Kamida 6 ta belgi"
                    className="w-full border border-border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    required
                    minLength={6}
                  />
                  <button type="button" onClick={() => setShowPw({ ...showPw, newPw: !showPw.newPw })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw.newPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Yangi parolni tasdiqlang</label>
                <div className="relative">
                  <input
                    type={showPw.confirm ? "text" : "password"}
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    placeholder="Qayta kiriting"
                    className="w-full border border-border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    required
                  />
                  <button type="button" onClick={() => setShowPw({ ...showPw, confirm: !showPw.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                  <p className="text-xs text-red-500 mt-1">Parollar bir xil emas</p>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPw || (pwForm.newPw !== pwForm.confirm) || pwForm.newPw.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                <Lock className="w-4 h-4" />
                {changingPw ? "Saqlanmoqda..." : user?.hasPassword ? "Parolni o'zgartirish" : "Parol o'rnatish"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
