import StudentSidebar from "@/components/student/StudentSidebar";
import StudentHeader from "@/components/student/StudentHeader";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <StudentHeader />
        <main className="flex-1 bg-muted/20 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}