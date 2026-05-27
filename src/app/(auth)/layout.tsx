export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
