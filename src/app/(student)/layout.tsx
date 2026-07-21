import StudentSidebar from "@/components/student/StudentSidebar";
import StudentHeader from "@/components/student/StudentHeader";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <StudentSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <StudentHeader />
        <main className="flex-1 bg-muted/20 p-4 md:p-6 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}