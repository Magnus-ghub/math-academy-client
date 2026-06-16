"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ADMIN_UPDATE_USER } from "@/lib/graphql/user";
import { toast } from "sonner";

const ROLES = [
  { value: "STUDENT", label: "Talaba" },
  { value: "ACADEM_STUDENT", label: "Premium" },
  { value: "TEACHER", label: "O'qituvchi" },
  { value: "ADMIN", label: "Admin" },
];

interface User {
  id: string;
  userName?: string;
  userLastName?: string;
  userPhone?: string;
  userRole: string;
}

interface Props {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditUserModal({ user, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ userName: "", userLastName: "", userPhone: "" });
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        userName: user.userName || "",
        userLastName: user.userLastName || "",
        userPhone: user.userPhone || "",
      });
      setSelectedRole(user.userRole);
    }
  }, [user]);

  const [adminUpdateUser, { loading }] = useMutation(ADMIN_UPDATE_USER, {
    onCompleted: () => {
      toast.success("Foydalanuvchi ma'lumotlari saqlandi");
      onSaved();
      onClose();
    },
    onError: () => toast.error("Xatolik yuz berdi"),
  });

  if (!user) return null;

  const handleSave = () => {
    adminUpdateUser({
      variables: {
        userId: user.id,
        input: {
          userName: form.userName || undefined,
          userLastName: form.userLastName || undefined,
          userPhone: form.userPhone || undefined,
          userRole: selectedRole !== user.userRole ? selectedRole : undefined,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl border border-border shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Foydalanuvchini tahrirlash</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Ism</label>
            <Input
              value={form.userName}
              onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
              placeholder="Ism"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Familiya</label>
            <Input
              value={form.userLastName}
              onChange={(e) => setForm((f) => ({ ...f, userLastName: e.target.value }))}
              placeholder="Familiya"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Telefon</label>
            <Input
              value={form.userPhone}
              onChange={(e) => setForm((f) => ({ ...f, userPhone: e.target.value }))}
              placeholder="+998901234567"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rol</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    selectedRole === role.value
                      ? "bg-primary text-white border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Bekor qilish
          </button>
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
}
