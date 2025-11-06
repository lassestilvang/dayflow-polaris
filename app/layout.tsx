import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "../components/theme/theme-provider";
import { ToastProvider } from "../components/ui/toast";

export const metadata: Metadata = {
  title: "Dayflow Polaris",
  description: "Unified, modern planner for high-signal weeks.",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
    { media: "(prefers-color-scheme: light)", color: "#020817" }
  ]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider defaultTheme="system" attribute="class">
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}