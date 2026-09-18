'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { API_URL } from '../config';
import { formatPrice } from '../utils/format';
import { getOptimizedImageUrl } from '../utils/image';
import { 
  Sparkles, 
  Ruler, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  Shirt
} from 'lucide-react';
import { 
  getMeasurementForSize, 
  SIZE_GUIDE_UPDATE_EVENT,
  Unit
} from '../config/size-guide.config';

interface ProductItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  image?: string;
  stock: number;
  category?: {
    name: string;
    slug?: string;
  };
}

type ApparelType = 'shirt' | 't-shirt' | 'pant';
type FitPreference = 'slim' | 'regular' | 'oversized';

// Curated high-quality fallbacks for each category to ensure caps are never shown for shirts/pants
const FALLBACK_PRODUCTS: Record<ApparelType, ProductItem[]> = {
  shirt: [
    {
      id: 'f1f926df-af42-4c01-8a40-5c00ac68118e',
      name: 'Black & White Striped Full Sleeve Boxy Shirt',
      price: 850,
      image: 'https://i.ibb.co/s9PwsSnQ/Chat-GPT-Image-Sep-11-2026-12-41-59-PM.png',
      stock: 30,
      category: { name: 'Shirts', slug: 'shirts' }
    },
    {
      id: '28170482-483b-4403-a695-093cafb378d9',
      name: 'Blue Multicolor Striped Full Sleeve Boxy Shirt',
      price: 850,
      image: 'https://i.ibb.co/gMWJmP04/Chat-GPT-Image-Aug-19-2026-03-50-58-PM.png',
      stock: 25,
      category: { name: 'Shirts', slug: 'shirts' }
    },
    {
      id: 'f68ea68e-833c-4e36-8ea7-ecb9f27f10c8',
      name: 'Premium White Pinstripe Full Sleeve Shirt',
      price: 1100,
      image: 'https://i.ibb.co/cX3907HH/Chat-GPT-Image-Aug-19-2026-04-20-39-PM.png',
      stock: 20,
      category: { name: 'Shirts', slug: 'shirts' }
    }
  ],
  pant: [
    {
      id: '75cee999-813f-4f10-af71-c8f9e11b0e38',
      name: 'Cream Straight-Fit Baggy Pants',
      price: 799,
      image: 'https://res.cloudinary.com/lgmh6vly/image/upload/v1789573932/onwear/products/gnhqvxuer1wbnyxofjz9.webp',
      stock: 50,
      category: { name: 'Pants', slug: 'pants' }
    },
    {
      id: '65d440a4-82a2-4e4a-9432-69b47a9a5e90',
      name: 'Sky Blue Wash Straight-Fit Baggy Pants',
      price: 899,
      image: 'https://res.cloudinary.com/lgmh6vly/image/upload/v1789572726/onwear/products/bylpy0occdeukxctrrxv.webp',
      stock: 49,
      category: { name: 'Pants', slug: 'pants' }
    },
    {
      id: '4ae3b333-1067-4b0c-907c-2d82d806ac95',
      name: 'Coffee Wash Straight-Fit Baggy Pants',
      price: 950,
      image: 'https://res.cloudinary.com/lgmh6vly/image/upload/v1789573177/onwear/products/strt6dus0by15veji5ja.webp',
      stock: 50,
      category: { name: 'Pants', slug: 'pants' }
    }
  ],
  't-shirt': [
    {
      id: '3001335a-7a2f-439d-a450-10b799942421',
      name: "Men's Heavyweight Graphic Printed Tee",
      price: 650,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400',
      stock: 35,
      category: { name: 'T-Shirt', slug: 't-shirt' }
    },
    {
      id: '116b7600-96b1-4c62-baa5-0a4c8cbeea5b',
      name: "Men's Organic Cotton Crewneck T-Shirt",
      price: 550,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400',
      stock: 50,
      category: { name: 'T-Shirt', slug: 't-shirt' }
    },
    {
      id: '82f19019-82b5-4854-9b03-f8ff3f929eb4',
      name: "Men's Regular Fit Full Sleeve Polo Shirt",
      price: 750,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400',
      stock: 22,
      category: { name: 'T-Shirt', slug: 't-shirt' }
    }
  ]
};

export default function SmartFitFinder() {
  const router = useRouter();

  // User input states
  const [apparel, setApparel] = useState<ApparelType>('shirt');
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(8);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [fitPreference, setFitPreference] = useState<FitPreference>('regular');
  const [unit, setUnit] = useState<Unit>('in');

  // Real products from API
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sizeGuideRevision, setSizeGuideRevision] = useState<number>(0);

  // Sync with Size Guide changes live (when admin edits size guide modal)
  useEffect(() => {
    const handleSizeGuideUpdate = () => {
      setSizeGuideRevision((prev) => prev + 1);
    };

    window.addEventListener(SIZE_GUIDE_UPDATE_EVENT, handleSizeGuideUpdate);
    window.addEventListener('storage', handleSizeGuideUpdate);
    return () => {
      window.removeEventListener(SIZE_GUIDE_UPDATE_EVENT, handleSizeGuideUpdate);
      window.removeEventListener('storage', handleSizeGuideUpdate);
    };
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/products?limit=50`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter real products matching the selected apparel category
  const matchingProducts = useMemo(() => {
    if (!products.length) return FALLBACK_PRODUCTS[apparel];

    const filtered = products.filter((p) => {
      const catSlug = p.category?.slug?.toLowerCase() || '';
      const catName = p.category?.name?.toLowerCase() || '';
      const prodName = p.name.toLowerCase();

      // Exclude accessories / caps from shirt and pant categories
      const isCap =
        catSlug.includes('cap') ||
        catName.includes('cap') ||
        prodName.includes('cap') ||
        prodName.includes('hat') ||
        prodName.includes('snapback');

      if (isCap) return false;

      if (apparel === 'shirt') {
        const isShirt =
          catSlug.includes('shirt') ||
          catSlug.includes('slave') ||
          catSlug.includes('sleeve') ||
          catName.includes('shirt') ||
          catName.includes('slave') ||
          catName.includes('sleeve') ||
          prodName.includes('shirt') ||
          prodName.includes('kurta') ||
          prodName.includes('katua') ||
          (prodName.includes('sleeve') && !prodName.includes('tee') && !prodName.includes('t-shirt'));

        const isNotPant =
          !catSlug.includes('pant') &&
          !catSlug.includes('jean') &&
          !prodName.includes('pant') &&
          !prodName.includes('jean');

        return isShirt && isNotPant;
      }

      if (apparel === 'pant') {
        const isPant =
          catSlug.includes('pant') ||
          catSlug.includes('jean') ||
          catSlug.includes('chino') ||
          catSlug.includes('cargo') ||
          catSlug.includes('denim') ||
          catName.includes('pant') ||
          catName.includes('jean') ||
          catName.includes('chino') ||
          catName.includes('cargo') ||
          catName.includes('denim') ||
          prodName.includes('pant') ||
          prodName.includes('jean') ||
          prodName.includes('baggy') ||
          prodName.includes('chino') ||
          prodName.includes('cargo') ||
          prodName.includes('denim') ||
          prodName.includes('trouser');

        const isNotShirt = !catSlug.includes('shirt') && !prodName.includes('shirt');
        return isPant && isNotShirt;
      }

      if (apparel === 't-shirt') {
        const isTee =
          catSlug.includes('t-shirt') ||
          catSlug.includes('tee') ||
          catSlug.includes('polo') ||
          catName.includes('t-shirt') ||
          catName.includes('tee') ||
          catName.includes('polo') ||
          prodName.includes('t-shirt') ||
          prodName.includes('tee') ||
          prodName.includes('polo') ||
          prodName.includes('tshirt');

        const isNotPant = !catSlug.includes('pant') && !prodName.includes('pant');
        return isTee && isNotPant;
      }

      return true;
    });

    if (filtered.length > 0) {
      return filtered.slice(0, 3);
    }

    // Always fallback to high-quality category specific items, never show caps
    return FALLBACK_PRODUCTS[apparel];
  }, [products, apparel]);

  // Size calculation algorithm calibrated for Bangladesh demographic & synchronized with Size Guide (Both in and cm)
  const fitResult = useMemo(() => {
    const totalHeightInches = heightFeet * 12 + heightInches;

    // -------------------------------------------------------------
    // 1. PANTS & CHINOS (StraightFit Baggy Denim)
    // -------------------------------------------------------------
    if (apparel === 'pant') {
      let waist = 30;
      if (weightKg < 56) waist = 28;
      else if (weightKg <= 65) waist = 30;
      else if (weightKg <= 75) waist = 32;
      else if (weightKg <= 85) waist = 34;
      else waist = 36;

      // Pull exact dimensions directly from Size Guide in both IN and CM
      const guideRowIn = getMeasurementForSize('baggy_denim', waist.toString(), 'in');
      const guideRowCm = getMeasurementForSize('baggy_denim', waist.toString(), 'cm');

      const lengthIn = guideRowIn?.length || (totalHeightInches <= 68 ? '40.0"' : '40.5"');
      const lengthCm = guideRowCm?.length ? `${guideRowCm.length} cm` : `${Math.round((totalHeightInches <= 68 ? 40.0 : 40.5) * 2.54)} cm`;

      let legOpeningIn = guideRowIn?.['leg opening'] || '16.0"';
      let legOpeningCm = guideRowCm?.['leg opening'] ? `${guideRowCm['leg opening']} cm` : `${Math.round(16 * 2.54)} cm`;

      if (fitPreference === 'oversized' && !legOpeningIn.includes('/')) {
        const num = parseFloat(legOpeningIn);
        if (!isNaN(num)) {
          legOpeningIn = `${num + 1.0}"`;
          legOpeningCm = `${Math.round((num + 1.0) * 2.54 * 10) / 10} cm`;
        }
      }

      const waistIn = `${waist}"`;
      const waistCm = `${Math.round(waist * 2.54)} cm`;

      return {
        size: `${waist}`,
        sizeLabel: `Waist ${waist}" (${waistCm})`,
        chestOrWaist: unit === 'cm' ? waistCm : waistIn,
        secondaryChestOrWaist: unit === 'cm' ? waistIn : waistCm,
        length: unit === 'cm' ? lengthCm : lengthIn,
        secondaryLength: unit === 'cm' ? lengthIn : lengthCm,
        hip: unit === 'cm' ? legOpeningCm : legOpeningIn,
        secondaryHipOrShoulder: unit === 'cm' ? legOpeningIn : legOpeningCm,
        confidence: 98,
        fitNote:
          fitPreference === 'slim'
            ? 'Clean straight profile (Asian Standard 13 oz Denim)'
            : fitPreference === 'oversized'
            ? 'Relaxed streetwear baggy drape with extra thigh volume (13 oz Denim)'
            : 'Signature StraightFit Baggy fit (Standard comfort for Bangladeshi build)'
      };
    }

    // -------------------------------------------------------------
    // 2. SHIRTS (Calibrated & Synced with Size Guide in both IN and CM)
    // -------------------------------------------------------------
    if (apparel === 'shirt') {
      let baseSize: 'S' | 'M' | 'L' | 'XL' | 'XXL' = 'M';

      if (weightKg < 58) {
        baseSize = 'S';
      } else if (weightKg <= 68) {
        baseSize = totalHeightInches >= 71 ? 'L' : 'M';
      } else if (weightKg <= 78) {
        baseSize = totalHeightInches < 65 ? 'M' : 'L';
      } else if (weightKg <= 88) {
        baseSize = 'XL';
      } else {
        baseSize = 'XXL';
      }

      let displaySize: string = baseSize;
      const chartKey = fitPreference === 'oversized' ? 'boxy_shirt' : 'regular_shirt';

      if (fitPreference === 'oversized') {
        if (baseSize === 'S') displaySize = 'M (BOXY FIT)';
        else if (baseSize === 'M') displaySize = 'M (BOXY FIT)';
        else if (baseSize === 'L') displaySize = 'L (BOXY FIT)';
        else if (baseSize === 'XL') displaySize = 'XL (BOXY FIT)';
        else displaySize = 'XXL (BOXY FIT)';
      }

      const lookupKey = fitPreference === 'oversized' && baseSize === 'S' ? 'M' : baseSize;
      const guideRowIn = getMeasurementForSize(chartKey, lookupKey, 'in');
      const guideRowCm = getMeasurementForSize(chartKey, lookupKey, 'cm');

      let chestIn = guideRowIn?.chest || (baseSize === 'M' ? '40"' : '42"');
      let chestCm = guideRowCm?.chest ? `${guideRowCm.chest} cm` : (baseSize === 'M' ? '101.6 cm' : '106.7 cm');

      let lengthIn = guideRowIn?.length || (baseSize === 'M' ? '28.0"' : '29.0"');
      let lengthCm = guideRowCm?.length ? `${guideRowCm.length} cm` : (baseSize === 'M' ? '71.1 cm' : '73.7 cm');

      let shoulderIn = guideRowIn?.shoulder || (baseSize === 'M' ? '17.5"' : '18.5"');
      let shoulderCm = guideRowCm?.shoulder ? `${guideRowCm.shoulder} cm` : (baseSize === 'M' ? '44.5 cm' : '47.0 cm');

      if (fitPreference === 'slim') {
        if (baseSize === 'S') {
          chestIn = '36"'; chestCm = '91.4 cm';
          lengthIn = '26.5"'; lengthCm = '67.3 cm';
          shoulderIn = '16.5"'; shoulderCm = '41.9 cm';
        } else if (baseSize === 'M') {
          chestIn = '38"'; chestCm = '96.5 cm';
          lengthIn = '27.5"'; lengthCm = '69.8 cm';
          shoulderIn = '17.0"'; shoulderCm = '43.2 cm';
        } else if (baseSize === 'L') {
          chestIn = '40"'; chestCm = '101.6 cm';
          lengthIn = '28.5"'; lengthCm = '72.4 cm';
          shoulderIn = '18.0"'; shoulderCm = '45.7 cm';
        } else if (baseSize === 'XL') {
          chestIn = '42"'; chestCm = '106.7 cm';
          lengthIn = '29.5"'; lengthCm = '74.9 cm';
          shoulderIn = '19.0"'; shoulderCm = '48.3 cm';
        } else {
          chestIn = '44"'; chestCm = '111.8 cm';
          lengthIn = '30.0"'; lengthCm = '76.2 cm';
          shoulderIn = '20.0"'; shoulderCm = '50.8 cm';
        }
      }

      return {
        size: displaySize,
        sizeLabel: `Size ${displaySize}`,
        chestOrWaist: unit === 'cm' ? chestCm : chestIn,
        secondaryChestOrWaist: unit === 'cm' ? chestIn : chestCm,
        length: unit === 'cm' ? lengthCm : lengthIn,
        secondaryLength: unit === 'cm' ? lengthIn : lengthCm,
        shoulder: unit === 'cm' ? shoulderCm : shoulderIn,
        secondaryHipOrShoulder: unit === 'cm' ? shoulderIn : shoulderCm,
        confidence: 97,
        fitNote:
          fitPreference === 'slim'
            ? 'Tailored smart silhouette with clean drape around chest'
            : fitPreference === 'oversized'
            ? 'Contemporary drop-shoulder boxy streetwear silhouette'
            : 'Standard comfortable Asian fit with natural movement'
      };
    }

    // -------------------------------------------------------------
    // 3. T-SHIRTS (Calibrated & Synced with Size Guide in both IN and CM)
    // -------------------------------------------------------------
    let baseSize: 'S' | 'M' | 'L' | 'XL' | 'XXL' = 'M';
    if (weightKg < 56) baseSize = 'S';
    else if (weightKg <= 67) baseSize = 'M';
    else if (weightKg <= 77) baseSize = 'L';
    else if (weightKg <= 87) baseSize = 'XL';
    else baseSize = 'XXL';

    let displaySize: string = baseSize;
    if (fitPreference === 'oversized') {
      if (baseSize === 'S') displaySize = 'M (OVERSIZED)';
      else if (baseSize === 'M') displaySize = 'L (OVERSIZED)';
      else if (baseSize === 'L') displaySize = 'XL (OVERSIZED)';
      else displaySize = 'XXL (OVERSIZED)';
    }

    const lookupKey = fitPreference === 'oversized'
      ? (baseSize === 'S' ? 'M' : baseSize === 'M' ? 'L' : baseSize === 'L' ? 'XL' : 'XXL')
      : baseSize;

    const guideRowIn = getMeasurementForSize('tshirt', lookupKey, 'in');
    const guideRowCm = getMeasurementForSize('tshirt', lookupKey, 'cm');

    let chestIn = guideRowIn?.chest || (baseSize === 'M' ? '39 – 40"' : '41 – 42"');
    let chestCm = guideRowCm?.chest ? `${guideRowCm.chest} cm` : (baseSize === 'M' ? '99 – 101.6 cm' : '104 – 106.7 cm');

    let lengthIn = guideRowIn?.length || (baseSize === 'M' ? '28.0"' : '29.0"');
    let lengthCm = guideRowCm?.length ? `${guideRowCm.length} cm` : (baseSize === 'M' ? '71.1 cm' : '73.6 cm');

    let shoulderIn = guideRowIn?.shoulder || (baseSize === 'M' ? '17.5"' : '18.5"');
    let shoulderCm = guideRowCm?.shoulder ? `${guideRowCm.shoulder} cm` : (baseSize === 'M' ? '44.5 cm' : '47.0 cm');

    if (fitPreference === 'slim') {
      if (baseSize === 'S') {
        chestIn = '36"'; chestCm = '91.4 cm';
        lengthIn = '26.5"'; lengthCm = '67.3 cm';
        shoulderIn = '16.0"'; shoulderCm = '40.6 cm';
      } else if (baseSize === 'M') {
        chestIn = '38"'; chestCm = '96.5 cm';
        lengthIn = '27.5"'; lengthCm = '69.8 cm';
        shoulderIn = '17.0"'; shoulderCm = '43.2 cm';
      } else if (baseSize === 'L') {
        chestIn = '40"'; chestCm = '101.6 cm';
        lengthIn = '28.5"'; lengthCm = '72.4 cm';
        shoulderIn = '18.0"'; shoulderCm = '45.7 cm';
      } else if (baseSize === 'XL') {
        chestIn = '42"'; chestCm = '106.7 cm';
        lengthIn = '29.5"'; lengthCm = '74.9 cm';
        shoulderIn = '19.0"'; shoulderCm = '48.3 cm';
      } else {
        chestIn = '44"'; chestCm = '111.8 cm';
        lengthIn = '30.0"'; lengthCm = '76.2 cm';
        shoulderIn = '20.0"'; shoulderCm = '50.8 cm';
      }
    }

    return {
      size: displaySize,
      sizeLabel: `Size ${displaySize}`,
      chestOrWaist: unit === 'cm' ? chestCm : chestIn,
      secondaryChestOrWaist: unit === 'cm' ? chestIn : chestCm,
      length: unit === 'cm' ? lengthCm : lengthIn,
      secondaryLength: unit === 'cm' ? lengthIn : lengthCm,
      shoulder: unit === 'cm' ? shoulderCm : shoulderIn,
      secondaryHipOrShoulder: unit === 'cm' ? shoulderIn : shoulderCm,
      confidence: 96,
      fitNote:
        fitPreference === 'slim'
          ? 'Close-to-body athletic silhouette'
          : fitPreference === 'oversized'
          ? 'Relaxed drop-shoulder streetwear look'
          : 'Standard relaxed drape tailored for Bangladeshi everyday wear'
    };
  }, [apparel, heightFeet, heightInches, weightKg, fitPreference, sizeGuideRevision, unit]);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex flex-col gap-8">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-50 text-teal-700 rounded-full text-[9px] font-black uppercase tracking-wider font-mono mb-2 border border-teal-200/50">
            <Ruler className="h-3 w-3 text-teal-600" />
            <span>Interactive Fit Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wider text-zinc-950 uppercase">
            Smart Size & Fit Finder
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">
            Find your exact tailored size in seconds with zero guesswork and a 100% doorstep exchange guarantee.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 font-mono self-start md:self-auto">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Doorstep Size Swap Guarantee</span>
        </div>
      </div>

      {/* MAIN CALCULATOR INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: INTERACTIVE INPUT CONTROLS */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
          
          {/* 1. Category Switcher */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 font-mono block mb-2">
              1. Select Clothing Category
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setApparel('shirt')}
                className={`py-3 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  apparel === 'shirt'
                    ? 'bg-zinc-950 text-white shadow-sm font-black'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-bold'
                }`}
              >
                <Shirt className="h-3.5 w-3.5" />
                <span>Shirts</span>
              </button>

              <button
                type="button"
                onClick={() => setApparel('t-shirt')}
                className={`py-3 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  apparel === 't-shirt'
                    ? 'bg-zinc-950 text-white shadow-sm font-black'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-bold'
                }`}
              >
                <Shirt className="h-3.5 w-3.5" />
                <span>T-Shirts</span>
              </button>

              <button
                type="button"
                onClick={() => setApparel('pant')}
                className={`py-3 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  apparel === 'pant'
                    ? 'bg-zinc-950 text-white shadow-sm font-black'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-bold'
                }`}
              >
                <span>Pants & Chinos</span>
              </button>
            </div>
          </div>

          {/* 2. Height Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 font-mono">
                2. Your Height
              </label>
              <span className="text-xs font-black text-zinc-950 font-mono bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
                {heightFeet} ft {heightInches} in ({Math.round((heightFeet * 12 + heightInches) * 2.54)} cm)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 block mb-1">Feet</span>
                <select
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
                >
                  <option value={4}>4 Feet</option>
                  <option value={5}>5 Feet</option>
                  <option value={6}>6 Feet</option>
                  <option value={7}>7 Feet</option>
                </select>
              </div>

              <div>
                <span className="text-[9px] font-mono text-zinc-500 block mb-1">Inches</span>
                <select
                  value={heightInches}
                  onChange={(e) => setHeightInches(Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i}>
                      {i} Inches
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Weight Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 font-mono">
                3. Your Weight
              </label>
              <span className="text-xs font-black text-zinc-950 font-mono bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200">
                {weightKg} kg ({Math.round(weightKg * 2.20462)} lbs)
              </span>
            </div>

            <input
              type="range"
              min={45}
              max={110}
              step={1}
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-zinc-950 cursor-pointer h-2 bg-zinc-200 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-zinc-500 font-mono mt-1 font-semibold">
              <span>45 kg</span>
              <span>75 kg</span>
              <span>110 kg</span>
            </div>
          </div>

          {/* 4. Fit Preference */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 font-mono block mb-2">
              4. Preferred Fitting Style
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'slim', label: 'Slim Fit', desc: 'Snug & Tailored' },
                { id: 'regular', label: 'Regular Fit', desc: 'Standard Comfort' },
                { id: 'oversized', label: 'Boxy / Loose', desc: 'Relaxed Drop Fit' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFitPreference(item.id as FitPreference)}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    fitPreference === item.id
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border border-zinc-200'
                  }`}
                >
                  <span className="text-xs font-black uppercase">{item.label}</span>
                  <span className={`text-[9px] font-medium ${fitPreference === item.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RECOMMENDED SIZE (CLEAN WHITE THEME) & LIVE PRODUCT MATCHES */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          
          {/* Result Highlight Card - 100% Clean White Theme with Crisp Black Text */}
          <div className="bg-white text-zinc-950 rounded-2xl p-6 sm:p-7 border border-zinc-200 shadow-xs flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-teal-700 font-mono bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  Recommended Fit
                </span>

                {/* Unit Switcher: Inches (in) / Centimeters (cm) */}
                <div className="flex items-center border border-zinc-200 bg-zinc-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setUnit('in')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase font-mono rounded-md transition-all cursor-pointer ${
                      unit === 'in' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-950'
                    }`}
                  >
                    IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    className={`px-2 py-0.5 text-[9px] font-black uppercase font-mono rounded-md transition-all cursor-pointer ${
                      unit === 'cm' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-950'
                    }`}
                  >
                    CM
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 font-mono">
                <Check className="h-3.5 w-3.5" />
                <span>{fitResult.confidence}% Match</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-zinc-500 font-mono font-medium block">Your Optimal Selection</span>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 uppercase font-sans mt-0.5">
                {fitResult.size}
              </div>
              <p className="text-xs text-zinc-600 font-medium mt-1 leading-relaxed">
                {fitResult.fitNote}
              </p>
            </div>

            {/* Dimension Breakdown Metrics (Clean White/Zinc Panels) */}
            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-zinc-100">
              <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-200 text-center">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold">
                  {apparel === 'pant' ? 'Waist' : 'Chest'}
                </span>
                <span className="text-sm font-black text-zinc-950 font-mono mt-0.5 block">
                  {fitResult.chestOrWaist}
                </span>
                {fitResult.secondaryChestOrWaist && (
                  <span className="text-[9px] font-bold text-zinc-400 font-mono block mt-0.5">
                    ({fitResult.secondaryChestOrWaist})
                  </span>
                )}
              </div>

              <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-200 text-center">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold">Length</span>
                <span className="text-sm font-black text-zinc-950 font-mono mt-0.5 block">
                  {fitResult.length}
                </span>
                {fitResult.secondaryLength && (
                  <span className="text-[9px] font-bold text-zinc-400 font-mono block mt-0.5">
                    ({fitResult.secondaryLength})
                  </span>
                )}
              </div>

              <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-200 text-center">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold">
                  {apparel === 'pant' ? 'Leg Opening' : 'Shoulder'}
                </span>
                <span className="text-sm font-black text-zinc-950 font-mono mt-0.5 block">
                  {apparel === 'pant' ? fitResult.hip : fitResult.shoulder}
                </span>
                {fitResult.secondaryHipOrShoulder && (
                  <span className="text-[9px] font-bold text-zinc-400 font-mono block mt-0.5">
                    ({fitResult.secondaryHipOrShoulder})
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Real Products Available in this category */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 font-mono">
                Available in {apparel === 'shirt' ? 'Shirts' : apparel === 't-shirt' ? 'T-Shirts' : 'Pants'}
              </span>
              <Link
                href={`/products?category=${apparel === 'shirt' ? 'shirts' : apparel === 'pant' ? 'pants' : 't-shirt'}`}
                className="text-[10px] font-bold text-teal-650 hover:text-teal-700 flex items-center gap-1 font-mono uppercase"
              >
                <span>Browse All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {matchingProducts.map((prod) => {
                const hasDiscount = prod.discountPrice !== undefined && prod.discountPrice !== null;
                const activePrice = hasDiscount ? prod.discountPrice! : prod.price;

                return (
                  <div
                    key={prod.id}
                    onClick={() => router.push(`/products/${prod.id}`)}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl p-2 flex flex-col gap-1.5 cursor-pointer hover:border-zinc-400 transition-all group"
                  >
                    <div className="relative aspect-[3/4] w-full bg-white rounded-lg overflow-hidden border border-zinc-100">
                      <Image
                        src={getOptimizedImageUrl(prod.image) || '/placeholder.svg'}
                        alt={prod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="text-[10px] font-bold text-zinc-900 truncate leading-tight mt-0.5">
                      {prod.name}
                    </h4>
                    <span className="text-[10px] font-black text-zinc-950 font-mono">
                      {formatPrice(activePrice)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM TRUST GUARANTEE STRIP */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl shrink-0 border border-emerald-100">
            <RefreshCw className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-zinc-950">100% Doorstep Fit & Size Guarantee</h4>
            <p className="text-[11px] text-zinc-500 font-medium">
              If the delivered garment does not fit exactly how you like, our team will exchange it directly to your address within 7 days.
            </p>
          </div>
        </div>

        <Link
          href={`/products?category=${apparel === 'shirt' ? 'shirts' : apparel === 'pant' ? 'pants' : 't-shirt'}`}
          className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Shop Size {fitResult.size.split(' ')[0]} Now</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

    </section>
  );
}
