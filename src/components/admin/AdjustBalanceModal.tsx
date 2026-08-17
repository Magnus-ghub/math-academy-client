"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { X, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ADJUST_USER_BALANCE } from "@/lib/graphql/payment";
import { toast } from "sonner";

interface User {
  id: string;
  userName?: string;
  userLastName?: string;
  balance?: number;
}

interface Props {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AdjustBalanceModal({ user, onClose, onSaved }: Props) {
  const [direction, setDirection] = useState<"add" | "subtract">("add");
  const [rawAmount, setRawAmount] = useState("");
  const [reason, setReason] = useState("");

  const [adjustUserBalance, { loading }] = useMutation(ADJUST_USER_BALANCE, {
    onCompleted: () => {
      toast.success("Balans tuzatildi");
      setRawAmount("");
      setReason("");
      onSaved();
      onClose();
    },
    onError: (err) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  if (!user) return null;

  const amount = Number(rawAmount) || 0;
  const signedAmount = direction === "add" ? amount : -amount;

  const handleSave = () => {
    if (!amount) return;
    adjustUserBalance({
      variables: { userId: user.id, amount: signedAmount, reason: reason.trim() || undefined },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Balansni tuzatish</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {[user.userName, user.userLastName].filter(Boolean).join(" ") || "Foydalanuvchi"} — joriy balans:{" "}
          <span className="font-semibold text-foreground">
            {(user.balance ?? 0).toLocaleString("uz-UZ")} so'm
          </span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amal</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection("add")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  direction === "add"
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "border-border hover:bg-muted"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Qo'shish
              </button>
              <button
                type="button"
                onClick={() => setDirection("subtract")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                  direction === "subtract"
                    ? "bg-red-100 text-red-600 border-red-300"
                    : "border-border hover:bg-muted"
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                Ayirish
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Summa (so'm)</label>
            <Input
              type="number"
              inputMode="numeric"
              value={rawAmount}
              onChange={(e) => setRawAmount(e.target.value)}
              placeholder="masalan 50000"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Sabab (talabaga Telegram orqali yuboriladi)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="masalan: ortiqcha o'tkazilgan pul qaytarildi"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Bekor qilish
          </button>
          <Button onClick={handleSave} disabled={loading || !amount} className="flex-1">
            {loading ? "Saqlanmoqda..." : "Tasdiqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
}
