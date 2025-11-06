"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { useUIStore } from "../../store/ui";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps): JSX.Element {
  const isCollapsed = useUIStore((s) => s.isSidebarCollapsed);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopNav />
      <div className="flex flex-1">
        <aside
          className={
            isCollapsed
              ? "hidden border-r border-border bg-background/80 md:block md:w-16"
              : "w-64 border-r border-border bg-background/80"
          }
        >
          <Sidebar />
        </aside>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}