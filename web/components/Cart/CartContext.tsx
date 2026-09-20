'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { trackEvent } from '@/lib/events/client';
import type { Product } from '@/data/products';
import type { CartItem } from '@/lib/cart/types';

const STORAGE_KEY = 'khatore_cart';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  /** null when any line lacks an approved price — the drawer shows "Contact for pricing" rather than a partial/misleading total. */
  subtotal: number | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const hydrated = useRef(false);
  // Mirrors `items` synchronously (updated inside the same setItems
  // updater callback, not in a useEffect). A caller that adds an item
  // and immediately calls open() in the same synchronous handler would
  // otherwise have open()'s cart_viewed read the pre-update `items`
  // from its closure — React defers the re-render, so the component
  // hasn't seen the new state yet. This ref has no such delay.
  const itemsRef = useRef<CartItem[]>([]);

  // Hydrate from localStorage after mount only (avoids an SSR/client
  // markup mismatch — the server always renders an empty cart).
  useEffect(() => {
    const stored = readStoredCart();
    itemsRef.current = stored;
    setItems(stored);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be full or blocked (private browsing) — the cart
      // still works for the session, it just won't persist a reload.
    }
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      const next = existing
        ? prev.map((i) => (i.productId === product.productId ? { ...i, quantity: i.quantity + quantity } : i))
        : [
            ...prev,
            {
              productId: product.productId,
              slug: product.slug,
              name: product.name,
              image: product.image,
              format: product.format,
              price: product.price,
              priceNote: product.priceNote,
              quantity,
            },
          ];
      itemsRef.current = next;
      return next;
    });
    trackEvent('add_to_cart', {
      product_id: product.productId,
      product_name: product.name,
      metadata: { quantity },
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    const removed = itemsRef.current.find((i) => i.productId === productId);
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      itemsRef.current = next;
      return next;
    });
    if (removed) {
      trackEvent('remove_from_cart', {
        product_id: removed.productId,
        product_name: removed.name,
        metadata: { quantity: removed.quantity },
      });
    }
  }, []);

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) => {
        const next = prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
        itemsRef.current = next;
        return next;
      });
    },
    [removeItem],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    trackEvent('cart_viewed', {
      metadata: { item_count: itemsRef.current.reduce((n, i) => n + i.quantity, 0) },
    });
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const itemCount = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const subtotal = useMemo(() => {
    if (items.length === 0) return 0;
    if (items.some((i) => !i.price)) return null;
    return items.reduce((sum, i) => sum + (i.price?.amount ?? 0) * i.quantity, 0);
  }, [items]);

  const value: CartContextValue = {
    items,
    itemCount,
    subtotal,
    isOpen,
    open,
    close,
    addItem,
    removeItem,
    setQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
