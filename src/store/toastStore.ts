import { create } from "zustand";

export type ToastType = "normal" | "success" | "warn" | "error";

export type ToastMessage = {
  id: string;
  type: ToastType;
  message: string;
  timeoutMs?: number; // default 3000
  createdAt: number;
};

type ToastStore = {
  toasts: ToastMessage[];
  show: (message: string, type?: ToastType, timeoutMs?: number) => string; // returns id
  dismiss: (id: string) => void;
  clear: () => void;
};

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  show: (message: string, type: ToastType = "normal", timeoutMs: number = 3000) => {
    const id = genId();
    const toast: ToastMessage = { id, type, message, timeoutMs, createdAt: Date.now() };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    if (timeoutMs && timeoutMs > 0) {
      setTimeout(() => {
        get().dismiss(id);
      }, timeoutMs);
    }
    return id;
  },
  dismiss: (id: string) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
