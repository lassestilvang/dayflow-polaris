"use client";

import { useRouter } from "next/navigation";

type TransitionOptions = {
  href: string;
};

export function withViewTransition(
  router: ReturnType<typeof useRouter>,
  { href }: TransitionOptions
): void {
  const isSupported =
    typeof document !== "undefined" &&
    "startViewTransition" in (document as Document & {
      startViewTransition?: (cb: () => void) => void;
    });

  if (isSupported && document.startViewTransition) {
    document.startViewTransition(() => {
      router.push(href);
    });
  } else {
    router.push(href);
  }
}