"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Users, Calendar, MoreHorizontal, Power } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  GET_ALL_GROUPS,
  CREATE_GROUP,
  UPDATE_GROUP,
} from "@/lib/graphql/group";
import CreateGroupModal from "@/components/admin/CreateGroupModal";

const groupTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary",
  SAT: "bg-accent/10 text-accent",
  MILLIY_SERTIFIKAT: "bg-green-100 text-green-700",
  ATTESTATSIYA: "bg-purple-100 text-purple-700",
};

export default function AdminGroupsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    groupName: "",
    groupType: "DTM",
    telegramChatId: "",
    durationMonths: 3,
    groupDesc: "",
  });

  const { data, loading, refetch } = useQuery<{ getAllGroups: any[] }>(
    GET_ALL_GROUPS,
  );
  const groups = data?.getAllGroups || [];

  const [createGroup, { loading: creating }] = useMutation(CREATE_GROUP, {
    onCompleted: () => {
      refetch();
      setShowModal(false);
      setForm({
        groupName: "",
        groupType: "DTM",
        telegramChatId: "",
        durationMonths: 3,
        groupDesc: "",
      });
    },
  });

  const [updateGroup] = useMutation(UPDATE_GROUP, {
    onCompleted: () => refetch(),
  });

  const filtered = groups.filter((g) => {
    const matchSearch = g.groupName
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || g.groupType === typeFilter;
    return matchSearch && matchType;
  });

  const handleCreate = () => {
    createGroup({
      variables: {
        input: {
          ...form,
          durationMonths: Number(form.durationMonths),
        },
      },
    });
  };

  const handleToggleStatus = (group: any) => {
    updateGroup({
      variables: {
        groupId: group.id,
        input: {
          groupStatus: group.groupStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted rounded-2xl h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Guruhlar</h1>
          <p className="text-muted-foreground text-sm">
            {filtered.length} ta guruh
          </p>
        </div>
        <button
          onClick={() => setShowModal(!showModal)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yangi guruh
        </button>
      </div>

      {/* Create form */}
      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Guruh nomi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "DTM", "SAT", "MILLIY_SERTIFIKAT", "ATTESTATSIYA"].map(
            (type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === type
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {type === "ALL"
                  ? "Barchasi"
                  : type === "MILLIY_SERTIFIKAT"
                    ? "Milliy"
                    : type}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center text-muted-foreground">
          <p>Guruhlar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((group: any) => (
            <div
              key={group.id}
              className="bg-background rounded-2xl border border-border p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${groupTypeColors[group.groupType]}`}
                  >
                    {group.groupType}
                  </span>
                  <h3 className="font-bold mt-2 text-sm">{group.groupName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${group.groupStatus === "ACTIVE" ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  <button
                    onClick={() => handleToggleStatus(group)}
                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                    title={group.groupStatus === "ACTIVE" ? "Yopish" : "Ochish"}
                  >
                    <Power className="w-4 h-4 text-muted-foreground" />
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
                  <span className="font-mono text-xs">
                    {group.telegramChatId}
                  </span>
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
      )}
    </div>
  );
}
