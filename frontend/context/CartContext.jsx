'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  subscribeToCart,
  addToCart as fsAddToCart,
  removeFromCart as fsRemoveFromCart,
  clearCart as fsClearCart,
} from '@/lib/firestore';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user }           = useAuth();
  const [items, setItems]  = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── Real-time cart sync via Firestore onSnapshot ─────────────────────────
  useEffect(() => {
    if (!user?.uid) {
      // Guest: load from localStorage
      try {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setItems(localCart);
      } catch {
        setItems([]);
      }
      return;
    }

    setLoading(true);
    // subscribeToCart returns an unsubscribe function
    const unsubscribe = subscribeToCart(user.uid, (enrichedItems) => {
      setItems(enrichedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // ─── Add to Cart ──────────────────────────────────────────────────────────
  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!user?.uid) {
      // Guest cart in localStorage
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing  = localCart.find(i => i.productId === productId);
      if (existing) existing.quantity = quantity;
      else localCart.push({ productId, quantity });
      localStorage.setItem('cart', JSON.stringify(localCart));
      setItems(localCart);
      return;
    }
    await fsAddToCart(user.uid, productId, quantity);
    // State is updated automatically by the onSnapshot listener
  }, [user?.uid]);

  // ─── Remove from Cart ─────────────────────────────────────────────────────
  const removeFromCart = useCallback(async (productId) => {
    if (!user?.uid) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]')
        .filter(i => i.productId !== productId);
      localStorage.setItem('cart', JSON.stringify(localCart));
      setItems(localCart);
      return;
    }
    await fsRemoveFromCart(user.uid, productId);
  }, [user?.uid]);

  // ─── Update Quantity ──────────────────────────────────────────────────────
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    if (!user?.uid) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const item = localCart.find(i => i.productId === productId);
      if (item) item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(localCart));
      setItems([...localCart]);
      return;
    }
    await fsAddToCart(user.uid, productId, quantity);
  }, [user?.uid, removeFromCart]);

  // ─── Clear Cart ───────────────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (!user?.uid) {
      localStorage.removeItem('cart');
      setItems([]);
      return;
    }
    await fsClearCart(user.uid);
  }, [user?.uid]);

  // ─── Derived Values ───────────────────────────────────────────────────────
  const cartCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const cartTotal = items.reduce((sum, i) => {
    const price = i.product ? (i.product.salePrice || i.product.price || 0) : 0;
    return sum + price * (i.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider value={{
      items, loading, cartCount, cartTotal,
      addToCart, removeFromCart, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
