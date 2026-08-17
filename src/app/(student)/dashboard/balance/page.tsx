"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  Wallet, Loader2, Upload, Copy, Check, Phone, ImageOff, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  GET_MY_BALANCE, INITIATE_CLICK_TOPUP, REPORT_MANUAL_TOPUP,
} from "@/lib/graphql/payment";
import { useAuthStore } from "@/lib/store/auth.store";

// TODO: haqiqiy admin karta raqami va egasi bilan almashtiring
const ADMIN_CARD_NUMBER = "8600 1234 5678 9012";
const ADMIN_CARD_HOLDER = "F. ISMOILOV";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/graphql", "") ?? "http://localhost:4000";

const PRESET_AMOUNTS = [50_000, 100_000, 200_000];

const formatSom = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

// Summa har doim 1000 so'mga karrali bo'lishi kerak — so'm birligi juda kichik,
// mayda summalar (masalan 51 234) xatoga o'xshab ko'rinadi va hisob-kitobni chalkashtiradi
const isValidAmount = (value: number | null): value is number =>
  !!value && value >= 1000 && value % 1000 === 0;

export default function BalancePage() {
  const { accessToken } = useAuthStore();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100_000);
  // Faqat "000"dan oldingi raqamlar kiritiladi — summa doim 1000ga karrali bo'ladi
  const [customPrefix, setCustomPrefix] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualReported, setManualReported] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [studentNote, setStudentNote] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const { data, loading } = useQuery<{ getMyBalance: number }>(GET_MY_BALANCE, {
    fetchPolicy: "cache-and-network",
  });
  const balance = data?.getMyBalance ?? 0;

  const customAmount = customPrefix ? Number(customPrefix + "000") : null;
  const amount = customAmount ?? selectedAmount;

  const [initiateClickTopup, { loading: clickLoading }] = useMutation<
    { initiateClickTopup: { payUrl: string } },
    { amount: number }
  >(INITIATE_CLICK_TOPUP, {
    onCompleted: (data) => {
      window.location.href = data.initiateClickTopup.payUrl;
    },
    onError: (err) => toast.error(err.message || "To'ldirishni boshlashda xatolik yuz berdi"),
  });

  const [reportManualTopup, { loading: manualLoading }] = useMutation<
    { reportManualTopup: { id: string } },
    { amount: number; receiptUrl?: string; studentNote?: string }
  >(REPORT_MANUAL_TOPUP, {
    onCompleted: () => setManualReported(true),
    onError: (err) => toast.error(err.message || "So'rovni yuborishda xatolik yuz berdi"),
  });

  const handleSelectPreset = (val: number) => {
    setSelectedAmount(val);
    setCustomPrefix("");
  };

  const handleClickTopup = () => {
    if (!isValidAmount(amount)) {
      toast.error("Summa 1000 so'mga karrali bo'lishi kerak");
      return;
    }
    initiateClickTopup({ variables: { amount } });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleCopyCard = () => {
    navigator.clipboard.writeText(ADMIN_CARD_NUMBER.replace(/\s/g, ""));
    setCardCopied(true);
    setTimeout(() => setCardCopied(false), 2000);
  };

  const handleSubmitManual = async () => {
    if (!isValidAmount(amount) || (!receiptFile && !studentNote.trim())) return;

    setUploadingReceipt(true);
    try {
      let receiptUrl: string | undefined;

      if (receiptFile) {
        const formData = new FormData();
        formData.append("file", receiptFile);
        const res = await fetch(`${API_BASE}/upload/image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });
        const data = await res.json();
        if (!data.url) {
          toast.error("Chek rasmi yuklanmadi");
          return;
        }
        receiptUrl = data.url;
      }

      await reportManualTopup({
        variables: { amount, receiptUrl, studentNote: studentNote.trim() || undefined },
      });
    } catch {
      toast.error("Yuborishda xatolik yuz berdi");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const submitting = uploadingReceipt || manualLoading;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Balansim</h1>
        <p className="text-muted-foreground text-sm">Balansni to'ldiring va testlarni bir zumda sotib oling</p>
      </div>

      {/* Balance hero card */}
      <div className="relative rounded-3xl bg-linear-to-br from-primary via-primary to-indigo-950 p-6 mb-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium">Joriy balans</p>
            {loading ? (
              <div className="h-8 w-32 bg-white/20 rounded-lg animate-pulse mt-1" />
            ) : (
              <p className="text-white font-black text-3xl tracking-tight">{formatSom(balance)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 mb-6 max-w-lg">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-relaxed">
          Balansga o'tkazgan pulingiz akademiya hisobida xavfsiz turadi va faqat shu akademiya uchun
          ishlata olasiz. Pulni avtomatik yechib olish (qaytarib olish) imkoni mavjud emas.
        </p>
      </div>

      <div className="max-w-lg space-y-5">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Summani tanlang
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => handleSelectPreset(val)}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                  !customAmount && selectedAmount === val
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {val.toLocaleString("uz-UZ")}
              </button>
            ))}
          </div>
          <div className="relative w-full border border-border rounded-xl bg-background focus-within:ring-2 focus-within:ring-primary/20">
            {/* Ko'rinadigan formatlangan matn — raqamdan keyin "000" darhol ko'rinadi */}
            <div className="px-3 py-2.5 text-sm pointer-events-none select-none whitespace-pre">
              {customPrefix ? (
                <>
                  <span className="font-medium text-foreground">{customPrefix}</span>
                  <span className="text-muted-foreground">{"000 so'm"}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Yoki boshqa summa: masalan 51</span>
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customPrefix}
              onChange={(e) => {
                setCustomPrefix(e.target.value.replace(/\D/g, ""));
                setSelectedAmount(null);
              }}
              className="absolute inset-0 w-full px-3 py-2.5 text-sm bg-transparent text-transparent caret-foreground outline-none"
            />
          </div>
        </div>

        {/* Click topup */}
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute -top-2.5 right-4 z-10 bg-primary text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
              Tavsiya etiladi
            </span>
            <button
              onClick={handleClickTopup}
              disabled={!isValidAmount(amount) || clickLoading}
              className="w-full flex items-center justify-center gap-3 bg-gray-950 hover:bg-gray-900 active:scale-[0.99] text-white rounded-2xl py-4 font-semibold text-sm shadow-lg shadow-gray-950/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {clickLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/click-logo.svg" alt="Click" className="h-5 w-auto" />
                  <span className="text-white/30">•</span>
                  <span>orqali to'ldirish</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            QR, telefon raqami yoki bank kartasi bilan — xavfsiz to'lov
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground">yoki</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Manual topup */}
        {manualReported ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center space-y-1">
            <Check className="w-6 h-6 text-primary mx-auto" />
            <p className="text-sm font-semibold">So'rovingiz qabul qilindi</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Admin ko'rib chiqib, tasdiqlaydi yoki rad etadi — natija Telegram orqali xabar qilinadi
            </p>
          </div>
        ) : !showManualForm ? (
          <button
            onClick={() => setShowManualForm(true)}
            disabled={!isValidAmount(amount)}
            className="w-full flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-medium py-1.5 transition-colors disabled:opacity-60"
          >
            <Phone className="w-3.5 h-3.5" />
            Kartadan-kartaga o'tkazib, admin orqali to'ldirish
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Quyidagi kartaga <span className="font-semibold text-foreground">{amount ? formatSom(amount) : ""}</span> o'tkazib, chek rasmini yuklang.
              Boshqa sababingiz bo'lsa, pastda izoh yozib qoldiring — admin ko'rib chiqadi.
            </p>

            <button
              onClick={handleCopyCard}
              className="group w-full rounded-2xl bg-linear-to-br from-gray-900 to-gray-950 p-4 text-left text-white relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
              <div className="relative flex items-center justify-between mb-5">
                <span className="text-[10px] uppercase tracking-widest text-white/50">Bank kartasi</span>
                {cardCopied ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <Check className="w-3 h-3" />
                    Nusxalandi
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-white/50 group-hover:text-white/80 transition-colors">
                    <Copy className="w-3 h-3" />
                    Nusxalash
                  </span>
                )}
              </div>
              <p className="relative font-mono text-lg tracking-[0.15em] mb-1.5">{ADMIN_CARD_NUMBER}</p>
              <p className="relative text-xs text-white/60">{ADMIN_CARD_HOLDER}</p>
            </button>

            <label className="block w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer overflow-hidden">
              {receiptPreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={receiptPreview} alt="Chek" className="w-full max-h-48 object-contain bg-muted" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[11px] text-center py-1.5">
                    Almashtirish uchun bosing
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-6 text-muted-foreground">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-medium">Chek rasmini yuklang (ixtiyoriy)</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>

            <textarea
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              placeholder="Izoh (chek yuklamasangiz, sababini shu yerga yozing)"
              rows={2}
              className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <button
              onClick={handleSubmitManual}
              disabled={(!receiptFile && !studentNote.trim()) || submitting}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-2xl py-3.5 font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : !receiptFile && !studentNote.trim() ? (
                <ImageOff className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Yuborish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
