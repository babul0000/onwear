'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Info, Menu } from 'lucide-react';

interface AdminHeaderProps {
  pageTitle: string;
  onOpenSidebar?: () => void;
}

export default function AdminHeader({ pageTitle, onOpenSidebar }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 select-none">
      <div className="flex items-center gap-3 sm:gap-4">
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 lg:hidden cursor-pointer"
            aria-label="Toggle admin sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h2 className="text-xs font-black text-zinc-950 uppercase tracking-widest truncate">{pageTitle}</h2>
        <div className="hidden sm:flex items-center gap-2 text-[9px] font-bold text-zinc-400">
          <span>System:</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
          <span className="text-emerald-600 font-extrabold uppercase tracking-wide">Online</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-1.5">
          <button className="h-8 w-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer">
            <Bell className="h-3.5 w-3.5" />
          </button>
          <button className="h-8 w-8 rounded-full border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer">
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <Link 
          href="/"
          className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-[10px] font-extrabold tracking-wider uppercase text-zinc-700 bg-white hover:bg-zinc-50 transition-all shadow-xs shrink-0"
        >
          View Shop
        </Link>
      </div>
    </header>
  );
}
