'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import WhatsAppButton from './WhatsAppButton';

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="min-h-full flex flex-col">
      {!isAuthPage && !isAdminPage && <Navbar />}
      <main className={`flex-1 flex flex-col ${!isAdminPage ? 'pb-16 md:pb-0' : ''}`}>{children}</main>
      {!isAuthPage && !isAdminPage && <Footer />}
      {!isAdminPage && <WhatsAppButton />}
      <CartDrawer />
    </div>
  );
}

