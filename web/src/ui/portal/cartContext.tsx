import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  equipmentId: number;
  name: string;
  dailyRate: number;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setQuantity: (equipmentId: number, quantity: number) => void;
  remove: (equipmentId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const q = line.quantity ?? 1;
      setLines((prev) => {
        const i = prev.findIndex((l) => l.equipmentId === line.equipmentId);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], quantity: next[i].quantity + q };
          return next;
        }
        return [...prev, { ...line, quantity: q }];
      });
    },
    [],
  );

  const setQuantity = useCallback((equipmentId: number, quantity: number) => {
    if (quantity < 1) {
      setLines((prev) => prev.filter((l) => l.equipmentId !== equipmentId));
      return;
    }
    setLines((prev) =>
      prev.map((l) => (l.equipmentId === equipmentId ? { ...l, quantity } : l)),
    );
  }, []);

  const remove = useCallback((equipmentId: number) => {
    setLines((prev) => prev.filter((l) => l.equipmentId !== equipmentId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, add, setQuantity, remove, clear }),
    [lines, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
