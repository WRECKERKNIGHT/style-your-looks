"use client";

import { motion, AnimatePresence } from "framer-motion";
import { create } from "zustand";
import { X, CheckCircle, AlertCircle, Info, Undo2 } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, action?: ToastAction) => string;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = "info", action) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { id, message, type, action }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
    return id;
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

const typeConfig: Record<ToastType, { border: string; bg: string; icon: typeof CheckCircle; darkBg: string }> = {
  success: { border: "border-olive/30", bg: "bg-olive/[0.06]", icon: CheckCircle, darkBg: "dark:bg-olive/[0.12]" },
  error: { border: "border-burgundy/30", bg: "bg-burgundy/[0.06]", icon: AlertCircle, darkBg: "dark:bg-burgundy/[0.12]" },
  info: { border: "border-amber/30", bg: "bg-amber/[0.06]", icon: Info, darkBg: "dark:bg-amber/[0.12]" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-[9996] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = typeConfig[toast.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 border ${config.border} ${config.bg} ${config.darkBg} backdrop-blur-md shadow-elegant-lg cursor-pointer max-w-sm rounded-sm dark:bg-dark-surface`}
                onClick={() => removeToast(toast.id)}
              >
                <Icon className={`w-4 h-4 shrink-0 ${
                  toast.type === "success" ? "text-olive" : toast.type === "error" ? "text-burgundy" : "text-amber"
                }`} />
                <p className="flex-1 text-sm font-body text-espresso dark:text-dark-text leading-snug">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="flex items-center gap-1 text-xs font-body font-semibold text-amber hover:text-amber-light uppercase tracking-wider transition-colors shrink-0"
                  >
                    <Undo2 className="w-3 h-3" />
                    {toast.action.label}
                  </button>
                )}
                <button
                  className="text-coffee/30 hover:text-coffee/60 dark:text-dark-muted/30 dark:hover:text-dark-muted/60 transition-colors shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}

export function useToast() {
  const addToast = useToastStore((s) => s.addToast);
  return { addToast };
}
