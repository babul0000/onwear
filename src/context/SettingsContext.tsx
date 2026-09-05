'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { API_URL } from '../config';

export interface StoreSetting {
  id: string;
  storeName: string;
  tagline: string;
  logoUrl: string | null;
  phone: string;
  email: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  bkashNumber: string;
  nagadNumber: string;
  whatsappNumber: string;
  shippingInsideDhaka: number;
  shippingOutsideDhaka: number;
  freeShippingMinAmount: number;
  announcementText: string | null;
  announcementEnabled: boolean;
  announcementLink: string | null;
  lookbookTitle: string | null;
  lookbookSubtitle: string | null;
  lookbookDescription: string | null;
  lookbookImageUrl: string | null;
  lookbookLinkUrl: string | null;
  updatedAt: string;
}

export interface SettingsContextType {
  settings: StoreSetting;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: StoreSetting = {
  id: 'default',
  storeName: 'ONWEAR',
  tagline: 'Unique way of elegance.',
  logoUrl: null,
  phone: '01603-742963',
  email: 'onwear.25@gmail.com',
  address: 'Khilkhet, Dhaka, Bangladesh, 1229',
  facebookUrl: 'https://facebook.com/onwear.bd',
  instagramUrl: 'https://instagram.com/onwear_bd',
  bkashNumber: '01603742963',
  nagadNumber: '01603742963',
  whatsappNumber: '8801603742963',
  shippingInsideDhaka: 80,
  shippingOutsideDhaka: 150,
  freeShippingMinAmount: 2500,
  announcementText: '🎉 Free Shipping on all orders above Tk 2,500! Use coupon ONWEAR10',
  announcementEnabled: true,
  announcementLink: '/products',
  lookbookTitle: 'THE SIGNATURE COLLECTION',
  lookbookSubtitle: 'THE DENIM OVERCOAT LOOK',
  lookbookDescription: 'Combine our signature Indigo Denim Overshirt with tailormade stretch pants for a modern casual lookup that fits both office work and weekend outings.',
  lookbookImageUrl: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1000',
  lookbookLinkUrl: '/products?category=denim',
  updatedAt: new Date().toISOString()
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<StoreSetting>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
