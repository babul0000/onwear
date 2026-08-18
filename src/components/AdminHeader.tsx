'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Info } from 'lucide-react';

interface AdminHeaderProps {
  pageTitle: string;
}

export default function AdminHeader({ pageTitle }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between px-8 shrink-0 select-none">
      <div className="flex items-center gap-4">
        <h2 className="text-xs font-black text-white uppercase tracking-widest">{pageTitle}</h2>
        <div className="hidden sm:flex items-center gap-2 text-[9px] font-bold text-zinc-500">
          <span>System Status:</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
          <span className="text-emerald-500 font-extrabold uppercase tracking-wide">Online</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <button className="h-8 w-8 rounded-full border border-zinc-900 hover:bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <Bell className="h-3.5 w-3.5" />
          </button>
          <button className="h-8 w-8 rounded-full border border-zinc-900 hover:bg-zinc-900/50 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <Link 
          href="/"
          className="rounded-full border border-zinc-800 px-4 py-1.5 text-[10px] font-extrabold tracking-wider uppercase text-zinc-300 bg-zinc-900/40 hover:bg-zinc-900 hover:text-white transition-all shadow-md shrink-0"
        >
          View Shop
        </Link>
      </div>
    </header>
  );
}
