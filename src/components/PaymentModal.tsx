"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  X, Lock, Clock, FileQuestion, ShieldCheck, Sparkles, Loader2, Wallet, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { GET_MY_BALANCE, GET_MY_PURCHASED_TEST_IDS, PURCHASE_TEST_WITH_BALANCE } from "@/lib/graphql/payment";

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

const formatSom = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

export default function PaymentModal({ test, onClose }: PaymentModalProps) {
  const router = useRouter();
  const price = test.testPrice ?? 0;

  const { data, loading: balanceLoading } = useQuery<{ getMyBalance: number }>(GET_MY_BALANCE, {
    fetchPolicy: "cache-and-network",
  });
  const balance = data?.getMyBalance ?? 0;
  const sufficient = !balanceLoading && balance >= price;
  const shortfall = Math.max(0, price - balance);

  const [purchaseTestWithBalance, { loading: purchasing }] = useMutation<
    { purchaseTestWithBalance: { id: string } },
    { testId: string }
  >(PURCHASE_TEST_WITH_BALANCE, {
    refetchQueries: [{ query: GET_MY_PURCHASED_TEST_IDS }, { query: GET_MY_BALANCE }],
    onCompleted: () => {
      toast.success("Test muvaffaqiyatli sotib olindi!");
      onClose();
    },
    onError: (err) => toast.error(err.message || "Xarid amalga oshmadi"),
  });

  const handlePurchase = () => {
    purchaseTestWithBalance({ variables: { testId: test.id } });
  };

  const handleGoToBalance = () => {
    onClose();
    router.push("/dashboard/balance");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background rounded-3xl border border-border w-full max-w-md shadow-2xl ring-1 ring-black/5 overflow-hidden">

        {/* Header */}
        <div className="relative bg-linear-to-br from-primary via-primary to-indigo-950 px-6 pt-6 pb-10">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-8 -left-14 w-36 h-36 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative flex items-center gap-3 mb-1">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="flex items-center gap-1 text-white/70 text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                Premium test
              </p>
              <h3 className="text-white font-bold text-base leading-tight line-clamp-2">
                {test.testTitle}
              </h3>
            </div>
          </div>

          {/* Price pill */}
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-background rounded-2xl px-7 py-3 shadow-xl ring-1 ring-black/5">
              <p className="text-[10px] font-semibold text-muted-foreground text-center uppercase tracking-wider mb-0.5">
                Test narxi
              </p>
              <p className="text-primary font-black text-xl tracking-tight text-center">
                {price ? formatSom(price) : "Premium"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-12 pb-6 space-y-5">

          {/* Test stats */}
          <div className="flex gap-3">
            {test.totalQuestions && (
              <div className="flex-1 rounded-2xl border border-border p-3 text-center">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                  <FileQuestion className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm font-bold">{test.totalQuestions}</p>
                <p className="text-[10px] text-muted-foreground">savol</p>
              </div>
            )}
            {test.duration && (
              <div className="flex-1 rounded-2xl border border-border p-3 text-center">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm font-bold">{test.duration}</p>
                <p className="text-[10px] text-muted-foreground">daqiqa</p>
              </div>
            )}
            <div className="flex-1 rounded-2xl border border-border p-3 text-center">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-sm font-bold">∞</p>
              <p className="text-[10px] text-muted-foreground">urinish</p>
            </div>
          </div>

          {/* Balance status */}
          <div className="rounded-2xl border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="w-4 h-4 text-primary" />
                Joriy balansingiz
              </div>
              {balanceLoading ? (
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <span className="font-bold text-sm">{formatSom(balance)}</span>
              )}
            </div>

            {!balanceLoading && !sufficient && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 leading-relaxed">
                Balansingiz yetarli emas — yana <span className="font-semibold">{formatSom(shortfall)}</span> kerak
              </p>
            )}
          </div>

          {/* Action */}
          {sufficient ? (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 active:scale-[0.99] text-white rounded-2xl py-4 font-semibold text-sm shadow-lg shadow-primary/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {purchasing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-4 h-4" />}
              Balansdan sotib olish
            </button>
          ) : (
            <button
              onClick={handleGoToBalance}
              className="w-full flex items-center justify-center gap-2 bg-gray-950 hover:bg-gray-900 active:scale-[0.99] text-white rounded-2xl py-4 font-semibold text-sm shadow-lg shadow-gray-950/25 transition-all"
            >
              Balansni to'ldirish
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
