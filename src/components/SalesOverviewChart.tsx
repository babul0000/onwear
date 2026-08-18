'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface SalesOverviewChartProps {
  revenue: number;
  orders: number;
}

export default function SalesOverviewChart({ revenue, orders }: SalesOverviewChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Side: Selling Chart Area */}
      <div className="lg:col-span-8 bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Selling Overview</span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl font-black text-zinc-950">${revenue.toFixed(2)}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>+25.02%</span>
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-medium">(Current session calculated)</span>
        </div>

        {/* SVG line area chart */}
        <div className="w-full relative h-48 bg-zinc-50/50 rounded-2xl overflow-hidden mt-2 border border-zinc-100 p-2">
          <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            <path 
              d="M0,120 Q50,70 100,100 T200,50 T300,110 T400,40 T500,90 L500,150 L0,150 Z" 
              fill="url(#chartGrad)" 
            />
            <path 
              d="M0,120 Q50,70 100,100 T200,50 T300,110 T400,40 T500,90" 
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-x-0 bottom-1.5 flex justify-between px-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
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
        {/* Visitor Stat */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Visitor</p>
          <div>
            <p className="text-2xl font-black text-zinc-950 mt-2">1,240</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">vs yesterday</p>
            <span className="text-[10px] font-extrabold text-red-500">-0.05%</span>
          </div>
        </div>

        {/* Product Seen Stat */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Product Seen</p>
          <div>
            <p className="text-2xl font-black text-zinc-950 mt-2">8,250</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">vs yesterday</p>
            <span className="text-[10px] font-extrabold text-red-500">-5.27%</span>
          </div>
        </div>

        {/* Order Stat */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Order</p>
          <div>
            <p className="text-2xl font-black text-zinc-950 mt-2">{orders}</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">vs yesterday</p>
            <span className="text-[10px] font-extrabold text-emerald-600">+12.05%</span>
          </div>
        </div>

        {/* Conversion Rate Stat */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Conversion</p>
          <div>
            <p className="text-2xl font-black text-zinc-950 mt-2">4.50%</p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">vs yesterday</p>
            <span className="text-[10px] font-extrabold text-emerald-600">+3.26%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
