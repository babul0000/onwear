'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    if (token && user) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart(null);
      setWishlist(null);
    }
  }, [token, user]);

  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  };

  const fetchWishlist = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(data.data);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      showToast('Please login to add items to cart', 'error');
      return { success: false };
    }
    try {
      const res = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart();
        showToast('Item added to cart successfully!', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to add item to cart', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      showToast('Failed to connect to server', 'error');
      return { success: false, message: 'Server communication error' };
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/cart/items/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart();
        showToast('Cart updated successfully!', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to update quantity', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      return { success: false, message: 'Server communication error' };
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart();
        showToast('Item removed from cart', 'info');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to remove item', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      return { success: false, message: 'Server communication error' };
    }
  };

  const clearCart = async () => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCart({ ...cart, items: [] });
        showToast('Shopping cart cleared', 'info');
        return { success: true };
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
    return { success: false };
  };

  const addToWishlist = async (productId) => {
    if (!token) {
      showToast('Please login to add items to wishlist', 'error');
      return { success: false };
    }
    try {
      const res = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        await fetchWishlist();
        showToast('Added to wishlist!', 'success');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to add to wishlist', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      showToast('Failed to connect to server', 'error');
      return { success: false, message: 'Server communication error' };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        await fetchWishlist();
        showToast('Removed from wishlist', 'info');
        return { success: true };
      } else {
        showToast(data.message || 'Failed to remove', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      return { success: false, message: 'Server communication error' };
    }
  };

  const isInWishlist = (productId) => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some((item) => item.productId === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        fetchCart,
        fetchWishlist,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        showToast
      }}
    >
      {children}

      {/* Global Toast Notification Banner */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-md animate-slideIn">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
          )}
          <span className="text-sm font-semibold text-zinc-800">{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
