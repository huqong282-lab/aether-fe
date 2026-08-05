import { create } from "zustand";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface UiState {
  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modal state
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Toast state
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id"> & { id?: string }) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  // Sidebar state
  isSidebarOpen: false,

  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  setSidebarOpen: (open) =>
    set({
      isSidebarOpen: open,
    }),

  // Modal state
  activeModal: null,
  modalData: null,

  openModal: (modalId, data = undefined) =>
    set({
      activeModal: modalId,
      modalData: data ?? null,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      modalData: null,
    }),

  // Toast state
  toasts: [],

  addToast: (toastData) => {
    const id = toastData.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = {
      id,
      type: toastData.type,
      message: toastData.message,
      duration: toastData.duration ?? 4000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Re-export as useUiState for backwards compatibility
export const useUiState = useUiStore;