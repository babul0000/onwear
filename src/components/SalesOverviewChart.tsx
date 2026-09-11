'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Users, Eye, ShoppingCart, Percent } from 'lucide-react';
import { formatPrice } from '../utils/format';

export interface AnalyticsMetrics {
  totalUsers?: number;
  totalProducts?: number;
  totalOrders: number;
  totalRevenue: number;
  visitors: {
    total: number;
    today: number;
    yesterday: number;
    growthPercent: number;
  };
  productViews: {
    total: number;
    today: number;
    yesterday: number;
    growthPercent: number;
  };
  ordersComparison: {
    total: number;
    today: number;
    yesterday: number;
    growthPercent: number;
  };
  revenueComparison: {
    total: number;
    today: number;
    yesterday: number;
    growthPercent: number;
  };
  conversionRate: {
    total: number;
    today: number;
    yesterday: number;
    growthPercent: number;
  };
}

export interface ChartDataPoint {
  label: string;
  date: string;
  revenue: number;
  orders: number;
}

interface SalesOverviewChartProps {
  metrics?: AnalyticsMetrics;
  chartData?: ChartDataPoint[];
}

export default function SalesOverviewChart({ metrics, chartData = [] }: SalesOverviewChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ point: ChartDataPoint; x: number; y: number } | null>(null);

  const revenue = metrics?.totalRevenue ?? 0;
  const revenueGrowth = metrics?.revenueComparison?.growthPercent ?? 0;

  // Build SVG path coordinates from real data points
  const pointsCount = Math.max(chartData.length, 1);
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 100);
  const svgWidth = 500;
  const svgHeight = 150;
  const padX = 30;
  const padTop = 20;
  const padBottom = 30;
  const usableW = svgWidth - padX * 2;
  const usableH = svgHeight - padTop - padBottom;

  const points = chartData.map((d, index) => {
    const x = chartData.length > 1 ? padX + (index / (chartData.length - 1)) * usableW : svgWidth / 2;
    const y = padTop + usableH - (d.revenue / maxRevenue) * usableH;
    return { ...d, x, y };
  });

  // Construct SVG Bezier Smooth Curve
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    if (points.length === 1) {
      linePath = `M ${points[0].x - 50} ${points[0].y} L ${points[0].x + 50} ${points[0].y}`;
      areaPath = `M ${points[0].x - 50} ${points[0].y} L ${points[0].x + 50} ${points[0].y} L ${points[0].x + 50} ${svgHeight - padBottom} L ${points[0].x - 50} ${svgHeight - padBottom} Z`;
    } else {
      linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
      }
      areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - padBottom} L ${points[0].x} ${svgHeight - padBottom} Z`;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-zinc-600">
      {/* Left Side: Real Dynamic Sales Area Chart */}
      <div className="lg:col-span-8 bg-white border border-zinc-200/80 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block">Sales Overview</span>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-3xl font-black text-zinc-950">{formatPrice(revenue)}</span>
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-xs font-black border shadow-xs ${
                revenueGrowth >= 0
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}
            >
              {revenueGrowth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>
                {revenueGrowth >= 0 ? '+' : ''}
                {revenueGrowth}%
              </span>
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1 block">
            (Real-time live transactions calculated from database)
          </span>
        </div>

        {/* Dynamic SVG Area Chart */}
        <div className="w-full relative h-48 bg-zinc-50/50 rounded-2xl overflow-hidden mt-2 border border-zinc-100 p-2 shadow-inner">
          <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1={padTop} x2={svgWidth} y2={padTop} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="0" y1={padTop + usableH * 0.33} x2={svgWidth} y2={padTop + usableH * 0.33} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="0" y1={padTop + usableH * 0.66} x2={svgWidth} y2={padTop + usableH * 0.66} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="0" y1={svgHeight - padBottom} x2={svgWidth} y2={svgHeight - padBottom} stroke="#e4e4e7" strokeWidth="1" />

            {/* Real Area Gradient */}
            {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}

            {/* Real Line Curve */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
            {points.map((p, idx) => (
              <g key={idx} className="cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  className="transition-all hover:r-6"
                  onMouseEnter={() => setHoveredPoint({ point: p, x: p.x, y: p.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* Interactive Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute z-10 pointer-events-none -translate-x-1/2 -translate-y-full bg-zinc-950 text-white px-2.5 py-1.5 rounded-xl shadow-xl border border-zinc-800 text-[10px] font-mono flex flex-col gap-0.5"
              style={{
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: `${(hoveredPoint.y / svgHeight) * 100 - 4}%`
              }}
            >
              <div className="font-bold text-zinc-300">{hoveredPoint.point.date}</div>
              <div className="font-black text-emerald-400">{formatPrice(hoveredPoint.point.revenue)}</div>
              <div className="text-zinc-400 text-[9px]">{hoveredPoint.point.orders} orders</div>
            </div>
          )}

          {/* Dynamic 7-Day / Timeline Labels */}
          <div className="absolute inset-x-0 bottom-2 flex justify-between px-6 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
            {chartData.length > 0 ? (
              chartData.map((d, i) => <span key={i}>{d.label}</span>)
            ) : (
              <>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Four 100% Real Live Metric Blocks */}
      <div className="lg:col-span-4 grid grid-cols-2 gap-4">
        {/* 1. Real Visitors */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Visitors</p>
            <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-950 mt-2">
              {metrics?.visitors?.total.toLocaleString() ?? 0}
            </p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
              Today: {metrics?.visitors?.today ?? 0}
            </p>
            <span
              className={`text-[10px] font-black inline-flex items-center gap-0.5 border px-2 py-0.5 rounded-full mt-1 ${
                (metrics?.visitors?.growthPercent ?? 0) >= 0
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  : 'text-rose-600 bg-rose-50 border-rose-100'
              }`}
            >
              {(metrics?.visitors?.growthPercent ?? 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>
                {(metrics?.visitors?.growthPercent ?? 0) >= 0 ? '+' : ''}
                {metrics?.visitors?.growthPercent ?? 0}%
              </span>
            </span>
          </div>
        </div>

        {/* 2. Real Product Views */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Product Views</p>
            <div className="h-6 w-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Eye className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-950 mt-2">
              {metrics?.productViews?.total.toLocaleString() ?? 0}
            </p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
              Today: {metrics?.productViews?.today ?? 0}
            </p>
            <span
              className={`text-[10px] font-black inline-flex items-center gap-0.5 border px-2 py-0.5 rounded-full mt-1 ${
                (metrics?.productViews?.growthPercent ?? 0) >= 0
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  : 'text-rose-600 bg-rose-50 border-rose-100'
              }`}
            >
              {(metrics?.productViews?.growthPercent ?? 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>
                {(metrics?.productViews?.growthPercent ?? 0) >= 0 ? '+' : ''}
                {metrics?.productViews?.growthPercent ?? 0}%
              </span>
            </span>
          </div>
        </div>

        {/* 3. Real Orders */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Orders</p>
            <div className="h-6 w-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-950 mt-2">
              {metrics?.ordersComparison?.total.toLocaleString() ?? 0}
            </p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
              Today: {metrics?.ordersComparison?.today ?? 0}
            </p>
            <span
              className={`text-[10px] font-black inline-flex items-center gap-0.5 border px-2 py-0.5 rounded-full mt-1 ${
                (metrics?.ordersComparison?.growthPercent ?? 0) >= 0
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  : 'text-rose-600 bg-rose-50 border-rose-100'
              }`}
            >
              {(metrics?.ordersComparison?.growthPercent ?? 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>
                {(metrics?.ordersComparison?.growthPercent ?? 0) >= 0 ? '+' : ''}
                {metrics?.ordersComparison?.growthPercent ?? 0}%
              </span>
            </span>
          </div>
        </div>

        {/* 4. Real Conversion Rate */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">Conversion</p>
            <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-950 mt-2">
              {metrics?.conversionRate?.total ?? 0}%
            </p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
              vs yesterday: {metrics?.conversionRate?.yesterday ?? 0}%
            </p>
            <span
              className={`text-[10px] font-black inline-flex items-center gap-0.5 border px-2 py-0.5 rounded-full mt-1 ${
                (metrics?.conversionRate?.growthPercent ?? 0) >= 0
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  : 'text-rose-600 bg-rose-50 border-rose-100'
              }`}
            >
              {(metrics?.conversionRate?.growthPercent ?? 0) >= 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>
                {(metrics?.conversionRate?.growthPercent ?? 0) >= 0 ? '+' : ''}
                {metrics?.conversionRate?.growthPercent ?? 0}%
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
