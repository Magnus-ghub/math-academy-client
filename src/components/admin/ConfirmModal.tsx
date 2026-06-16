"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Ha, tasdiqlash",
  cancelLabel = "Bekor qilish",
  danger = true,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-background rounded-2xl border border-border shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${danger ? "bg-red-100" : "bg-yellow-100"}`}>
            <AlertTriangle className={`w-6 h-6 ${danger ? "text-red-500" : "text-yellow-500"}`} />
          </div>
          <div>
            <h2 className="font-semibold text-base">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
