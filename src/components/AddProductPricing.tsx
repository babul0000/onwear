'use client';

import React from 'react';
import { DollarSign, Package, Truck, CreditCard, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AddProductPricingProps {
  price: string;
  setPrice: (val: string) => void;
  discountPrice: string;
  setDiscountPrice: (val: string) => void;
  costPrice: string;
  setCostPrice: (val: string) => void;
  stock: string;
  setStock: (val: string) => void;
  lowStockAlert: string;
  setLowStockAlert: (val: string) => void;
  sku: string;
  setSku: (val: string) => void;
  preOrder: boolean;
  setPreOrder: (val: boolean) => void;
  trackInventory: boolean;
  setTrackInventory: (val: boolean) => void;
  weight: string;
  setWeight: (val: string) => void;
  dimensions: string;
  setDimensions: (val: string) => void;
  shippingInside: string;
  setShippingInside: (val: string) => void;
  shippingOutside: string;
  setShippingOutside: (val: string) => void;
  freeShipping: boolean;
  setFreeShipping: (val: boolean) => void;
  paymentMethods: string[];
  togglePaymentMethod: (method: string) => void;
  categories: Category[];
  loadingCategories: boolean;
  categoryId: string;
  setCategoryId: (val: string) => void;
  subCategory: string;
  setSubCategory: (val: string) => void;
  tags: string[];
  tagInput: string;
  setTagInput: (val: string) => void;
  onAddTag: (e: React.KeyboardEvent) => void;
  onRemoveTag: (tag: string) => void;
  status: string;
  setStatus: (val: string) => void;
}

export default function AddProductPricing({
  price,
  setPrice,
  discountPrice,
  setDiscountPrice,
  costPrice,
  setCostPrice,
  stock,
  setStock,
  lowStockAlert,
  setLowStockAlert,
  sku,
  setSku,
  preOrder,
  setPreOrder,
  trackInventory,
  setTrackInventory,
  weight,
  setWeight,
  dimensions,
  setDimensions,
  shippingInside,
  setShippingInside,
  shippingOutside,
  setShippingOutside,
  freeShipping,
  setFreeShipping,
  paymentMethods,
  togglePaymentMethod,
  categories,
  loadingCategories,
  categoryId,
  setCategoryId,
  subCategory,
  setSubCategory,
  tags,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  status,
  setStatus
}: AddProductPricingProps) {
  
  // Profit calculations
  const regPriceNum = parseFloat(price) || 0;
  const discPriceNum = parseFloat(discountPrice) || 0;
  const costPriceNum = parseFloat(costPrice) || 0;
  const sellPrice = discPriceNum > 0 && discPriceNum < regPriceNum ? discPriceNum : regPriceNum;
  const potentialProfit = sellPrice - costPriceNum;

  return (
    <div className="flex flex-col gap-6">
      {/* Pricing Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-indigo-500" />
          <span>Pricing</span>
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Regular Price ($)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-zinc-400 text-sm font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 p-3 pl-8 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Discount Price ($ - Optional)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-zinc-400 text-sm font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 p-3 pl-8 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cost Price ($ - Optional)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-zinc-400 text-sm font-semibold">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 p-3 pl-8 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center text-emerald-800">
            <span className="text-xs font-semibold uppercase tracking-wider">Potential Profit (per unit)</span>
            <span className="text-base font-extrabold">${potentialProfit > 0 ? potentialProfit.toFixed(2) : '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Inventory Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-500" />
          <span>Inventory</span>
        </h2>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Stock Qty</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Low Stock Alert</label>
              <input
                type="number"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">SKU (Stock Keeping Unit)</label>
            <input
              type="text"
              required
              placeholder="e.g. CLOTH-SHIRT-M"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all font-mono uppercase outline-none"
            />
          </div>

          <div className="flex justify-between items-center py-2 border-b border-zinc-100">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-800">Allow Backorders</span>
              <span className="text-[10px] text-zinc-400">Accept orders when inventory is out of stock</span>
            </div>
            <button
              type="button"
              onClick={() => setPreOrder(!preOrder)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer outline-none ${preOrder ? 'bg-indigo-600' : 'bg-zinc-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${preOrder ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>

          <div className="flex justify-between items-center py-2">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-800">Track Inventory</span>
              <span className="text-[10px] text-zinc-400">Reduce stock counts automatically on sales</span>
            </div>
            <button
              type="button"
              onClick={() => setTrackInventory(!trackInventory)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer outline-none ${trackInventory ? 'bg-indigo-600' : 'bg-zinc-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${trackInventory ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Truck className="h-5 w-5 text-indigo-500" />
          <span>Shipping & Delivery</span>
        </h2>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Dimensions (cm)</label>
              <input
                type="text"
                placeholder="L × W × H"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:bg-white focus:outline-indigo-600 transition-all outline-none"
              />
            </div>
          </div>

          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-2">Delivery Fee by Zone ($)</label>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-600 font-semibold min-w-[100px]">Inside City</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-3 text-zinc-400 text-xs font-semibold">$</span>
                <input
                  type="number"
                  value={shippingInside}
                  onChange={(e) => setShippingInside(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 p-2.5 pl-7 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-600 font-semibold min-w-[100px]">Outside City</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-3 text-zinc-400 text-xs font-semibold">$</span>
                <input
                  type="number"
                  value={shippingOutside}
                  onChange={(e) => setShippingOutside(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 p-2.5 pl-7 text-xs bg-zinc-50 focus:bg-white focus:outline-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-zinc-100 mt-2">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-800">Free Shipping</span>
              <span className="text-[10px] text-zinc-400">Offer free shipping for this specific item</span>
            </div>
            <button
              type="button"
              onClick={() => setFreeShipping(!freeShipping)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer outline-none ${freeShipping ? 'bg-indigo-600' : 'bg-zinc-200'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${freeShipping ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-500" />
          <span>Payment Methods</span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => togglePaymentMethod('COD')}
            className={`flex items-center gap-3 border rounded-2xl p-3.5 text-left text-xs font-bold transition-all cursor-pointer ${
              paymentMethods.includes('COD') ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-zinc-200 bg-zinc-50 text-zinc-700'
            }`}
          >
            <div className={`w-4.5 h-4.5 border rounded-md flex items-center justify-center text-xs text-white ${paymentMethods.includes('COD') ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300'}`}>
              {paymentMethods.includes('COD') && '✓'}
            </div>
            <span>COD</span>
          </button>

          <button
            type="button"
            onClick={() => togglePaymentMethod('BKASH')}
            className={`flex items-center gap-3 border rounded-2xl p-3.5 text-left text-xs font-bold transition-all cursor-pointer ${
              paymentMethods.includes('BKASH') ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-zinc-200 bg-zinc-50 text-zinc-700'
            }`}
          >
            <div className={`w-4.5 h-4.5 border rounded-md flex items-center justify-center text-xs text-white ${paymentMethods.includes('BKASH') ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300'}`}>
              {paymentMethods.includes('BKASH') && '✓'}
            </div>
            <span>bKash</span>
          </button>

          <button
            type="button"
            onClick={() => togglePaymentMethod('NAGAD')}
            className={`flex items-center gap-3 border rounded-2xl p-3.5 text-left text-xs font-bold transition-all cursor-pointer ${
              paymentMethods.includes('NAGAD') ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-zinc-200 bg-zinc-50 text-zinc-700'
            }`}
          >
            <div className={`w-4.5 h-4.5 border rounded-md flex items-center justify-center text-xs text-white ${paymentMethods.includes('NAGAD') ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300'}`}>
              {paymentMethods.includes('NAGAD') && '✓'}
            </div>
            <span>Nagad</span>
          </button>

          <button
            type="button"
            onClick={() => togglePaymentMethod('CARD')}
            className={`flex items-center gap-3 border rounded-2xl p-3.5 text-left text-xs font-bold transition-all cursor-pointer ${
              paymentMethods.includes('CARD') ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-zinc-200 bg-zinc-50 text-zinc-700'
            }`}
          >
            <div className={`w-4.5 h-4.5 border rounded-md flex items-center justify-center text-xs text-white ${paymentMethods.includes('CARD') ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300'}`}>
              {paymentMethods.includes('CARD') && '✓'}
            </div>
            <span>Card / Bank</span>
          </button>
        </div>
      </div>

      {/* Organization Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-6">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <Tag className="h-5 w-5 text-indigo-500" />
          <span>Organization</span>
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</label>
            {loadingCategories ? (
              <div className="text-xs text-zinc-400 p-3 border border-zinc-200 rounded-xl bg-zinc-50 animate-pulse">
                Loading categories...
              </div>
            ) : (
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:outline-indigo-600 transition-all cursor-pointer outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Sub-category</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:outline-indigo-600 transition-all cursor-pointer outline-none"
            >
              <option value="">Select Sub-category</option>
              <option value="panjabi">Panjabi</option>
              <option value="sari">Sari</option>
              <option value="three-piece">Three Piece</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tags</label>
            <div className="flex flex-wrap gap-1.5 p-2.5 border border-zinc-200 rounded-xl bg-zinc-50 min-h-[46px] items-center">
              {tags.map((t, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 text-xs font-bold px-2.5 py-1 rounded-full text-zinc-800 shadow-sm">
                  {t}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(t)}
                    className="text-zinc-400 hover:text-red-500 font-bold text-[10px] cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Type tag & press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onAddTag}
                className="flex-1 outline-none min-w-[80px] bg-transparent text-xs p-1"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Product Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-zinc-200 p-3 text-sm bg-zinc-50 focus:outline-indigo-600 transition-all cursor-pointer outline-none"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Draft / Inactive</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
