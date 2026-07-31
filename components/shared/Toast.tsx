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
  success: { border: "border-aurum-600/30", bg: "bg-aurum-600/[0.06]", icon: CheckCircle, darkBg: "dark:bg-aurum-600/[0.12]" },
  error: { border: "border-nexus-500/30", bg: "bg-nexus-500/[0.06]", icon: AlertCircle, darkBg: "dark:bg-nexus-500/[0.12]" },
  info: { border: "border-aurum-500/30", bg: "bg-aurum-500/[0.06]", icon: Info, darkBg: "dark:bg-aurum-500/[0.12]" },
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
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 border ${config.border} ${config.bg} ${config.darkBg} backdrop-blur-md shadow-nexus-lg cursor-pointer max-w-sm rounded-sm dark:bg-cosmic-surface`}
                onClick={() => removeToast(toast.id)}
              >
                <Icon className={`w-4 h-4 shrink-0 ${
                  toast.type === "success" ? "text-aurum-600" : toast.type === "error" ? "text-nexus-400" : "text-aurum-500"
                }`} />
                <p className="flex-1 text-sm font-body text-nexus-800 dark:text-white leading-snug">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="flex items-center gap-1 text-xs font-body font-semibold text-aurum-500 hover:text-aurum-400 uppercase tracking-wider transition-colors shrink-0"
                  >
                    <Undo2 className="w-3 h-3" />
                    {toast.action.label}
                  </button>
                )}
                <button
                  className="text-nexus-400/30 hover:text-nexus-400/60 dark:text-cosmic-muted/30 dark:hover:text-cosmic-muted/60 transition-colors shrink-0"
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
