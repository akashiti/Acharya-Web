'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync cart from backend when user is logged in
  const fetchCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setItems(res.data.data || []);
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (token) fetchCart();
    else setItems([]);
  }, [token, fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!token) {
      // Use local storage for guests
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = localCart.find(i => i.productId === productId);
      if (existing) existing.quantity = quantity;
      else localCart.push({ productId, quantity });
      localStorage.setItem('cart', JSON.stringify(localCart));
      setItems(localCart);
      return;
    }
    try {
      await api.post('/cart', { productId, quantity });
      await fetchCart();
    } catch (err) {
      throw err;
    }
  }, [token, fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]').filter(i => i.productId !== productId);
      localStorage.setItem('cart', JSON.stringify(localCart));
      setItems(localCart);
      return;
    }
    await api.delete(`/cart/${productId}`);
    await fetchCart();
  }, [token, fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    if (!token) {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const item = localCart.find(i => i.productId === productId);
      if (item) item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(localCart));
      setItems(localCart);
      return;
    }
    await api.post('/cart', { productId, quantity });
    await fetchCart();
  }, [token, fetchCart, removeFromCart]);

  const clearCart = useCallback(async () => {
    if (!token) {
      localStorage.removeItem('cart');
      setItems([]);
      return;
    }
    await api.delete('/cart/clear');
    setItems([]);
  }, [token]);

  const cartCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const cartTotal = items.reduce((sum, i) => {
    const price = i.product ? (i.product.salePrice || i.product.price) : 0;
    return sum + price * (i.quantity || 1);
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
