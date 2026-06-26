"use client";

import { X, Lock, Clock, FileQuestion, ShieldCheck, Phone } from "lucide-react";

interface Test {
  id: string;
  testTitle: string;
  testPrice?: number;
  totalQuestions?: number;
  duration?: number;
}

interface PaymentModalProps {
  test: Test;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  price.toLocaleString("uz-UZ") + " UZS";

export default function PaymentModal({ test, onClose }: PaymentModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background rounded-3xl border border-border w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="relative bg-primary px-6 pt-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs">Premium test</p>
              <h3 className="text-white font-bold text-base leading-tight line-clamp-2">
                {test.testTitle}
              </h3>
            </div>
          </div>

          {/* Price pill */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
            <div className="bg-background border-2 border-primary rounded-2xl px-6 py-2.5 shadow-lg">
              <p className="text-primary font-black text-xl tracking-tight">
                {test.testPrice ? formatPrice(test.testPrice) : "Premium"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-10 pb-6 space-y-5">

          {/* Test stats */}
          <div className="flex gap-3">
            {test.totalQuestions && (
              <div className="flex-1 bg-muted/50 rounded-2xl p-3 text-center">
                <FileQuestion className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{test.totalQuestions}</p>
                <p className="text-[10px] text-muted-foreground">savol</p>
              </div>
            )}
            {test.duration && (
              <div className="flex-1 bg-muted/50 rounded-2xl p-3 text-center">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{test.duration}</p>
                <p className="text-[10px] text-muted-foreground">daqiqa</p>
              </div>
            )}
            <div className="flex-1 bg-muted/50 rounded-2xl p-3 text-center">
              <ShieldCheck className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold">∞</p>
              <p className="text-[10px] text-muted-foreground">urinish</p>
            </div>
          </div>

          {/* Payment section */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">To'lov usulini tanlang</p>

            {/* Click button — hardcoded, API kelganda ulanadi */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 bg-[#00ADEF]/10 border-2 border-[#00ADEF]/30 text-[#00ADEF] rounded-2xl py-3.5 font-bold text-sm opacity-60 cursor-not-allowed"
            >
              {/* Click logo */}
              <svg width="52" height="18" viewBox="0 0 52 18" fill="none">
                <text x="0" y="14" fontSize="16" fontWeight="800" fill="#00ADEF" fontFamily="Arial">Click</text>
              </svg>
              orqali to'lash
            </button>

            {/* Coming soon badge */}
            <p className="text-center text-[11px] text-muted-foreground">
              Click to'lov tizimi ulanmoqda — tez orada mavjud bo'ladi
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">yoki</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Contact admin */}
          <a
            href="https://t.me/MatematikaMilliy_Sertifikat"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-3.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Admin orqali to'lash
          </a>

          <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
            To'lovdan so'ng admin akkauntingizni aktivlashtiradi
          </p>
        </div>
      </div>
    </div>
  );
}
