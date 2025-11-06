"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "./utils";

const SheetContext = React.createContext<{
  side: "left" | "right";
}>({ side: "left" });

export interface SheetProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  side?: "left" | "right";
}

export function Sheet({
  children,
  side = "left",
  ...props
}: SheetProps): JSX.Element {
  return (
    <DialogPrimitive.Root {...props}>
      <SheetContext.Provider value={{ side }}>{children}</SheetContext.Provider>
    </DialogPrimitive.Root>
  );
}

export const SheetTrigger = DialogPrimitive.Trigger;

export function SheetContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>): JSX.Element {
  const { side } = React.useContext(SheetContext);
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex h-full w-72 flex-col border-l border-border bg-background/95 p-4 shadow-soft backdrop-blur-xl",
          side === "left" ? "left-0 border-l-0 border-r" : "right-0",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const SheetClose = DialogPrimitive.Close;