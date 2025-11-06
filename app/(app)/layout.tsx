import { AppShell } from "../../components/layout/app-shell";
import { requireSession } from "../../lib/auth/guards";
import { redirect } from "next/navigation";

export default async function AppShellLayout({
  children
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  try {
    await requireSession();
  } catch {
    redirect("/signin");
  }

  return <AppShell>{children}</AppShell>;
}