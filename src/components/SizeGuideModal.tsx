'use client';

import React, { useState } from 'react';
import { X, Ruler, Check, HelpCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string;
}

type Unit = 'in' | 'cm';

const SIZE_DATA = {
  tshirt: {
    title: 'T-Shirts & Polos',
    headers: ['Size', 'Chest', 'Length', 'Sleeve'],
    rows: {
      in: [
        { size: 'S', chest: '36 – 38', length: '27.0', sleeve: '8.0' },
        { size: 'M', chest: '39 – 41', length: '28.0', sleeve: '8.5' },
        { size: 'L', chest: '42 – 44', length: '29.0', sleeve: '9.0' },
        { size: 'XL', chest: '45 – 47', length: '30.0', sleeve: '9.5' },
        { size: 'XXL', chest: '48 – 50', length: '31.0', sleeve: '10.0' },
      ],
      cm: [
        { size: 'S', chest: '91 – 96', length: '68.5', sleeve: '20.3' },
        { size: 'M', chest: '99 – 104', length: '71.1', sleeve: '21.5' },
        { size: 'L', chest: '106 – 111', length: '73.6', sleeve: '22.8' },
        { size: 'XL', chest: '114 – 119', length: '76.2', sleeve: '24.1' },
        { size: 'XXL', chest: '121 – 127', length: '78.7', sleeve: '25.4' },
      ],
    }
  },
  shirt: {
    title: 'Shirts & Overshirts',
    headers: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: {
      in: [
        { size: 'S (38)', chest: '38.0', length: '28.5', shoulder: '17.5', sleeve: '24.5' },
        { size: 'M (40)', chest: '40.0', length: '29.5', shoulder: '18.0', sleeve: '25.0' },
        { size: 'L (42)', chest: '42.0', length: '30.5', shoulder: '18.5', sleeve: '25.5' },
        { size: 'XL (44)', chest: '44.0', length: '31.5', shoulder: '19.2', sleeve: '26.0' },
        { size: 'XXL (46)', chest: '46.0', length: '32.0', shoulder: '20.0', sleeve: '26.5' },
      ],
      cm: [
        { size: 'S (38)', chest: '96.5', length: '72.4', shoulder: '44.5', sleeve: '62.2' },
        { size: 'M (40)', chest: '101.6', length: '74.9', shoulder: '45.7', sleeve: '63.5' },
        { size: 'L (42)', chest: '106.7', length: '77.5', shoulder: '47.0', sleeve: '64.8' },
        { size: 'XL (44)', chest: '111.8', length: '80.0', shoulder: '48.8', sleeve: '66.0' },
        { size: 'XXL (46)', chest: '116.8', length: '81.3', shoulder: '50.8', sleeve: '67.3' },
      ],
    }
  },
  pants: {
    title: 'Denim, Chinos & Pants',
    headers: ['Waist Size', 'Waist', 'Hip', 'Length', 'Inseam'],
    rows: {
      in: [
        { size: '30', chest: '30.0', length: '39.5', shoulder: '37.0', sleeve: '30.0' },
        { size: '32', chest: '32.0', length: '40.0', shoulder: '39.0', sleeve: '30.5' },
        { size: '34', chest: '34.0', length: '40.5', shoulder: '41.0', sleeve: '31.0' },
        { size: '36', chest: '36.0', length: '41.0', shoulder: '43.0', sleeve: '31.5' },
        { size: '38', chest: '38.0', length: '41.5', shoulder: '45.0', sleeve: '32.0' },
      ],
      cm: [
        { size: '30', chest: '76.2', length: '100.3', shoulder: '94.0', sleeve: '76.2' },
        { size: '32', chest: '81.3', length: '101.6', shoulder: '99.0', sleeve: '77.5' },
        { size: '34', chest: '86.4', length: '102.9', shoulder: '104.1', sleeve: '78.7' },
        { size: '36', chest: '91.4', length: '104.1', shoulder: '109.2', sleeve: '80.0' },
        { size: '38', chest: '96.5', length: '105.4', shoulder: '114.3', sleeve: '81.3' },
      ],
    }
  },
  panjabi: {
    title: 'Panjabi & Traditional',
    headers: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: {
      in: [
        { size: '38 (S)', chest: '38.0', length: '40.0', shoulder: '17.5', sleeve: '24.0' },
        { size: '40 (M)', chest: '40.0', length: '42.0', shoulder: '18.0', sleeve: '24.5' },
        { size: '42 (L)', chest: '42.0', length: '44.0', shoulder: '18.5', sleeve: '25.0' },
        { size: '44 (XL)', chest: '44.0', length: '45.0', shoulder: '19.0', sleeve: '25.5' },
      ],
      cm: [
        { size: '38 (S)', chest: '96.5', length: '101.6', shoulder: '44.5', sleeve: '61.0' },
        { size: '40 (M)', chest: '101.6', length: '106.7', shoulder: '45.7', sleeve: '62.2' },
        { size: '42 (L)', chest: '106.7', length: '111.8', shoulder: '47.0', sleeve: '63.5' },
        { size: '44 (XL)', chest: '111.8', length: '114.3', shoulder: '48.3', sleeve: '64.8' },
      ],
    }
  }
};

export default function SizeGuideModal({ isOpen, onClose, categoryName = '' }: SizeGuideModalProps) {
  // Determine initial active tab based on product category
  const lowerCat = categoryName.toLowerCase();
  const initialType = lowerCat.includes('pant') || lowerCat.includes('denim') || lowerCat.includes('chino')
    ? 'pants'
    : lowerCat.includes('panjabi')
      ? 'panjabi'
      : lowerCat.includes('shirt') && !lowerCat.includes('t-shirt')
        ? 'shirt'
        : 'tshirt';

  const [activeType, setActiveType] = useState<'tshirt' | 'shirt' | 'pants' | 'panjabi'>(initialType);
  const [unit, setUnit] = useState<Unit>('in');

  if (!isOpen) return null;

  const currentChart = SIZE_DATA[activeType];
  const rows = currentChart.rows[unit];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl bg-white border border-zinc-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-zinc-950 text-white">
              <Ruler className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-950 uppercase tracking-wider">
                Size & Measurement Guide
              </h2>
              <p className="text-[11px] font-semibold text-zinc-400">
                Find your perfect tailored fit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector & Unit Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { key: 'tshirt', label: 'T-Shirt / Polo' },
              { key: 'shirt', label: 'Shirts' },
              { key: 'pants', label: 'Denim / Pants' },
              { key: 'panjabi', label: 'Panjabi' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveType(tab.key as any)}
                className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeType === tab.key
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Unit Toggle */}
          <div className="flex items-center border border-zinc-200 bg-zinc-50 p-0.5">
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 text-xs font-black uppercase font-mono transition-all ${
                unit === 'in' ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-950'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-xs font-black uppercase font-mono transition-all ${
                unit === 'cm' ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-950'
              }`}
            >
              CM (cm)
            </button>
          </div>
        </div>

        {/* Modal Body: Measurement Table */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          <div className="overflow-x-auto border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200">
                  {currentChart.headers.map((header, idx) => (
                    <th key={idx} className="p-3 text-[11px] font-black uppercase tracking-wider text-zinc-900 font-mono">
                      {header} {idx > 0 ? `(${unit})` : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors font-medium">
                    <td className="p-3 font-black text-zinc-950 font-mono bg-zinc-50/40">
                      {row.size}
                    </td>
                    <td className="p-3 text-zinc-700 font-mono">{row.chest}</td>
                    <td className="p-3 text-zinc-700 font-mono">{row.length}</td>
                    {row.shoulder && <td className="p-3 text-zinc-700 font-mono">{row.shoulder}</td>}
                    {row.sleeve && <td className="p-3 text-zinc-700 font-mono">{row.sleeve}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measuring Instructions Section */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wider">
              <HelpCircle className="h-4 w-4 text-teal-650" />
              <span>How to Measure Accurately</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-600">
              <div className="flex items-start gap-2">
                <span className="font-black text-teal-650 font-mono">1.</span>
                <p><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal under your arms.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-black text-teal-650 font-mono">2.</span>
                <p><strong>Length:</strong> Measure straight down from the highest point of the shoulder down to the bottom hemline.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-black text-teal-650 font-mono">3.</span>
                <p><strong>Shoulder:</strong> Measure across the back from the edge of one shoulder bone to the other.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-black text-teal-650 font-mono">4.</span>
                <p><strong>Waist:</strong> Measure around your natural waistline, where your trousers usually rest comfortably.</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 p-4 bg-zinc-50/50 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400">
            * All measurements are standard tailored fit. In between sizes? We recommend ordering the larger size.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
}
