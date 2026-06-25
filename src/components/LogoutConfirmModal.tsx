"use client";

import { LogOut } from "lucide-react";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutConfirmModal({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-sm shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Chiqishni tasdiqlang</h3>
              <p className="text-xs text-muted-foreground">Hisobdan chiqmoqchimisiz?</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Chiqish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
