"use client";

import { useState } from "react";
import { Plus, Users, Calendar, MoreHorizontal, Power } from "lucide-react";
import { Input } from "@/components/ui/input";

const groupTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary",
  SAT: "bg-accent/10 text-accent",
  MILLIY_SERTIFIKAT: "bg-green-100 text-green-700",
  ATTESTATSIYA: "bg-purple-100 text-purple-700",
};

const mockGroups = [
  { id: "1", groupName: "DTM 2026 - 1-guruh", groupType: "DTM", telegramChatId: "-100111", durationMonths: 3, memberCount: 245, groupStatus: "ACTIVE", createdAt: "2026-01-01" },
  { id: "2", groupName: "SAT March 2026", groupType: "SAT", telegramChatId: "-100222", durationMonths: 2, memberCount: 120, groupStatus: "ACTIVE", createdAt: "2026-02-01" },
  { id: "3", groupName: "Milliy Sertifikat - Bahor", groupType: "MILLIY_SERTIFIKAT", telegramChatId: "-100333", durationMonths: 4, memberCount: 180, groupStatus: "ACTIVE", createdAt: "2026-01-15" },
  { id: "4", groupName: "Attestatsiya 2026", groupType: "ATTESTATSIYA", telegramChatId: "-100444", durationMonths: 6, memberCount: 95, groupStatus: "INACTIVE", createdAt: "2026-03-01" },
];

export default function AdminGroupsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = mockGroups.filter((g) => {
    const matchSearch = g.groupName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || g.groupType === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Guruhlar</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} ta guruh</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Yangi guruh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Guruh nomi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "DTM", "SAT", "MILLIY_SERTIFIKAT", "ATTESTATSIYA"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === type
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {type === "ALL" ? "Barchasi" : type === "MILLIY_SERTIFIKAT" ? "Milliy" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((group) => (
          <div key={group.id} className="bg-background rounded-2xl border border-border p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${groupTypeColors[group.groupType]}`}>
                  {group.groupType}
                </span>
                <h3 className="font-bold mt-2 text-sm">{group.groupName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${group.groupStatus === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`} />
                <button className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{group.memberCount} a'zo</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{group.durationMonths} oy davomiylik</span>
              </div>
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4" />
                <span className="font-mono text-xs">{group.telegramChatId}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <button className="flex-1 text-xs py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors">
                Testlar
              </button>
              <button className="flex-1 text-xs py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 font-medium transition-colors">
                Tahrirlash
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}