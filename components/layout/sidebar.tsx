"use client";

const sections = [
  { label: "Inbox" },
  { label: "Overdue" },
  { label: "Work" },
  { label: "Family" },
  { label: "Personal" },
  { label: "Travel" }
];

export function Sidebar(): JSX.Element {
  return (
    <nav className="flex h-full flex-col gap-1 bg-background/80 p-4 text-sm text-muted-foreground">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        Planner
      </div>
      {sections.map((item) => (
        <button
          key={item.label}
          type="button"
          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}