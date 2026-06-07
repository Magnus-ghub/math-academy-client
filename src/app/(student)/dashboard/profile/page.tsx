"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Camera, Save, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GET_ME } from "@/lib/graphql/user";
import { UPDATE_USER } from "@/lib/graphql/user";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";

export default function ProfilePage() {
  const { updateUser } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    userName: "",
    userLastName: "",
    userPhone: "",
    userAddress: "",
    userDesc: "",
  });

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
    onError: () => {
      toast.error("Xatolik yuz berdi");
    },
  });

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

  if (loading) {
    return (
      <div className="max-w-lg">
        <div className="bg-muted rounded-2xl h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profilim</h1>
        <p className="text-muted-foreground text-sm">Ma'lumotlaringizni tahrirlang</p>
      </div>

      <div className="bg-background rounded-2xl border border-border p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="relative">
            {user?.userImage ? (
              <img
                src={user.userImage}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                {user?.userName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <p className="font-bold">{user?.userName || "Foydalanuvchi"}</p>
            <p className="text-sm text-muted-foreground">
              {user?.userAuthType === "TELEGRAM" ? "🔵 Telegram" : "🔴 Google"} orqali kirgan
            </p>
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

          {/* Telegram ID */}
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
              <>
                <CheckCircle className="w-4 h-4" />
                Saqlandi!
              </>
            ) : updating ? (
              "Saqlanmoqda..."
            ) : (
              <>
                <Save className="w-4 h-4" />
                Saqlash
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}