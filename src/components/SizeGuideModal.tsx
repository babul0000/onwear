'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Ruler, Edit3, Save, Plus, Trash2, RotateCcw, 
  Check, HelpCircle, Sparkles, Layers, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string;
  productId?: string;
  productName?: string;
  sizeChartUrl?: string | null;
  onSaveSuccess?: () => void;
}

type Unit = 'in' | 'cm';

export interface SizeRow {
  size: string;
  [key: string]: string;
}

export interface SizeCategory {
  title: string;
  headers: string[]; // e.g. ['Size', 'Chest', 'Length'] or ['Waist', 'Length', 'Leg Opening', 'Weight (Denim)']
  rows: {
    in: SizeRow[];
    cm: SizeRow[];
  };
}

export type SizeDataMap = Record<string, SizeCategory>;

const DEFAULT_SIZE_DATA: SizeDataMap = {
  boxy_shirt: {
    title: 'Boxy Full Sleeve Shirts',
    headers: ['Size', 'Chest', 'Length'],
    rows: {
      in: [
        { size: 'M', chest: '43"', length: '26.5"' },
        { size: 'L', chest: '45"', length: '27.5"' },
        { size: 'XL', chest: '47"', length: '28.5"' },
      ],
      cm: [
        { size: 'M', chest: '109.2', length: '67.3' },
        { size: 'L', chest: '114.3', length: '69.9' },
        { size: 'XL', chest: '119.4', length: '72.4' },
      ],
    }
  },
  baggy_denim: {
    title: 'StraightFit Baggy Denim Pants',
    headers: ['Waist', 'Length', 'Leg Opening', 'Weight (Denim)'],
    rows: {
      in: [
        { size: '28', 'length': '38/39.5"', 'leg opening': '14/15"', 'weight (denim)': '13 oz' },
        { size: '30', 'length': '39.5/41"', 'leg opening': '15"', 'weight (denim)': '13 oz' },
        { size: '32', 'length': '40/41"', 'leg opening': '16"', 'weight (denim)': '13 oz' },
        { size: '34', 'length': '40/41"', 'leg opening': '17/18"', 'weight (denim)': '13 oz' },
        { size: '36', 'length': '40/41"', 'leg opening': '18"', 'weight (denim)': '13 oz' },
      ],
      cm: [
        { size: '28', 'length': '96.5 / 100.3', 'leg opening': '35.6 / 38.1', 'weight (denim)': '13 oz' },
        { size: '30', 'length': '100.3 / 104.1', 'leg opening': '38.1', 'weight (denim)': '13 oz' },
        { size: '32', 'length': '101.6 / 104.1', 'leg opening': '40.6', 'weight (denim)': '13 oz' },
        { size: '34', 'length': '101.6 / 104.1', 'leg opening': '43.2 / 45.7', 'weight (denim)': '13 oz' },
        { size: '36', 'length': '101.6 / 104.1', 'leg opening': '45.7', 'weight (denim)': '13 oz' },
      ],
    }
  },
  tshirt: {
    title: 'T-Shirt / Polo',
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
  panjabi: {
    title: 'Panjabi',
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

const COMMON_PRESET_COLUMNS = [
  'Chest', 'Length', 'Leg Opening', 'Weight (Denim)', 'Sleeve', 'Shoulder', 'Waist', 'Hip', 'Inseam', 'Thigh', 'Collar', 'Armhole'
];

export default function SizeGuideModal({
  isOpen,
  onClose,
  categoryName = '',
  productId,
  productName,
  sizeChartUrl,
  onSaveSuccess
}: SizeGuideModalProps) {
  const { user, token } = useAuth();
  const isAdmin = user && user.role === 'admin';

  // Determine initial active category key
  const getInitialCategoryKey = () => {
    const lower = (categoryName || '').toLowerCase();
    if (lower.includes('pant') || lower.includes('denim') || lower.includes('chino') || lower.includes('trouser') || lower.includes('baggy') || lower.includes('straight')) {
      return 'baggy_denim';
    }
    if (lower.includes('panjabi') || lower.includes('kurta') || lower.includes('traditional')) {
      return 'panjabi';
    }
    if (lower.includes('t-shirt') || lower.includes('polo') || lower.includes('tee')) {
      return 'tshirt';
    }
    if (lower.includes('boxy') || lower.includes('shirt')) {
      return 'boxy_shirt';
    }
    return 'boxy_shirt';
  };

  const [activeType, setActiveType] = useState<string>('tshirt');
  const [unit, setUnit] = useState<Unit>('in');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editScope, setEditScope] = useState<'global' | 'product'>('global');
  const [sizeData, setSizeData] = useState<SizeDataMap>(DEFAULT_SIZE_DATA);
  const [isCustomProductChart, setIsCustomProductChart] = useState<boolean>(false);

  // Edit form states
  const [showAddColumn, setShowAddColumn] = useState<boolean>(false);
  const [customColumnName, setCustomColumnName] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState<boolean>(false);
  const [newCatKey, setNewCatKey] = useState<string>('');
  const [newCatTitle, setNewCatTitle] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load size data on open
  useEffect(() => {
    if (!isOpen) return;

    const initialKey = getInitialCategoryKey();
    setActiveType(initialKey);
    setIsEditing(false);
    setShowAddColumn(false);
    setShowAddCategory(false);
    setToastMessage(null);

    // 1. Check if product has its own custom size chart
    let loadedFromProduct = false;
    if (productId) {
      try {
        const prodLocal = localStorage.getItem(`onwear_size_guide_prod_${productId}`);
        if (prodLocal) {
          const parsed = JSON.parse(prodLocal);
          if (parsed && typeof parsed === 'object') {
            setSizeData((prev) => ({ ...prev, [initialKey]: parsed }));
            setIsCustomProductChart(true);
            setEditScope('product');
            loadedFromProduct = true;
          }
        } else if (sizeChartUrl) {
          try {
            const parsed = JSON.parse(sizeChartUrl);
            if (parsed && typeof parsed === 'object') {
              setSizeData((prev) => ({ ...prev, [initialKey]: parsed }));
              setIsCustomProductChart(true);
              setEditScope('product');
              loadedFromProduct = true;
            }
          } catch (_) {}
        }
      } catch (err) {
        console.error('Error loading product custom size chart:', err);
      }
    }

    // 2. If not loaded from product, check global custom size chart
    if (!loadedFromProduct) {
      try {
        const globalLocal = localStorage.getItem('onwear_size_guide_custom_data');
        if (globalLocal) {
          const parsed = JSON.parse(globalLocal);
          if (parsed && typeof parsed === 'object') {
            setSizeData(parsed);
          }
        } else {
          setSizeData(DEFAULT_SIZE_DATA);
        }
      } catch (err) {
        console.error('Error loading global custom size chart:', err);
      }
      setIsCustomProductChart(false);
      setEditScope('global');
    }
  }, [isOpen, categoryName, productId, sizeChartUrl]);

  if (!isOpen) return null;

  // Ensure current category chart exists
  const currentChart: SizeCategory = sizeData[activeType] || {
    title: activeType,
    headers: ['Size', 'Chest', 'Length'],
    rows: { in: [], cm: [] }
  };

  const rows = currentChart.rows[unit] || [];
  const headers = currentChart.headers || ['Size'];

  // Update cell value
  const handleCellChange = (rowIdx: number, colHeader: string, value: string) => {
    const key = colHeader.toLowerCase().trim();
    const updatedRows = [...rows];
    updatedRows[rowIdx] = {
      ...updatedRows[rowIdx],
      [key]: value
    };

    setSizeData((prev) => ({
      ...prev,
      [activeType]: {
        ...prev[activeType],
        rows: {
          ...prev[activeType].rows,
          [unit]: updatedRows
        }
      }
    }));
  };

  // Update size label
  const handleSizeNameChange = (rowIdx: number, value: string) => {
    const updatedRows = [...rows];
    updatedRows[rowIdx] = {
      ...updatedRows[rowIdx],
      size: value
    };

    setSizeData((prev) => ({
      ...prev,
      [activeType]: {
        ...prev[activeType],
        rows: {
          ...prev[activeType].rows,
          [unit]: updatedRows
        }
      }
    }));
  };

  // Add new row
  const handleAddRow = () => {
    const newRow: SizeRow = { size: 'New Size' };
    headers.forEach((h) => {
      const k = h.toLowerCase().trim();
      if (k !== 'size') newRow[k] = '';
    });

    const updatedRows = [...rows, newRow];
    setSizeData((prev) => ({
      ...prev,
      [activeType]: {
        ...prev[activeType],
        rows: {
          ...prev[activeType].rows,
          [unit]: updatedRows
        }
      }
    }));
  };

  // Delete row
  const handleDeleteRow = (rowIdx: number) => {
    const updatedRows = rows.filter((_, idx) => idx !== rowIdx);
    setSizeData((prev) => ({
      ...prev,
      [activeType]: {
        ...prev[activeType],
        rows: {
          ...prev[activeType].rows,
          [unit]: updatedRows
        }
      }
    }));
  };

  // Add column
  const handleAddColumn = (colName: string) => {
    const trimmed = colName.trim();
    if (!trimmed) return;
    if (headers.some((h) => h.toLowerCase() === trimmed.toLowerCase())) {
      alert('This column header already exists.');
      return;
    }

    const updatedHeaders = [...headers, trimmed];
    const key = trimmed.toLowerCase();

    // Ensure all rows in both units have this key
    const updatedInRows = (currentChart.rows.in || []).map((r) => ({ ...r, [key]: r[key] || '' }));
    const updatedCmRows = (currentChart.rows.cm || []).map((r) => ({ ...r, [key]: r[key] || '' }));

    setSizeData((prev) => ({
      ...prev,
      [activeType]: {
        ...prev[activeType],
        headers: updatedHeaders,
        rows: {
          in: updatedInRows,
          cm: updatedCmRows
        }
      }
    }));

    setCustomColumnName('');
    setShowAddColumn(false);
  };

  // Delete column
  const handleDeleteColumn = (colHeader: string) => {
    if (colHeader.toLowerCase() === 'size') {
      alert('The "Size" column cannot be removed.');
      return;
    }

    const updatedHeaders = headers.filter((h) => h !== colHeader);
    const key = colHeader.toLowerCase().trim();

    const cleanRows = (rowList: SizeRow[]) =>
      rowList.map((r) => {
        const copy = { ...r };
        delete copy[key];
        return copy;
      });

    setSizeData((prev) => ({
      ...prev,
      [activeType]: {
        ...prev[activeType],
        headers: updatedHeaders,
        rows: {
          in: cleanRows(prev[activeType]?.rows?.in || []),
          cm: cleanRows(prev[activeType]?.rows?.cm || [])
        }
      }
    }));
  };

  // Auto Unit Conversion
  const handleAutoConvert = (fromUnit: 'in' | 'cm', toUnit: 'in' | 'cm') => {
    const sourceRows = currentChart.rows[fromUnit] || [];
    const multiplier = fromUnit === 'in' ? 2.54 : 1 / 2.54;

    const convertedRows = sourceRows.map((row) => {
      const newRow: SizeRow = { size: row.size };
      Object.keys(row).forEach((key) => {
        if (key === 'size') return;
        const val = (row[key] || '').trim();
        if (!val) {
          newRow[key] = '';
          return;
        }

        // Leave weight or non-measurement units intact
        if (val.toLowerCase().includes('oz') || val.toLowerCase().includes('gsm') || val.toLowerCase().includes('kg')) {
          newRow[key] = val;
          return;
        }

        // Handle ranges like "38/39.5" or "14/15" or "36 – 38"
        if (val.includes('/') || val.includes('–') || val.includes('-')) {
          const delimiter = val.includes('/') ? ' / ' : ' – ';
          const parts = val.split(/[\/–-]/).map((p) => parseFloat(p.trim()));
          if (!isNaN(parts[0]) && !isNaN(parts[1])) {
            const c1 = (parts[0] * multiplier).toFixed(1);
            const c2 = (parts[1] * multiplier).toFixed(1);
            newRow[key] = `${c1}${delimiter}${c2}`;
            return;
          }
        }

        const num = parseFloat(val);
        if (!isNaN(num)) {
          newRow[key] = (num * multiplier).toFixed(1);
        } else {
          newRow[key] = val;
        }
      });
      return newRow;
    });

    setSizeData((prev) => ({
      ...prev,
      [activeType]: {
        ...prev[activeType],
        rows: {
          ...prev[activeType].rows,
          [toUnit]: convertedRows
        }
      }
    }));

    setUnit(toUnit);
    setToastMessage({
      type: 'success',
      text: `Calculated ${toUnit.toUpperCase()} measurements automatically from ${fromUnit.toUpperCase()}!`
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add new category tab
  const handleAddCategory = () => {
    if (!newCatTitle.trim()) return;
    const key = (newCatKey.trim() || newCatTitle.trim()).toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (sizeData[key]) {
      alert('A category with this identifier already exists.');
      return;
    }

    const newCategory: SizeCategory = {
      title: newCatTitle.trim(),
      headers: ['Size', 'Chest', 'Length', 'Sleeve'],
      rows: {
        in: [
          { size: 'S', chest: '36.0', length: '27.0', sleeve: '8.0' },
          { size: 'M', chest: '38.0', length: '28.0', sleeve: '8.5' },
          { size: 'L', chest: '40.0', length: '29.0', sleeve: '9.0' },
          { size: 'XL', chest: '42.0', length: '30.0', sleeve: '9.5' },
        ],
        cm: [
          { size: 'S', chest: '91.4', length: '68.5', sleeve: '20.3' },
          { size: 'M', chest: '96.5', length: '71.1', sleeve: '21.5' },
          { size: 'L', chest: '101.6', length: '73.6', sleeve: '22.8' },
          { size: 'XL', chest: '106.7', length: '76.2', sleeve: '24.1' },
        ]
      }
    };

    setSizeData((prev) => ({
      ...prev,
      [key]: newCategory
    }));

    setActiveType(key);
    setNewCatTitle('');
    setNewCatKey('');
    setShowAddCategory(false);
  };

  // Delete category tab
  const handleDeleteCategory = (catKey: string) => {
    if (Object.keys(sizeData).length <= 1) {
      alert('You must have at least one category chart.');
      return;
    }
    if (!confirm(`Are you sure you want to delete the "${sizeData[catKey]?.title || catKey}" size chart?`)) {
      return;
    }

    const updated = { ...sizeData };
    delete updated[catKey];
    setSizeData(updated);
    setActiveType(Object.keys(updated)[0]);
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    setToastMessage(null);

    try {
      if (editScope === 'product' && productId) {
        // Save product-specific chart
        const productChart = sizeData[activeType];
        localStorage.setItem(`onwear_size_guide_prod_${productId}`, JSON.stringify(productChart));
        setIsCustomProductChart(true);

        // Sync with API if token is present
        if (token) {
          try {
            await fetch(`${API_URL}/products/${productId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                sizeChartUrl: JSON.stringify(productChart)
              })
            });
          } catch (apiErr) {
            console.warn('Backend sync warning:', apiErr);
          }
        }
      } else {
        // Save global size data
        localStorage.setItem('onwear_size_guide_custom_data', JSON.stringify(sizeData));
        if (productId) {
          localStorage.removeItem(`onwear_size_guide_prod_${productId}`);
          setIsCustomProductChart(false);
        }
      }

      setToastMessage({
        type: 'success',
        text: 'Size chart updated & saved successfully!'
      });
      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error('Save size chart error:', err);
      setToastMessage({
        type: 'error',
        text: 'Failed to save size chart. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Reset to default standard
  const handleResetDefaults = () => {
    if (confirm('Reset this size guide back to standard factory default measurements?')) {
      if (editScope === 'product' && productId) {
        localStorage.removeItem(`onwear_size_guide_prod_${productId}`);
        setIsCustomProductChart(false);
      }
      localStorage.removeItem('onwear_size_guide_custom_data');
      setSizeData(DEFAULT_SIZE_DATA);
      setToastMessage({
        type: 'success',
        text: 'Reset to standard factory default sizes.'
      });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 selection:bg-zinc-950 selection:text-white">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn" 
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-3xl bg-white border border-zinc-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* TOP HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 sm:px-6 py-4 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-950 text-white rounded-lg shadow-sm">
              <Ruler className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-zinc-950 uppercase tracking-wider font-sans">
                  {isEditing ? 'Size Chart Studio' : 'Size & Measurement Guide'}
                </h2>
                {isCustomProductChart && !isEditing && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded font-mono">
                    Product Specific
                  </span>
                )}
                {isAdmin && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-900 text-white px-2 py-0.5 rounded font-mono hidden sm:inline-block">
                    Admin Access
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-zinc-500 mt-0.5">
                {isEditing 
                  ? 'Customize sizes, headers, and inch/cm dimensions' 
                  : 'Find your perfect tailored fit with exact measurements'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit / View Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setToastMessage(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                isEditing
                  ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
                  : 'bg-zinc-950 text-white hover:bg-zinc-800'
              }`}
              title={isEditing ? 'Exit editor to preview mode' : 'Edit size dimensions'}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Preview' : 'Edit Size Chart'}</span>
            </button>

            {/* Close modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* TOAST NOTIFICATION ALERT */}
        {toastMessage && (
          <div className={`px-6 py-2.5 text-xs font-bold flex items-center justify-between border-b animate-in slide-in-from-top duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              {toastMessage.text}
            </span>
            <button onClick={() => setToastMessage(null)} className="text-current opacity-70 hover:opacity-100 p-1">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* EDIT SCOPE SWITCHER (When in Edit Mode and productId is present) */}
        {isEditing && productId && (
          <div className="px-5 sm:px-6 py-2.5 bg-amber-50/70 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-amber-950">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Target Scope:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditScope('global')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                  editScope === 'global'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                🌐 All {currentChart.title} Products
              </button>
              <button
                type="button"
                onClick={() => setEditScope('product')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${
                  editScope === 'product'
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50'
                }`}
                title={`Customize only for ${productName || 'this product'}`}
              >
                📦 This Product Only ({productName ? productName.slice(0, 15) + '...' : 'Product'})
              </button>
            </div>
          </div>
        )}

        {/* TAB SELECTOR & UNIT SWITCHER */}
        <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.keys(sizeData).map((key) => {
              const cat = sizeData[key];
              const isActive = activeType === key;
              return (
                <div key={key} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveType(key)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {cat.title || key}
                  </button>
                  {isEditing && Object.keys(sizeData).length > 1 && isActive && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(key)}
                      className="ml-0.5 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                      title="Delete this category chart"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Category Tab Button (Edit Mode) */}
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="px-2.5 py-1.5 border border-dashed border-zinc-300 text-zinc-700 hover:border-zinc-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-zinc-50 hover:bg-white transition-all cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add Category</span>
              </button>
            )}
          </div>

          {/* Unit Toggle & Auto Convert Tools */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-zinc-200 bg-zinc-50 p-0.5">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-3 py-1 text-xs font-black uppercase font-mono transition-all cursor-pointer ${
                  unit === 'in' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-black uppercase font-mono transition-all cursor-pointer ${
                  unit === 'cm' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                CM (cm)
              </button>
            </div>
          </div>
        </div>

        {/* ADD CATEGORY POPUP FORM */}
        {isEditing && showAddCategory && (
          <div className="px-6 py-3 bg-zinc-100 border-b border-zinc-200 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-[10px] font-black uppercase text-zinc-500 font-mono">Apparel / Category Name</label>
              <input
                type="text"
                placeholder="e.g. Blazers & Suits, Jackets, Hoodies"
                value={newCatTitle}
                onChange={(e) => setNewCatTitle(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div className="flex items-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-1.5 bg-zinc-950 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-800"
              >
                Create Chart Tab
              </button>
              <button
                type="button"
                onClick={() => setShowAddCategory(false)}
                className="px-3 py-1.5 text-zinc-500 text-xs font-bold uppercase hover:text-zinc-950"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* MODAL MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-6">
          
          {/* EDIT MODE QUICK TOOLBAR */}
          {isEditing && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-700">Quick Tools:</span>
                <button
                  type="button"
                  onClick={() => handleAutoConvert('in', 'cm')}
                  className="px-2.5 py-1 bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-700 rounded text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Auto calculate CM measurements from Inches (x2.54)"
                >
                  <RefreshCw className="h-3 w-3 text-teal-600" />
                  <span>Auto-calculate CM from IN</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAutoConvert('cm', 'in')}
                  className="px-2.5 py-1 bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-700 rounded text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Auto calculate Inches measurements from CM (/2.54)"
                >
                  <RefreshCw className="h-3 w-3 text-teal-600" />
                  <span>Auto-calculate IN from CM</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddColumn(!showAddColumn)}
                  className="px-3 py-1 bg-zinc-950 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-zinc-800 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Column</span>
                </button>
              </div>
            </div>
          )}

          {/* ADD COLUMN PRESETS DRAWER */}
          {isEditing && showAddColumn && (
            <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-xl flex flex-col gap-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Choose or Type New Column Name:</span>
                <button onClick={() => setShowAddColumn(false)} className="text-zinc-400 hover:text-zinc-700 p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PRESET_COLUMNS.filter((c) => !headers.some((h) => h.toLowerCase() === c.toLowerCase())).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddColumn(preset)}
                    className="px-2.5 py-1 bg-white hover:bg-zinc-950 hover:text-white border border-zinc-200 rounded text-xs font-semibold text-zinc-700 transition-all cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Custom measurement name (e.g. Leg Opening, Thigh)"
                  value={customColumnName}
                  onChange={(e) => setCustomColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn(customColumnName);
                  }}
                  className="px-3 py-1.5 text-xs bg-white border border-zinc-300 rounded flex-1 font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
                <button
                  type="button"
                  onClick={() => handleAddColumn(customColumnName)}
                  className="px-4 py-1.5 bg-zinc-950 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* SIZE MEASUREMENTS TABLE */}
          <div className="overflow-x-auto border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200">
                  {headers.map((header, colIdx) => {
                    const isWeight = header.toLowerCase().includes('weight');
                    return (
                      <th key={colIdx} className="p-3 text-[11px] font-black uppercase tracking-wider text-zinc-900 font-mono">
                        <div className="flex items-center justify-between gap-2">
                          <span>
                            {header} {colIdx > 0 && !isWeight ? `(${unit})` : ''}
                          </span>
                          {isEditing && colIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(header)}
                              className="text-zinc-400 hover:text-rose-600 p-0.5 transition-colors"
                              title={`Remove ${header} column`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  {isEditing && (
                    <th className="p-3 text-[11px] font-black uppercase tracking-wider text-zinc-500 font-mono text-center w-12">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-zinc-50/80 transition-colors font-medium">
                    {/* Size column */}
                    <td className="p-2.5 font-black text-zinc-950 font-mono bg-zinc-50/40">
                      {isEditing ? (
                        <input
                          type="text"
                          value={row.size || ''}
                          onChange={(e) => handleSizeNameChange(rowIdx, e.target.value)}
                          placeholder="e.g. S, 38, L"
                          className="w-full px-2 py-1 bg-white border border-zinc-300 rounded font-mono font-bold text-xs text-zinc-950 focus:outline-none focus:border-zinc-950"
                        />
                      ) : (
                        row.size
                      )}
                    </td>

                    {/* Measurement columns */}
                    {headers.slice(1).map((header, colIdx) => {
                      const key = header.toLowerCase().trim();
                      const val = row[key] || '';
                      return (
                        <td key={colIdx} className="p-2.5 text-zinc-700 font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => handleCellChange(rowIdx, header, e.target.value)}
                              placeholder="0.0"
                              className="w-full px-2 py-1 bg-white border border-zinc-200 rounded font-mono font-semibold text-xs text-zinc-800 focus:outline-none focus:border-zinc-950"
                            />
                          ) : (
                            val || '—'
                          )}
                        </td>
                      );
                    })}

                    {/* Delete Row Button (Edit Mode) */}
                    {isEditing && (
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(rowIdx)}
                          className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                          title="Delete size row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Brand Emblem Footer inside table */}
            {!isEditing && (
              <div className="py-3 px-4 bg-zinc-50 border-t border-zinc-200 flex flex-col items-center justify-center gap-0.5 text-center">
                <span className="text-xs font-black tracking-widest text-zinc-950 uppercase font-sans">
                  ON WEAR.
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-mono">
                  UNIQUE WAY OF ELEGANCE • ESTD. 2025
                </span>
              </div>
            )}

            {/* Add Size Row Button in Edit Mode */}
            {isEditing && (
              <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-3.5 py-1.5 bg-zinc-950 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-zinc-800 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Size Row</span>
                </button>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {rows.length} size{rows.length !== 1 ? 's' : ''} configured
                </span>
              </div>
            )}
          </div>

          {/* HOW TO MEASURE GUIDE (View Mode) */}
          {!isEditing && (
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
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="border-t border-zinc-200 p-4 bg-zinc-50 flex flex-wrap items-center justify-between gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 text-zinc-500 hover:text-rose-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Standard Defaults</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-[11px] font-semibold text-zinc-400">
                * All measurements are standard tailored fit. In between sizes? We recommend ordering the larger size.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
              >
                Got It
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
