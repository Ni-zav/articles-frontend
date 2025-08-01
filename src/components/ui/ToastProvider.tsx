"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info" | "warning";
export interface Toast {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms
}

interface ToastContextValue {
  toasts: Toast[];
  show: (message: string, opts?: { type?: ToastType; duration?: number }) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, opts?: { type?: ToastType; duration?: number }) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = {
      id,
      message,
      type: opts?.type ?? "info",
      duration: opts?.duration ?? 3000,
    };
    setToasts((prev) => [...prev, toast]);
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration);
    }
  }, [remove]);

  const value = useMemo(() => ({ toasts, show, remove }), [toasts, show, remove]);

  return (
    <>
      <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
      {/* Toast viewport */}
      <div aria-live="polite" aria-atomic="true" className="fixed inset-x-0 top-2 z-50 flex flex-col items-center gap-2 px-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`w-full max-w-md rounded-md border px-4 py-3 shadow bg-white ${
              t.type === "success" ? "border-green-300" :
              t.type === "error" ? "border-red-300" :
              t.type === "warning" ? "border-yellow-300" : "border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`h-2 w-2 mt-2 rounded-full ${
                  t.type === "success" ? "bg-green-500" :
                  t.type === "error" ? "bg-red-500" :
                  t.type === "warning" ? "bg-yellow-500" : "bg-gray-400"
                }`}
              />
              <p className="text-sm text-gray-900">{t.message}</p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => remove(t.id)}
                className="ml-auto text-gray-500 hover:text-gray-700 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600 rounded"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}