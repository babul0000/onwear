export type Unit = 'in' | 'cm';

export interface SizeRow {
  size: string;
  [key: string]: string;
}

export interface SizeCategory {
  title: string;
  headers: string[];
  rows: {
    in: SizeRow[];
    cm: SizeRow[];
  };
}

export type SizeDataMap = Record<string, SizeCategory>;

export const SIZE_GUIDE_UPDATE_EVENT = 'onwear_size_guide_updated';

export const DEFAULT_SIZE_DATA: SizeDataMap = {
  boxy_shirt: {
    title: 'Boxy Fit Shirts',
    headers: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: {
      in: [
        { size: 'S', chest: '42.0"', length: '26.5"', shoulder: '19.5"', sleeve: '23.5"' },
        { size: 'M', chest: '44.0"', length: '27.5"', shoulder: '20.5"', sleeve: '24.0"' },
        { size: 'L', chest: '46.0"', length: '28.5"', shoulder: '21.5"', sleeve: '24.5"' },
        { size: 'XL', chest: '48.0"', length: '29.5"', shoulder: '22.5"', sleeve: '25.0"' },
        { size: 'XXL', chest: '50.0"', length: '30.5"', shoulder: '23.5"', sleeve: '25.5"' },
      ],
      cm: [
        { size: 'S', chest: '106.7', length: '67.3', shoulder: '49.5', sleeve: '59.7' },
        { size: 'M', chest: '111.8', length: '69.8', shoulder: '52.1', sleeve: '61.0' },
        { size: 'L', chest: '116.8', length: '72.4', shoulder: '54.6', sleeve: '62.2' },
        { size: 'XL', chest: '121.9', length: '74.9', shoulder: '57.2', sleeve: '63.5' },
        { size: 'XXL', chest: '127.0', length: '77.5', shoulder: '59.7', sleeve: '64.8' },
      ],
    }
  },
  regular_shirt: {
    title: 'Regular Fit Shirts',
    headers: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: {
      in: [
        { size: 'S', chest: '39.0"', length: '28.0"', shoulder: '17.5"', sleeve: '24.0"' },
        { size: 'M', chest: '41.0"', length: '29.0"', shoulder: '18.0"', sleeve: '24.5"' },
        { size: 'L', chest: '43.0"', length: '30.0"', shoulder: '18.5"', sleeve: '25.0"' },
        { size: 'XL', chest: '45.0"', length: '31.0"', shoulder: '19.5"', sleeve: '25.5"' },
        { size: 'XXL', chest: '47.0"', length: '31.5"', shoulder: '20.5"', sleeve: '26.0"' },
      ],
      cm: [
        { size: 'S', chest: '99.0', length: '71.1', shoulder: '44.5', sleeve: '61.0' },
        { size: 'M', chest: '104.1', length: '73.7', shoulder: '45.7', sleeve: '62.2' },
        { size: 'L', chest: '109.2', length: '76.2', shoulder: '47.0', sleeve: '63.5' },
        { size: 'XL', chest: '114.3', length: '78.7', shoulder: '49.5', sleeve: '64.8' },
        { size: 'XXL', chest: '119.4', length: '80.0', shoulder: '52.1', sleeve: '66.0' },
      ],
    }
  },
  formal_pant: {
    title: 'Formal Trousers / Tailored Pants',
    headers: ['Size', 'Waist', 'Length', 'Hip', 'Thigh', 'Leg Opening'],
    rows: {
      in: [
        { size: '28', waist: '28.0"', length: '39.0"', hip: '36.0"', thigh: '21.5"', 'leg opening': '13.5"' },
        { size: '30', waist: '30.0"', length: '39.5"', hip: '38.0"', thigh: '22.5"', 'leg opening': '14.0"' },
        { size: '32', waist: '32.0"', length: '40.0"', hip: '40.0"', thigh: '23.5"', 'leg opening': '14.5"' },
        { size: '34', waist: '34.0"', length: '40.5"', hip: '42.0"', thigh: '24.5"', 'leg opening': '15.0"' },
        { size: '36', waist: '36.0"', length: '41.0"', hip: '44.0"', thigh: '25.5"', 'leg opening': '15.5"' },
      ],
      cm: [
        { size: '28', waist: '71.1', length: '99.0', hip: '91.4', thigh: '54.6', 'leg opening': '34.3' },
        { size: '30', waist: '76.2', length: '100.3', hip: '96.5', thigh: '57.2', 'leg opening': '35.6' },
        { size: '32', waist: '81.3', length: '101.6', hip: '101.6', thigh: '59.7', 'leg opening': '36.8' },
        { size: '34', waist: '86.4', length: '102.8', hip: '106.7', thigh: '62.2', 'leg opening': '38.1' },
        { size: '36', waist: '91.4', length: '104.1', hip: '111.8', thigh: '64.8', 'leg opening': '39.4' },
      ],
    }
  },
  chino_pant: {
    title: 'Chino & Cargo Pants',
    headers: ['Size', 'Waist', 'Length', 'Hip', 'Thigh', 'Leg Opening'],
    rows: {
      in: [
        { size: '28', waist: '28.0"', length: '39.0"', hip: '37.0"', thigh: '22.0"', 'leg opening': '14.0"' },
        { size: '30', waist: '30.0"', length: '40.0"', hip: '39.0"', thigh: '23.0"', 'leg opening': '14.5"' },
        { size: '32', waist: '32.0"', length: '40.5"', hip: '41.0"', thigh: '24.0"', 'leg opening': '15.0"' },
        { size: '34', waist: '34.0"', length: '41.0"', hip: '43.0"', thigh: '25.0"', 'leg opening': '15.5"' },
        { size: '36', waist: '36.0"', length: '41.5"', hip: '45.0"', thigh: '26.0"', 'leg opening': '16.0"' },
      ],
      cm: [
        { size: '28', waist: '71.1', length: '99.0', hip: '94.0', thigh: '55.9', 'leg opening': '35.6' },
        { size: '30', waist: '76.2', length: '101.6', hip: '99.1', thigh: '58.4', 'leg opening': '36.8' },
        { size: '32', waist: '81.3', length: '102.8', hip: '104.1', thigh: '61.0', 'leg opening': '38.1' },
        { size: '34', waist: '86.4', length: '104.1', hip: '109.2', thigh: '63.5', 'leg opening': '39.4' },
        { size: '36', waist: '91.4', length: '105.4', hip: '114.3', thigh: '66.0', 'leg opening': '40.6' },
      ],
    }
  },
  baggy_denim: {
    title: 'Denim Jeans & Baggy Pants',
    headers: ['Size', 'Waist', 'Length', 'Leg Opening', 'Weight (Denim)'],
    rows: {
      in: [
        { size: '28', waist: '28.0"', length: '39.0"', 'leg opening': '15.5"', 'weight (denim)': '13 oz' },
        { size: '30', waist: '30.0"', length: '40.0"', 'leg opening': '16.0"', 'weight (denim)': '13 oz' },
        { size: '32', waist: '32.0"', length: '40.5"', 'leg opening': '17.0"', 'weight (denim)': '13 oz' },
        { size: '34', waist: '34.0"', length: '41.0"', 'leg opening': '17.5"', 'weight (denim)': '13 oz' },
        { size: '36', waist: '36.0"', length: '41.5"', 'leg opening': '18.0"', 'weight (denim)': '13 oz' },
      ],
      cm: [
        { size: '28', waist: '71.1', length: '99.0', 'leg opening': '39.4', 'weight (denim)': '13 oz' },
        { size: '30', waist: '76.2', length: '101.6', 'leg opening': '40.6', 'weight (denim)': '13 oz' },
        { size: '32', waist: '81.3', length: '102.8', 'leg opening': '43.2', 'weight (denim)': '13 oz' },
        { size: '34', waist: '86.4', length: '104.1', 'leg opening': '44.5', 'weight (denim)': '13 oz' },
        { size: '36', waist: '91.4', length: '105.4', 'leg opening': '45.7', 'weight (denim)': '13 oz' },
      ],
    }
  },
  tshirt: {
    title: 'T-Shirt / Crewneck Tee',
    headers: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: {
      in: [
        { size: 'S', chest: '38.0"', length: '27.0"', shoulder: '16.5"', sleeve: '8.0"' },
        { size: 'M', chest: '40.0"', length: '28.0"', shoulder: '17.5"', sleeve: '8.5"' },
        { size: 'L', chest: '42.0"', length: '29.0"', shoulder: '18.5"', sleeve: '9.0"' },
        { size: 'XL', chest: '44.0"', length: '30.0"', shoulder: '19.5"', sleeve: '9.5"' },
        { size: 'XXL', chest: '46.0"', length: '30.5"', shoulder: '20.5"', sleeve: '10.0"' },
      ],
      cm: [
        { size: 'S', chest: '96.5', length: '68.5', shoulder: '41.9', sleeve: '20.3' },
        { size: 'M', chest: '101.6', length: '71.1', shoulder: '44.5', sleeve: '21.5' },
        { size: 'L', chest: '106.7', length: '73.6', shoulder: '47.0', sleeve: '22.8' },
        { size: 'XL', chest: '111.8', length: '76.2', shoulder: '49.5', sleeve: '24.1' },
        { size: 'XXL', chest: '116.8', length: '77.5', shoulder: '52.1', sleeve: '25.4' },
      ],
    }
  },
  polo: {
    title: 'Polo Shirt',
    headers: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: {
      in: [
        { size: 'S', chest: '38.0"', length: '27.5"', shoulder: '17.0"', sleeve: '8.5" / 24.0"' },
        { size: 'M', chest: '40.0"', length: '28.5"', shoulder: '17.5"', sleeve: '9.0" / 24.5"' },
        { size: 'L', chest: '42.0"', length: '29.5"', shoulder: '18.5"', sleeve: '9.5" / 25.0"' },
        { size: 'XL', chest: '44.0"', length: '30.5"', shoulder: '19.5"', sleeve: '10.0" / 25.5"' },
        { size: 'XXL', chest: '46.0"', length: '31.0"', shoulder: '20.5"', sleeve: '10.5" / 26.0"' },
      ],
      cm: [
        { size: 'S', chest: '96.5', length: '69.8', shoulder: '43.2', sleeve: '21.5 / 61.0' },
        { size: 'M', chest: '101.6', length: '72.4', shoulder: '44.5', sleeve: '22.8 / 62.2' },
        { size: 'L', chest: '106.7', length: '74.9', shoulder: '47.0', sleeve: '24.1 / 63.5' },
        { size: 'XL', chest: '111.8', length: '77.5', shoulder: '49.5', sleeve: '25.4 / 64.8' },
        { size: 'XXL', chest: '116.8', length: '78.7', shoulder: '52.1', sleeve: '26.7 / 66.0' },
      ],
    }
  },
  panjabi: {
    title: 'Panjabi',
    headers: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: {
      in: [
        { size: '38 (S)', chest: '38.0"', length: '40.0"', shoulder: '17.5"', sleeve: '24.0"' },
        { size: '40 (M)', chest: '40.0"', length: '42.0"', shoulder: '18.0"', sleeve: '24.5"' },
        { size: '42 (L)', chest: '42.0"', length: '44.0"', shoulder: '18.5"', sleeve: '25.0"' },
        { size: '44 (XL)', chest: '44.0"', length: '45.0"', shoulder: '19.0"', sleeve: '25.5"' },
      ],
      cm: [
        { size: '38 (S)', chest: '96.5', length: '101.6', shoulder: '44.5', sleeve: '61.0' },
        { size: '40 (M)', chest: '101.6', length: '106.7', shoulder: '45.7', sleeve: '62.2' },
        { size: '42 (L)', chest: '106.7', length: '111.8', shoulder: '47.0', sleeve: '63.5' },
        { size: '44 (XL)', chest: '111.8', length: '114.3', shoulder: '48.3', sleeve: '64.8' },
      ],
    }
  },
  footwear: {
    title: 'Footwear & Sandals',
    headers: ['Size', 'Foot Length', 'US Size', 'UK Size'],
    rows: {
      in: [
        { size: '40', 'foot length': '9.8"', 'us size': '7.5', 'uk size': '6.5' },
        { size: '41', 'foot length': '10.2"', 'us size': '8.5', 'uk size': '7.5' },
        { size: '42', 'foot length': '10.6"', 'us size': '9.5', 'uk size': '8.5' },
        { size: '43', 'foot length': '11.0"', 'us size': '10.5', 'uk size': '9.5' },
        { size: '44', 'foot length': '11.4"', 'us size': '11.5', 'uk size': '10.5' },
      ],
      cm: [
        { size: '40', 'foot length': '25.0', 'us size': '7.5', 'uk size': '6.5' },
        { size: '41', 'foot length': '26.0', 'us size': '8.5', 'uk size': '7.5' },
        { size: '42', 'foot length': '27.0', 'us size': '9.5', 'uk size': '8.5' },
        { size: '43', 'foot length': '28.0', 'us size': '10.5', 'uk size': '9.5' },
        { size: '44', 'foot length': '29.0', 'us size': '11.5', 'uk size': '10.5' },
      ],
    }
  }
};

export const COMMON_PRESET_COLUMNS = [
  'Chest', 'Length', 'Leg Opening', 'Weight (Denim)', 'Sleeve', 'Shoulder', 'Waist', 'Hip', 'Inseam', 'Thigh', 'Foot Length', 'US Size', 'UK Size', 'Collar', 'Armhole'
];

/**
 * Letter size to waist size mapping for pants
 */
export const PANT_LETTER_TO_WAIST_MAP: Record<string, string> = {
  xs: '28',
  s: '28',
  m: '30',
  l: '32',
  xl: '34',
  xxl: '36',
  '2xl': '36',
  '3xl': '38'
};

/**
 * Checks if a size row label matches a queried product size label.
 * Handles '38 (S)' matching '38' or 'S', and '30' matching 'M' for pants.
 */
export function isSizeMatching(rowSize: string, querySize: string, isPant: boolean = false): boolean {
  const normRow = (rowSize || '').trim().toLowerCase();
  const normQuery = (querySize || '').trim().toLowerCase();
  if (!normRow || !normQuery) return false;

  // 1. Exact match
  if (normRow === normQuery) return true;

  // 2. Prefix or parentheses match: e.g. "38 (S)" matches "38" or "S"
  if (
    normRow.startsWith(normQuery + ' ') ||
    normRow.startsWith(normQuery + '(') ||
    normRow.endsWith('(' + normQuery + ')') ||
    normRow.includes('(' + normQuery + ')') ||
    normQuery.startsWith(normRow + ' ') ||
    normQuery.includes('(' + normRow + ')')
  ) {
    return true;
  }

  // 3. For pants, map letter to waist
  if (isPant) {
    const mappedWaist = PANT_LETTER_TO_WAIST_MAP[normQuery];
    if (mappedWaist && (normRow === mappedWaist || normRow.startsWith(mappedWaist))) {
      return true;
    }
    const reverseMapped = Object.entries(PANT_LETTER_TO_WAIST_MAP).find(([, w]) => w === normRow);
    if (reverseMapped && reverseMapped[0] === normQuery) {
      return true;
    }
  }

  return false;
}

/**
 * Returns the active size chart for a category, checking for any custom data in localStorage
 */
export function getActiveSizeChart(categoryKey: string): SizeCategory {
  if (typeof window !== 'undefined') {
    try {
      const globalLocal = localStorage.getItem('onwear_size_guide_custom_data');
      if (globalLocal) {
        const parsed = JSON.parse(globalLocal);
        if (parsed && parsed[categoryKey]) {
          return parsed[categoryKey];
        }
      }
    } catch (_) {}
  }
  return DEFAULT_SIZE_DATA[categoryKey] || DEFAULT_SIZE_DATA.boxy_shirt;
}

/**
 * Finds the exact dimensions from the active size chart for a specific size label
 */
export function getMeasurementForSize(
  categoryKey: string,
  sizeQuery: string,
  unit: Unit = 'in'
): SizeRow | null {
  const chart = getActiveSizeChart(categoryKey);
  if (!chart || !chart.rows || !chart.rows[unit]) return null;

  const isPantChart = categoryKey === 'baggy_denim' || categoryKey === 'formal_pant' || categoryKey === 'chino_pant';

  // Use the smart matching function
  const match = chart.rows[unit].find((row) => isSizeMatching(row.size, sizeQuery, isPantChart));

  return match || null;
}
