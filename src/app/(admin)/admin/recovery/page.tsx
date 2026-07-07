"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { CheckCircle, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import {
  GET_RECOVERY_REQUESTS,
  RESOLVE_RECOVERY_REQUEST,
} from "@/lib/graphql/recovery";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "Kutilmoqda",
  RESOLVED: "Hal qilindi",
};

export default function AdminRecoveryPage() {
  const { data, loading, refetch } = useQuery<{ getRecoveryRequests: any[] }>(
    GET_RECOVERY_REQUESTS,
    { fetchPolicy: "cache-and-network" }
  );
  const requests = data?.getRecoveryRequests || [];

  const [resolveRequest] = useMutation(RESOLVE_RECOVERY_REQUEST, {
    onCompleted: () => {
      toast.success("So'rov hal qilindi deb belgilandi");
      refetch();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tiklash so'rovlari</h1>
        <p className="text-muted-foreground text-sm">
          {pendingCount} ta kutilmoqda — Telegram akkauntiga kira olmayotgan foydalanuvchilar
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <p>Hozircha tiklash so'rovlari yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <div key={r.id} className="bg-background rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-sm">{r.fullName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(r.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-2 text-xs text-muted-foreground">
                    <a href={`tel:${r.phone}`} className="flex items-center gap-1 hover:text-primary">
                      <Phone className="w-3 h-3" />
                      {r.phone}
                    </a>
                    {r.telegramUsername && (
                      <a
                        href={`https://t.me/${r.telegramUsername.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary"
                      >
                        <Send className="w-3 h-3" />
                        {r.telegramUsername}
                      </a>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">{r.message}</p>
                </div>

                {r.status === "PENDING" && (
                  <button
                    onClick={() => resolveRequest({ variables: { id: r.id } })}
                    className="p-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors shrink-0"
                    title="Hal qilindi deb belgilash"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
