"use client";

import { useState } from "react";
import { Camera, Save } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const [form, setForm] = useState({
    userName: "",
    userLastName: "",
    userPhone: "",
  });

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
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              U
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <p className="font-bold">Foydalanuvchi</p>
            <p className="text-sm text-muted-foreground">🔵 Telegram orqali kirgan</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
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
          <div>
            <label className="text-sm font-medium mb-1.5 block">Telefon</label>
            <Input
              placeholder="+998 90 000 00 00"
              value={form.userPhone}
              onChange={(e) => setForm({ ...form, userPhone: e.target.value })}
            />
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors">
            <Save className="w-4 h-4" />
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}