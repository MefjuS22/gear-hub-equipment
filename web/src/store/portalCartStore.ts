import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const PORTAL_CART_STORAGE_KEY = "gearhub-portal-cart";

export type CartLine = {
  equipmentId: number;
  name: string;
  dailyRate: number;
  quantity: number;
};

type PortalCartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQuantity: (equipmentId: number, quantity: number) => void;
  remove: (equipmentId: number) => void;
  clear: () => void;
};

export const usePortalCartStore = create<PortalCartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) => {
        const q = line.quantity ?? 1;
        set((state) => {
          const i = state.lines.findIndex(
            (l) => l.equipmentId === line.equipmentId,
          );
          if (i >= 0) {
            const next = [...state.lines];
            next[i] = {
              ...next[i],
              quantity: next[i].quantity + q,
            };
            return { lines: next };
          }
          return { lines: [...state.lines, { ...line, quantity: q }] };
        });
      },
      setQuantity: (equipmentId, quantity) => {
        if (quantity < 1) {
          set((state) => ({
            lines: state.lines.filter((l) => l.equipmentId !== equipmentId),
          }));
          return;
        }
        set((state) => ({
          lines: state.lines.map((l) =>
            l.equipmentId === equipmentId ? { ...l, quantity } : l,
          ),
        }));
      },
      remove: (equipmentId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.equipmentId !== equipmentId),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: PORTAL_CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      version: 1,
    },
  ),
);

export function useCart() {
  const lines = usePortalCartStore((s) => s.lines);
  const add = usePortalCartStore((s) => s.add);
  const setQuantity = usePortalCartStore((s) => s.setQuantity);
  const remove = usePortalCartStore((s) => s.remove);
  const clear = usePortalCartStore((s) => s.clear);
  return { lines, add, setQuantity, remove, clear };
}
