'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SalesOverviewChartProps {
  revenue: number;
  orders: number;
}

export default function SalesOverviewChart({ revenue, orders }: SalesOverviewChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-zinc-300">
      
      {/* Left Side: Selling Chart Area */}
      <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4">
        <div>
          <span className="text-xs font-black text-zinc-500 uppercase tracking-widest block">Sales Overview</span>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-3xl font-black text-white">৳{revenue.toLocaleString()}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
              <ArrowUpRight className="h-3 w-3" />
              <span>+25.02%</span>
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1 block">(Current session calculated)</span>
        </div>

        {/* SVG line area chart */}
        <div className="w-full relative h-48 bg-zinc-950/40 rounded-2xl overflow-hidden mt-2 border border-zinc-900 p-2 shadow-inner">
          <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            {/* Grid lines */}
            <line x1="0" y1="30" x2="500" y2="30" stroke="#18181b" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="0" y1="60" x2="500" y2="60" stroke="#18181b" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="0" y1="90" x2="500" y2="90" stroke="#18181b" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="0" y1="120" x2="500" y2="120" stroke="#18181b" strokeWidth="1" strokeDasharray="4,4" />

            {/* Chart Area */}
            <path 
              d="M0,130 Q50,80 100,110 T200,60 T300,120 T400,50 T500,100 L500,150 L0,150 Z" 
              fill="url(#chartGrad)" 
            />
            {/* Chart Line */}
            <path 
              d="M0,130 Q50,80 100,110 T200,60 T300,120 T400,50 T500,100" 
              fill="none" 
              stroke="#8b5cf6" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              className="drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-2 flex justify-between px-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            <span>00h</span>
            <span>06h</span>
            <span>12h</span>
            <span>18h</span>
            <span>24h</span>
          </div>
        </div>
      </div>

      {/* Right Side: Four Statistics Blocks */}
      <div className="lg:col-span-4 grid grid-cols-2 gap-4">
        {/* Visitors */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Visitors</p>
          <div>
            <p className="text-2xl font-black text-white mt-2">1,240</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">vs yesterday</p>
            <span className="text-[10px] font-black text-red-400 inline-flex items-center gap-0.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mt-1">
              <ArrowDownRight className="h-3 w-3" />
              <span>-0.05%</span>
            </span>
          </div>
        </div>

        {/* Product Views */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Product Views</p>
          <div>
            <p className="text-2xl font-black text-white mt-2">8,250</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">vs yesterday</p>
            <span className="text-[10px] font-black text-red-400 inline-flex items-center gap-0.5 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mt-1">
              <ArrowDownRight className="h-3 w-3" />
              <span>-5.27%</span>
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Orders</p>
          <div>
            <p className="text-2xl font-black text-white mt-2">{orders}</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">vs yesterday</p>
            <span className="text-[10px] font-black text-emerald-400 inline-flex items-center gap-0.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>+12.05%</span>
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Conversion</p>
          <div>
            <p className="text-2xl font-black text-white mt-2">4.50%</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">vs yesterday</p>
            <span className="text-[10px] font-black text-emerald-400 inline-flex items-center gap-0.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mt-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>+3.26%</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
