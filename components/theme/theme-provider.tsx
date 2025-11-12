"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: "class";
  defaultTheme?: Theme;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined
);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeClass(theme: Theme): "light" | "dark" {
  const root = document.documentElement;
  const resolved = theme === "system" ? getSystemTheme() : theme;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  return resolved;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system"
}: ThemeProviderProps): JSX.Element {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(
    typeof window === "undefined" ? "dark" : getSystemTheme()
  );

  React.useEffect(() => {
    if (attribute !== "class") return;
    const nextResolved = applyThemeClass(theme);
    setResolvedTheme(nextResolved);
  }, [theme, attribute]);

  React.useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      const nextResolved = applyThemeClass("system");
      setResolvedTheme(nextResolved);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  const setTheme = React.useCallback((value: Theme) => {
    setThemeState(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dayflow-theme", value);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("dayflow-theme") as Theme | null;
    if (stored && (stored === "light" || stored === "dark" || stored === "system")) {
      setThemeState(stored);
      const nextResolved = applyThemeClass(stored);
      setResolvedTheme(nextResolved);
    } else {
      setThemeState(defaultTheme);
      const nextResolved = applyThemeClass(defaultTheme);
      setResolvedTheme(nextResolved);
    }
  }, [defaultTheme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}