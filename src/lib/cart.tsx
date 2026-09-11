import * as React from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  imageKey: string;
  unitPrice: number;
  currency: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const STORAGE_KEY = "nexus-cart-v1";
const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      // ignore malformed stored carts
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = React.useMemo<CartContextValue>(() => {
    const count = lines.reduce((total, line) => total + line.quantity, 0);
    const subtotal = lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);
    return {
      lines,
      count,
      subtotal,
      add: (line, quantity = 1) =>
        setLines((current) => {
          const existing = current.find((item) => item.productId === line.productId);
          if (existing) {
            return current.map((item) =>
              item.productId === line.productId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          }
          return [...current, { ...line, quantity }];
        }),
      setQuantity: (productId, quantity) =>
        setLines((current) =>
          quantity <= 0
            ? current.filter((item) => item.productId !== productId)
            : current.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
        ),
      remove: (productId) =>
        setLines((current) => current.filter((item) => item.productId !== productId)),
      clear: () => setLines([]),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [lines, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
