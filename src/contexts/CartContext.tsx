import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../lib/supabase';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const isFreeFirstPortionProduct = (product: Product) =>
  /mayonnaise|piment/i.test(product.name);

export const getCartItemTotal = (item: CartItem) => {
  if (isFreeFirstPortionProduct(item.product)) {
    return Math.max(item.quantity - 1, 0) * 100;
  }
  return item.product.price * item.quantity;
};

export const getCartItemUnitPrice = (product: Product) =>
  isFreeFirstPortionProduct(product) ? 100 : product.price;

export const getCartItemLineLabel = (item: CartItem) => {
  if (isFreeFirstPortionProduct(item.product)) {
    if (item.quantity <= 1) return 'Free';
    const extras = item.quantity - 1;
    return `Free + ${extras} × 100 FCFA = ${(extras * 100).toLocaleString()} FCFA`;
  }
  return `${(item.product.price * item.quantity).toLocaleString()} FCFA`;
};

export const getCartItemUnitLabel = (product: Product) =>
  isFreeFirstPortionProduct(product) ? 'Free' : `${product.price.toLocaleString()} FCFA`;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalAmount = () => {
    return items.reduce(
      (total, item) => total + getCartItemTotal(item),
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
