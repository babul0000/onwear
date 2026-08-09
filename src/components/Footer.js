import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} ShopNest E-Commerce. All rights reserved.</p>
        <p className="mt-2 text-zinc-400 text-xs">Built using Next.js 16 + React 19 + Express.js + PostgreSQL + Prisma.</p>
      </div>
    </footer>
  );
}
