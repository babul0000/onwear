'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';
import { CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

export interface CartItemType {
  id: string;
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  product: {
    id: string;
    name: string;
    slug?: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    image?: string;
    sku?: string;
    status?: string;
    isDeleted?: boolean;
    category?: { name: string };
  };
}

export interface CartType {
  id?: string;
  items: CartItemType[];
}

export interface WishlistItemType {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
    discountPrice?: number | null;
    image?: string;
  };
}

export interface WishlistType {
  id?: string;
  items: WishlistItemType[];
}

export interface CartContextType {
  cart: CartType | null;
  wishlist: WishlistType | null;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  fetchCart: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity?: number,
    size?: string,
    color?: string,
    productData?: any
  ) => Promise<{ success: boolean; message?: string }>;
  updateCartItem: (cartItemId: string, quantity: number) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (cartItemId: string) => Promise<{ success: boolean; message?: string }>;
  clearCart: () => Promise<{ success: boolean }>;
  addToWishlist: (productId: string, productData?: any) => Promise<{ success: boolean; message?: string }>;
  removeFromWishlist: (productId: string) => Promise<{ success: boolean; message?: string }>;
  isInWishlist: (productId: string) => boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'onwear_guest_cart';
const GUEST_WISHLIST_KEY = 'onwear_guest_wishlist';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();
  const [cart, setCart] = useState<CartType | null>(null);
  const [wishlist, setWishlist] = useState<WishlistType | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  // Load guest cart from localStorage
  const loadGuestCart = (): CartType => {
    if (typeof window === 'undefined') return { items: [] };
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to read guest cart from localStorage', e);
    }
    return { items: [] };
  };

  // Save guest cart to localStorage
  const saveGuestCart = (newCart: CartType) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
    } catch (e) {
      console.error('Failed to save guest cart to localStorage', e);
    }
  };

  // Load guest wishlist from localStorage
  const loadGuestWishlist = (): WishlistType => {
    if (typeof window === 'undefined') return { items: [] };
    try {
      const saved = localStorage.getItem(GUEST_WISHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to read guest wishlist', e);
    }
    return { items: [] };
  };

  const saveGuestWishlist = (newWishlist: WishlistType) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(newWishlist));
    } catch (e) {
      console.error('Failed to save guest wishlist', e);
    }
  };

  // Sync / Initialize on auth change
  useEffect(() => {
    if (token && user) {
      syncGuestCartToServer();
    } else {
      setCart(loadGuestCart());
      setWishlist(loadGuestWishlist());
    }
  }, [token, user]);

  const syncGuestCartToServer = async () => {
    if (!token) return;
    try {
      const guestCart = loadGuestCart();
      if (guestCart && guestCart.items && guestCart.items.length > 0) {
        for (const item of guestCart.items) {
          try {
            await fetch(`${API_URL}/cart/items`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color
              })
            });
          } catch (itemErr) {
            console.error('Error syncing guest item:', itemErr);
          }
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }
      await fetchCart();
      await fetchWishlist();
    } catch (err) {
      console.error('Failed to sync guest cart:', err);
      fetchCart();
      fetchWishlist();
    }
  };

  const fetchCart = async () => {
    if (!token) {
      setCart(loadGuestCart());
      return;
    }
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
    if (!token) {
      setWishlist(loadGuestWishlist());
      return;
    }
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

  const addToCart = async (
    productId: string,
    quantity: number = 1,
    size?: string,
    color?: string,
    productData?: any
  ) => {
    const cleanSize = size?.trim() || null;
    const cleanColor = color?.trim() || null;

    // GUEST USER FLOW
    if (!token || !user) {
      try {
        let prodInfo = productData;
        if (!prodInfo) {
          const res = await fetch(`${API_URL}/products/${productId}`);
          const data = await res.json();
          if (data.success) {
            prodInfo = data.data;
          }
        }

        const currentGuestCart = loadGuestCart();
        const existingIdx = currentGuestCart.items.findIndex(
          (it) => it.productId === productId && it.size === cleanSize && it.color === cleanColor
        );

        if (existingIdx > -1) {
          currentGuestCart.items[existingIdx].quantity += quantity;
        } else {
          currentGuestCart.items.push({
            id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            productId,
            quantity,
            size: cleanSize,
            color: cleanColor,
            product: {
              id: productId,
              name: prodInfo?.name || 'Product',
              price: prodInfo?.price || 0,
              discountPrice: prodInfo?.discountPrice ?? null,
              stock: prodInfo?.stock || 99,
              image: prodInfo?.image || '',
              sku: prodInfo?.sku || '',
              status: prodInfo?.status || 'ACTIVE',
              category: prodInfo?.category || { name: 'Apparel' }
            }
          });
        }

        saveGuestCart(currentGuestCart);
        setCart(currentGuestCart);
        showToast('Item added to cart!', 'success');
        return { success: true };
      } catch (err) {
        console.error('Error in guest addToCart:', err);
        showToast('Added to cart', 'success');
        return { success: true };
      }
    }

    // LOGGED IN USER FLOW
    try {
      const res = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity,
          size: cleanSize,
          color: cleanColor
        })
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

  const updateCartItem = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return { success: false };

    // GUEST FLOW
    if (!token || !user) {
      const currentGuestCart = loadGuestCart();
      const item = currentGuestCart.items.find((it) => it.id === cartItemId);
      if (item) {
        item.quantity = quantity;
        saveGuestCart(currentGuestCart);
        setCart(currentGuestCart);
        return { success: true };
      }
      return { success: false };
    }

    // LOGGED IN FLOW
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

  const removeFromCart = async (cartItemId: string) => {
    // GUEST FLOW
    if (!token || !user) {
      const currentGuestCart = loadGuestCart();
      currentGuestCart.items = currentGuestCart.items.filter((it) => it.id !== cartItemId);
      saveGuestCart(currentGuestCart);
      setCart(currentGuestCart);
      showToast('Item removed from cart', 'info');
      return { success: true };
    }

    // LOGGED IN FLOW
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
    // GUEST FLOW
    if (!token || !user) {
      const emptyCart = { items: [] };
      saveGuestCart(emptyCart);
      setCart(emptyCart);
      showToast('Shopping cart cleared', 'info');
      return { success: true };
    }

    // LOGGED IN FLOW
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCart({ items: [] });
        showToast('Shopping cart cleared', 'info');
        return { success: true };
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
    return { success: false };
  };

  const addToWishlist = async (productId: string, productData?: any) => {
    // GUEST FLOW
    if (!token || !user) {
      const currentWishlist = loadGuestWishlist();
      if (!currentWishlist.items.some((it) => it.productId === productId)) {
        currentWishlist.items.push({
          id: 'gwish_' + Date.now(),
          productId,
          product: productData
        });
        saveGuestWishlist(currentWishlist);
        setWishlist(currentWishlist);
        showToast('Saved to wishlist!', 'success');
      } else {
        showToast('Item is already in wishlist', 'info');
      }
      return { success: true };
    }

    // LOGGED IN FLOW
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

  const removeFromWishlist = async (productId: string) => {
    // GUEST FLOW
    if (!token || !user) {
      const currentWishlist = loadGuestWishlist();
      currentWishlist.items = currentWishlist.items.filter((it) => it.productId !== productId);
      saveGuestWishlist(currentWishlist);
      setWishlist(currentWishlist);
      showToast('Removed from wishlist', 'info');
      return { success: true };
    }

    // LOGGED IN FLOW
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

  const isInWishlist = (productId: string) => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some((item) => item.productId === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-zinc-200/90 bg-zinc-950 text-white px-5 py-3.5 shadow-2xl backdrop-blur-md animate-slideIn">
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          ) : (
            <ShoppingBag className="h-5 w-5 text-indigo-400 shrink-0" />
          )}
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
