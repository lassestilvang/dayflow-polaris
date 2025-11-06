"use client";

import { ThemeToggle } from "../theme/theme-toggle";

export function TopNav(): JSX.Element {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-primary" />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Dayflow Polaris
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}