export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-muted/10">
      {children}
    </div>
  );
}
