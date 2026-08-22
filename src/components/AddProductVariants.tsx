'use client';

import React from 'react';
import { Sliders, Palette } from 'lucide-react';

interface ColorOption {
  name: string;
  code: string;
}

interface AddProductVariantsProps {
  sizes: string[];
  sizeInput: string;
  setSizeInput: (val: string) => void;
  onAddSize: (e: React.KeyboardEvent) => void;
  onRemoveSize: (size: string) => void;
  colors: ColorOption[];
  colorInput: string;
  setColorInput: (val: string) => void;
  onAddColor: (e: React.KeyboardEvent) => void;
  onRemoveColor: (colorName: string) => void;
  baseSku: string;
  basePrice: string;
  variantEdits: Record<string, { sku: string; price: string; stock: string }>;
  onVariantChange: (key: string, field: 'sku' | 'price' | 'stock', value: string) => void;
  onRemoveVariant: (key: string) => void;
}

export default function AddProductVariants({
  sizes,
  sizeInput,
  setSizeInput,
  onAddSize,
  onRemoveSize,
  colors,
  colorInput,
  setColorInput,
  onAddColor,
  onRemoveColor,
  baseSku,
  basePrice,
  variantEdits,
  onVariantChange,
  onRemoveVariant
}: AddProductVariantsProps) {
  
  const getVariantsList = () => {
    const list = [];
    for (const c of colors) {
      for (const s of sizes) {
        const key = `${c.name}-${s}`;
        const defaultSku = `${baseSku ? baseSku : 'PROD'}-${c.name.substring(0, 3).toUpperCase()}-${s.toUpperCase()}`;
        const defaultPrice = basePrice || '0';
        const defaultStock = '10';

        const edit = (variantEdits[key] || {}) as any;

        list.push({
          key,
          color: c.name,
          colorCode: c.code,
          size: s,
          sku: edit.sku !== undefined ? edit.sku : defaultSku,
          price: edit.price !== undefined ? edit.price : defaultPrice,
          stock: edit.stock !== undefined ? edit.stock : defaultStock,
        });
      }
    }
    return list;
  };

  const activeVariants = getVariantsList().filter(v => v.sku !== 'EXCLUDED');

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
      <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
        <Sliders className="h-5 w-5 text-indigo-500" />
        <span>Product Options & Variants</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sizes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Sizes</label>
          <div className="flex flex-wrap gap-1.5 p-2.5 border border-zinc-200 rounded-xl bg-zinc-50 min-h-[46px] items-center">
            {sizes.map((s, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 text-xs font-bold px-2.5 py-1 rounded-full text-zinc-800 shadow-sm">
                {s}
                <button
                  type="button"
                  onClick={() => onRemoveSize(s)}
                  className="text-zinc-400 hover:text-red-500 font-bold text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
            {sizes.length === 0 && <span className="text-xs text-zinc-400">No sizes added yet</span>}
          </div>
          <input
            type="text"
            placeholder="Type size (e.g. S, M, L) & press Enter"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={onAddSize}
            className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
          />
        </div>

        {/* Colors */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Colors</label>
          <div className="flex flex-wrap gap-1.5 p-2.5 border border-zinc-200 rounded-xl bg-zinc-50 min-h-[46px] items-center">
            {colors.map((c, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 text-xs font-bold px-2.5 py-1 rounded-full text-zinc-800 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: c.code }}></span>
                {c.name}
                <button
                  type="button"
                  onClick={() => onRemoveColor(c.name)}
                  className="text-zinc-400 hover:text-red-500 font-bold text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
            {colors.length === 0 && <span className="text-xs text-zinc-400">No colors added yet</span>}
          </div>
          <input
            type="text"
            placeholder="Type color (e.g. Black, Navy) & press Enter"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            onKeyDown={onAddColor}
            className="rounded-xl border border-zinc-200 p-2.5 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Variant Matrix (per size+color)</label>
        
        {activeVariants.length > 0 ? (
          <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-600">
                    <th className="p-3">Variant</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Price ($)</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700 bg-white">
                  {activeVariants.map((v) => (
                    <tr key={v.key} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: v.colorCode }}></span>
                        {v.color} / {v.size}
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => onVariantChange(v.key, 'sku', e.target.value)}
                          className="rounded-lg border border-zinc-200 p-1.5 font-mono text-[11px] bg-zinc-50 focus:bg-white outline-none w-full"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => onVariantChange(v.key, 'price', e.target.value)}
                          className="rounded-lg border border-zinc-200 p-1.5 text-[11px] bg-zinc-50 focus:bg-white outline-none w-20"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => onVariantChange(v.key, 'stock', e.target.value)}
                          className="rounded-lg border border-zinc-200 p-1.5 text-[11px] bg-zinc-50 focus:bg-white outline-none w-16"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => onRemoveVariant(v.key)}
                          className="text-zinc-400 hover:text-red-500 font-bold px-2 py-1 text-sm cursor-pointer"
                          title="Exclude Variant"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 border border-dashed border-zinc-200 rounded-2xl text-xs text-zinc-400 bg-zinc-50">
            No sizes or colors added yet to generate combinations.
          </div>
        )}
        <p className="text-[11px] text-zinc-400">
          Set customized SKU codes, prices, and stock counts per combination of sizes and colors.
        </p>
      </div>
    </div>
  );
}
