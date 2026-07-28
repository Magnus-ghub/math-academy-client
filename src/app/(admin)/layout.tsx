import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <AdminHeader />
        <main className="flex-1 bg-muted/20 p-4 md:p-6 overflow-auto pt-4 md:pt-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
