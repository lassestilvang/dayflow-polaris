export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background/80 p-8 shadow-soft backdrop-blur">
        {children}
      </div>
    </div>
  );
}