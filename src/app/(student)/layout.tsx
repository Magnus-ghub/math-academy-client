import Header from "@/components/layout/Header";
import StudentSidebar from "@/components/student/StudentSidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <main className="flex-1 bg-muted/20 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}