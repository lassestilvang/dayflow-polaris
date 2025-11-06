"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";

type ToastContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export function ToastProvider({
  children
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [open, setOpen] = React.useState(false);

  return (
    <ToastContext.Provider value={{ open, setOpen }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {/* Minimal placeholder viewport */}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToastController(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastController must be used within ToastProvider");
  }
  return ctx;
}