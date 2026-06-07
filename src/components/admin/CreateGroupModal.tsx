"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CREATE_GROUP } from "@/lib/graphql/group";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGroupModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    groupName: "",
    groupType: "DTM",
    telegramChatId: "",
    durationMonths: 3,
    groupDesc: "",
  });

  const [createGroup, { loading }] = useMutation(CREATE_GROUP, {
    onCompleted: () => {
      onSuccess();
      onClose();
    },
  });

  const handleSubmit = () => {
    createGroup({
      variables: {
        input: {
          ...form,
          durationMonths: Number(form.durationMonths),
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-2xl border border-border p-6 w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg">Yangi guruh yaratish</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Guruh nomi *</label>
            <Input
              placeholder="DTM 2026 - 1-guruh"
              value={form.groupName}
              onChange={(e) => setForm({ ...form, groupName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tur *</label>
            <select
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              value={form.groupType}
              onChange={(e) => setForm({ ...form, groupType: e.target.value })}
            >
              <option value="DTM">DTM</option>
              <option value="SAT">SAT</option>
              <option value="MILLIY_SERTIFIKAT">Milliy Sertifikat</option>
              <option value="ATTESTATSIYA">Attestatsiya</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Telegram Chat ID *</label>
            <Input
              placeholder="-100xxxxxxxxx"
              value={form.telegramChatId}
              onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Davomiylik (oy) *</label>
            <Input
              type="number"
              min={1}
              max={6}
              value={form.durationMonths}
              onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tavsif</label>
            <Input
              placeholder="Guruh haqida..."
              value={form.groupDesc}
              onChange={(e) => setForm({ ...form, groupDesc: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading || !form.groupName || !form.telegramChatId}
            className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
          >
            {loading ? "Yaratilmoqda..." : "Yaratish"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}