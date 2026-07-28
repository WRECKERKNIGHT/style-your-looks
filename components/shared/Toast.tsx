"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

const typeStyles: Record<ToastType, { border: string; bg: string; dot: string }> = {
  success: { border: "border-olive/30", bg: "bg-olive/[0.06]", dot: "bg-olive" },
  error: { border: "border-burgundy/30", bg: "bg-burgundy/[0.06]", dot: "bg-burgundy" },
  info: { border: "border-amber/30", bg: "bg-amber/[0.06]", dot: "bg-amber" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-[9996] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const styles = typeStyles[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-4 border ${styles.border} ${styles.bg} backdrop-blur-md shadow-elegant-lg animate-slide-in-right cursor-pointer max-w-sm`}
              onClick={() => removeToast(toast.id)}
            >
              <div className={`w-2 h-2 rounded-full ${styles.dot} shrink-0`} />
              <p className="text-sm font-body text-espresso leading-snug">{toast.message}</p>
              <button
                className="ml-auto text-coffee/30 hover:text-coffee/60 transition-colors shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
