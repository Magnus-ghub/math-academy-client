"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { RefreshCw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GET_TELEGRAM_CHATS } from "@/lib/graphql/group";

interface TelegramChatOption {
  chatId: string;
  title: string;
  type: string;
  username?: string | null;
  addedByName?: string | null;
  linkedGroupName?: string | null;
}

interface Props {
  value: string;
  onChange: (chatId: string) => void;
  /** Tahrirlashda — guruhning hozirgi chati (u "band" deb bloklanmasligi uchun) */
  currentChatId?: string;
}

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

const TYPE_LABEL: Record<string, string> = {
  channel: "kanal",
  supergroup: "guruh",
  group: "guruh",
};

// Bot admin bo'lgan kanal/guruhlar ro'yxatidan tanlash. Ro'yxatni bot o'zi
// to'playdi (qo'shilganda/admin qilinganda) — admin chat ID qidirmaydi.
// Zaxira sifatida ID'ni qo'lda kiritish ham mumkin.
export default function TelegramChatPicker({ value, onChange, currentChatId }: Props) {
  const { data, loading, refetch, networkStatus } = useQuery<{ getTelegramChats: TelegramChatOption[] }>(
    GET_TELEGRAM_CHATS,
    { fetchPolicy: "network-only", notifyOnNetworkStatusChange: true },
  );
  const chats = data?.getTelegramChats ?? [];
  const known = chats.some((c) => c.chatId === value);
  const [manual, setManual] = useState(false);
  const showManual = manual || (!!value && !loading && !known);
  const refreshing = networkStatus === 4;

  const isTaken = (c: TelegramChatOption) => !!c.linkedGroupName && c.chatId !== currentChatId;

  return (
    <div className="space-y-2">
      {showManual ? (
        <Input placeholder="-100xxxxxxxxx" value={value} onChange={(e) => onChange(e.target.value.trim())} />
      ) : (
        <div className="flex gap-2">
          <select
            className="flex-1 min-w-0 border border-border rounded-lg px-3 py-2 text-sm bg-background"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading && !data}
          >
            <option value="">{loading && !data ? "Yuklanmoqda..." : "Kanal yoki guruhni tanlang"}</option>
            {chats.map((c) => (
              <option key={c.chatId} value={c.chatId} disabled={isTaken(c)}>
                {c.title} ({TYPE_LABEL[c.type] ?? c.type})
                {isTaken(c) ? ` — "${c.linkedGroupName}" guruhiga ulangan` : ""}
                {!isTaken(c) && c.addedByName ? ` — qo'shgan: ${c.addedByName}` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={refreshing}
            title="Ro'yxatni yangilash"
            className="shrink-0 px-3 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        {showManual ? (
          <>Chat ID odatda -100 bilan boshlanadi.</>
        ) : (
          <>
            Ro&apos;yxatda yo&apos;qmi? {BOT_USERNAME ? <strong>@{BOT_USERNAME}</strong> : "Botni"} kanal/guruhga
            admin qiling va yangilang. Bot avvaldan admin bo&apos;lsa — kanalga <strong>/ulash</strong> deb yozing.
          </>
        )}{" "}
        <button
          type="button"
          onClick={() => {
            if (showManual) {
              setManual(false);
              // Ro'yxatda yo'q ID qolsa, qo'lda kiritish rejimi yana ochilib qoladi
              if (!known) onChange("");
            } else {
              setManual(true);
            }
          }}
          className="text-primary hover:underline font-medium"
        >
          {showManual ? "Ro'yxatdan tanlash" : "ID'ni qo'lda kiritish"}
        </button>
      </p>
    </div>
  );
}
