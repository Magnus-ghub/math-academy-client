export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-950 text-white min-h-screen p-4">
        <p className="font-bold text-lg mb-6">Admin Panel</p>
      </aside>
      <main className="flex-1 p-6 bg-muted/20">{children}</main>
    </div>
  );
}
