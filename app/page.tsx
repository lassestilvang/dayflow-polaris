import Link from "next/link";
import { Button } from "../components/ui/button";

export default function LandingPage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
          A focused planner for signal, not noise
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Dayflow Polaris unifies your week across work and life.
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          A modern, dark-native planning surface designed for high-agency teams
          and families. One place for your inbox, priorities, and travel —
          shipping soon.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/app">Enter app</Link>
          </Button>
          <span className="text-[11px] text-muted-foreground">
            Auth, integrations, and live data will be wired in upcoming steps.
          </span>
        </div>
      </div>
    </main>
  );
}