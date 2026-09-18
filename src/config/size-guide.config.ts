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
    title: 'Boxy Full Sleeve Shirts',
    headers: ['Size', 'Chest', 'Length', 'Shoulder'],
    rows: {
      in: [
        { size: 'M', chest: '42 – 43"', length: '28.0"', shoulder: '19.5"' },
        { size: 'L', chest: '44 – 45"', length: '29.0"', shoulder: '20.5"' },
        { size: 'XL', chest: '46 – 47"', length: '30.0"', shoulder: '21.5"' },
      ],
      cm: [
        { size: 'M', chest: '106.7 – 109.2', length: '71.1', shoulder: '49.5' },
        { size: 'L', chest: '111.8 – 114.3', length: '73.7', shoulder: '52.1' },
        { size: 'XL', chest: '116.8 – 119.4', length: '76.2', shoulder: '54.6' },
      ],
    }
  },
  regular_shirt: {
    title: 'Regular Fit Shirts',
    headers: ['Size', 'Chest', 'Length', 'Shoulder'],
    rows: {
      in: [
        { size: 'S', chest: '38"', length: '27.0"', shoulder: '17.0"' },
        { size: 'M', chest: '40"', length: '28.0"', shoulder: '17.5"' },
        { size: 'L', chest: '42"', length: '29.0"', shoulder: '18.5"' },
        { size: 'XL', chest: '44"', length: '30.0"', shoulder: '19.5"' },
        { size: 'XXL', chest: '46"', length: '30.5"', shoulder: '20.5"' },
      ],
      cm: [
        { size: 'S', chest: '96.5', length: '68.5', shoulder: '43.2' },
        { size: 'M', chest: '101.6', length: '71.1', shoulder: '44.5' },
        { size: 'L', chest: '106.7', length: '73.7', shoulder: '47.0' },
        { size: 'XL', chest: '111.8', length: '76.2', shoulder: '49.5' },
        { size: 'XXL', chest: '116.8', length: '77.5', shoulder: '52.1' },
      ],
    }
  },
  baggy_denim: {
    title: 'StraightFit Baggy Denim Pants',
    headers: ['Waist', 'Length', 'Leg Opening', 'Weight (Denim)'],
    rows: {
      in: [
        { size: '28', 'length': '38.0/39.0"', 'leg opening': '14.5"', 'weight (denim)': '13 oz' },
        { size: '30', 'length': '39.5/40.0"', 'leg opening': '15.0"', 'weight (denim)': '13 oz' },
        { size: '32', 'length': '40.0/40.5"', 'leg opening': '16.0"', 'weight (denim)': '13 oz' },
        { size: '34', 'length': '40.5/41.0"', 'leg opening': '17.0"', 'weight (denim)': '13 oz' },
        { size: '36', 'length': '41.0/41.5"', 'leg opening': '18.0"', 'weight (denim)': '13 oz' },
      ],
      cm: [
        { size: '28', 'length': '96.5 / 99.0', 'leg opening': '36.8', 'weight (denim)': '13 oz' },
        { size: '30', 'length': '100.3 / 101.6', 'leg opening': '38.1', 'weight (denim)': '13 oz' },
        { size: '32', 'length': '101.6 / 102.8', 'leg opening': '40.6', 'weight (denim)': '13 oz' },
        { size: '34', 'length': '102.8 / 104.1', 'leg opening': '43.2', 'weight (denim)': '13 oz' },
        { size: '36', 'length': '104.1 / 105.4', 'leg opening': '45.7', 'weight (denim)': '13 oz' },
      ],
    }
  },
  tshirt: {
    title: 'T-Shirt / Polo',
    headers: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: {
      in: [
        { size: 'S', chest: '37 – 38"', length: '27.0"', shoulder: '16.5"', sleeve: '8.0"' },
        { size: 'M', chest: '39 – 40"', length: '28.0"', shoulder: '17.5"', sleeve: '8.5"' },
        { size: 'L', chest: '41 – 42"', length: '29.0"', shoulder: '18.5"', sleeve: '9.0"' },
        { size: 'XL', chest: '43 – 44"', length: '30.0"', shoulder: '19.5"', sleeve: '9.5"' },
        { size: 'XXL', chest: '45 – 46"', length: '30.5"', shoulder: '20.5"', sleeve: '10.0"' },
      ],
      cm: [
        { size: 'S', chest: '94 – 96.5', length: '68.5', shoulder: '41.9', sleeve: '20.3' },
        { size: 'M', chest: '99 – 101.6', length: '71.1', shoulder: '44.5', sleeve: '21.5' },
        { size: 'L', chest: '104 – 106.7', length: '73.6', shoulder: '47.0', sleeve: '22.8' },
        { size: 'XL', chest: '109 – 111.8', length: '76.2', shoulder: '49.5', sleeve: '24.1' },
        { size: 'XXL', chest: '114 – 116.8', length: '77.5', shoulder: '52.1', sleeve: '25.4' },
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
  }
};

export const COMMON_PRESET_COLUMNS = [
  'Chest', 'Length', 'Leg Opening', 'Weight (Denim)', 'Sleeve', 'Shoulder', 'Waist', 'Hip', 'Inseam', 'Thigh', 'Collar', 'Armhole'
];

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

  const normalizedQuery = sizeQuery.trim().toLowerCase();
  
  // Try exact match first
  let match = chart.rows[unit].find(
    (row) => row.size.trim().toLowerCase() === normalizedQuery
  );

  // If not found, try matching prefix e.g. "M" in "M (BOXY)" or "38" in "38 (S)"
  if (!match) {
    match = chart.rows[unit].find((row) => {
      const rowSize = row.size.trim().toLowerCase();
      return (
        rowSize.startsWith(normalizedQuery) ||
        rowSize.includes(`(${normalizedQuery})`) ||
        normalizedQuery.startsWith(rowSize)
      );
    });
  }

  return match || null;
}
