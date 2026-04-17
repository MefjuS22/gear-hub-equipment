import { create } from "zustand";

import { CartItem, Equipment } from "../types";

interface CartState {
  items: CartItem[];
  addToCart: (equipment: Equipment) => void;
  removeFromCart: (equipmentId: number) => void;
  updateQuantity: (equipmentId: number, amount: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addToCart: (equipment) =>
    set((state) => {
      const existing = state.items.find((item) => item.equipmentId === equipment.id);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.equipmentId === equipment.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            equipmentId: equipment.id,
            name: equipment.name,
            dailyRate: equipment.dailyRate,
            quantity: 1,
          },
        ],
      };
    }),
  removeFromCart: (equipmentId) =>
    set((state) => ({
      items: state.items.filter((item) => item.equipmentId !== equipmentId),
    })),
  updateQuantity: (equipmentId, amount) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.equipmentId === equipmentId ? { ...item, quantity: item.quantity + amount } : item,
        )
        .filter((item) => item.quantity > 0),
    })),
  clearCart: () => set({ items: [] }),
}));
