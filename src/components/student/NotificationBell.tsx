"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  GET_MY_NOTIFICATIONS,
  GET_MY_UNREAD_NOTIFICATION_COUNT,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from "@/lib/graphql/notification";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof BookOpen> = {
  TEST_PUBLISHED: BookOpen,
};

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "hozir";
  if (minutes < 60) return `${minutes} daq oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
};

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const knownCount = useRef<number | null>(null);

  const { data: countData } = useQuery<{ getMyUnreadNotificationCount: number }>(
    GET_MY_UNREAD_NOTIFICATION_COUNT,
    { pollInterval: 30_000 }
  );
  const unreadCount = countData?.getMyUnreadNotificationCount ?? 0;

  useEffect(() => {
    if (knownCount.current === null) {
      knownCount.current = unreadCount;
      return;
    }
    if (unreadCount > knownCount.current) {
      toast("Yangi bildirishnoma bor!", { icon: <Bell className="w-4 h-4 text-primary" /> });
    }
    knownCount.current = unreadCount;
  }, [unreadCount]);

  const { data: listData, loading } = useQuery<{ getMyNotifications: NotificationItem[] }>(
    GET_MY_NOTIFICATIONS,
    { skip: !open, fetchPolicy: "cache-and-network" }
  );
  const notifications = listData?.getMyNotifications ?? [];

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    refetchQueries: [GET_MY_UNREAD_NOTIFICATION_COUNT],
  });
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    refetchQueries: [GET_MY_UNREAD_NOTIFICATION_COUNT, GET_MY_NOTIFICATIONS],
  });

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleItemClick = (n: NotificationItem) => {
    if (!n.isRead) markRead({ variables: { notificationId: n.id } });
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
        title="Bildirishnomalar"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-2xl border border-border bg-background shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">Bildirishnomalar</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Hammasini o'qilgan qilish
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Bildirishnomalar yo'q</p>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors ${
                      !n.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
