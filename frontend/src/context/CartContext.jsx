import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user || user.role !== 'CUSTOMER' || !user.id) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/cart/${user.id}`);
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (menuItemId, quantity = 1) => {
    if (!user || user.role !== 'CUSTOMER') {
      alert('Please log in as a customer to add items to cart.');
      return false;
    }
    try {
      const res = await api.post(`/cart/${user.id}/items`, { menuItemId, quantity });
      setCart(res.data);
      return true;
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart.');
      return false;
    }
  };

  const updateQuantity = async (cartItemId, menuItemId, quantity) => {
    if (!user) return;
    try {
      const res = await api.put(`/cart/${user.id}/items/${cartItemId}`, { menuItemId, quantity });
      setCart(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity.');
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user) return;
    try {
      const res = await api.delete(`/cart/${user.id}/items/${cartItemId}`);
      setCart(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item.');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await api.delete(`/cart/${user.id}`);
      setCart({ cartItems: [], totalAmount: 0 });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear cart.');
    }
  };

  const itemCount = cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
