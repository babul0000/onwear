'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Info } from 'lucide-react';

interface AdminHeaderProps {
  pageTitle: string;
}

export default function AdminHeader({ pageTitle }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-zinc-200/80 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-extrabold text-zinc-950 uppercase tracking-wider">{pageTitle}</h2>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-zinc-400">
          <span>System Status:</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-600 font-bold uppercase">Online</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="h-8 w-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 transition-colors shadow-sm cursor-pointer">
            <Bell className="h-3.5 w-3.5" />
          </button>
          <button className="h-8 w-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 transition-colors shadow-sm cursor-pointer">
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <Link 
          href="/"
          className="rounded-full border border-zinc-200 px-4 py-1.5 text-[11px] font-black tracking-wider uppercase text-zinc-700 bg-white hover:bg-zinc-50 transition-all shadow-sm"
        >
          View Shop
        </Link>
      </div>
    </header>
  );
}
