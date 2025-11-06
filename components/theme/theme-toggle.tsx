"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "./theme-provider";

export function ThemeToggle(): JSX.Element {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  function toggle(): void {
    const next = isDark ? "light" : "dark";
    setTheme(next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggle}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </Button>
  );
}