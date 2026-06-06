import { Users, Calendar, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

const groupTypeColors: Record<string, string> = {
  DTM: "bg-primary/10 text-primary",
  SAT: "bg-accent/10 text-accent",
  MILLIY_SERTIFIKAT: "bg-green-100 text-green-700",
  ATTESTATSIYA: "bg-purple-100 text-purple-700",
};

export default function GroupsPage() {
  const myGroups: any[] = [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Guruhlarim</h1>
        <p className="text-muted-foreground text-sm">A'zo bo'lgan guruhlaringiz</p>
      </div>

      {myGroups.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-medium mb-1">Hali guruhga a'zo emassiz</p>
          <p className="text-sm text-muted-foreground mb-4">
            Telegram guruhga a'zo bo'lib, qaytadan tizimga kiring
          </p>
          <Link href="/login">
            <button className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
              Telegram orqali kirish
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myGroups.map((group) => (
            <div key={group.id} className="bg-background rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${groupTypeColors[group.groupType]}`}>
                  {group.groupType}
                </span>
              </div>
              <h3 className="font-bold mb-3">{group.groupName}</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Muddat: {new Date(group.expiresAt).toLocaleDateString("uz-UZ")}
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3 h-3" />
                  Guruh testlari
                </div>
              </div>
              <Link href={`/dashboard/tests?groupId=${group.id}`}>
                <button className="w-full mt-4 bg-primary/10 text-primary py-2 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors">
                  Testlarni ko'rish
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}