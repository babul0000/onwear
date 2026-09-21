export interface District {
  id: string;
  nameEn: string;
  nameBn: string;
  division: string;
}

export interface DhakaArea {
  id: string;
  nameEn: string;
  nameBn: string;
  isSubUrban?: boolean; // true for Savar, Ashulia, Keraniganj, Dhamrai, etc. (courier charges outside rate)
}

// 64 Districts of Bangladesh
export const BANGLADESH_DISTRICTS: District[] = [
  // Dhaka Division
  { id: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা', division: 'Dhaka' },
  { id: 'gazipur', nameEn: 'Gazipur', nameBn: 'গাজীপুর', division: 'Dhaka' },
  { id: 'narayanganj', nameEn: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', division: 'Dhaka' },
  { id: 'tangail', nameEn: 'Tangail', nameBn: 'টাঙ্গাইল', division: 'Dhaka' },
  { id: 'faridpur', nameEn: 'Faridpur', nameBn: 'ফরিদপুর', division: 'Dhaka' },
  { id: 'manikganj', nameEn: 'Manikganj', nameBn: 'মানিকগঞ্জ', division: 'Dhaka' },
  { id: 'munshiganj', nameEn: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', division: 'Dhaka' },
  { id: 'narsingdi', nameEn: 'Narsingdi', nameBn: 'নরসিংদী', division: 'Dhaka' },
  { id: 'gopalganj', nameEn: 'Gopalganj', nameBn: 'গোপালগঞ্জ', division: 'Dhaka' },
  { id: 'madaripur', nameEn: 'Madaripur', nameBn: 'মাদারীপুর', division: 'Dhaka' },
  { id: 'rajbari', nameEn: 'Rajbari', nameBn: 'রাজবাড়ী', division: 'Dhaka' },
  { id: 'shariatpur', nameEn: 'Shariatpur', nameBn: 'শরীয়তপুর', division: 'Dhaka' },
  { id: 'kishoreganj', nameEn: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', division: 'Dhaka' },

  // Chattogram Division
  { id: 'chattogram', nameEn: 'Chattogram (Chittagong)', nameBn: 'চট্টগ্রাম', division: 'Chattogram' },
  { id: 'coxs-bazar', nameEn: "Cox's Bazar", nameBn: 'কক্সবাজার', division: 'Chattogram' },
  { id: 'cumilla', nameEn: 'Cumilla (Comilla)', nameBn: 'কুমিল্লা', division: 'Chattogram' },
  { id: 'feni', nameEn: 'Feni', nameBn: 'ফেনী', division: 'Chattogram' },
  { id: 'brahmanbaria', nameEn: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', division: 'Chattogram' },
  { id: 'noakhali', nameEn: 'Noakhali', nameBn: 'নোয়াখালী', division: 'Chattogram' },
  { id: 'chandpur', nameEn: 'Chandpur', nameBn: 'চাঁদপুর', division: 'Chattogram' },
  { id: 'lakshmipur', nameEn: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', division: 'Chattogram' },
  { id: 'rangamati', nameEn: 'Rangamati', nameBn: 'রাঙ্গামাটি', division: 'Chattogram' },
  { id: 'khagrachhari', nameEn: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', division: 'Chattogram' },
  { id: 'bandarban', nameEn: 'Bandarban', nameBn: 'বান্দরবান', division: 'Chattogram' },

  // Sylhet Division
  { id: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট', division: 'Sylhet' },
  { id: 'moulvibazar', nameEn: 'Moulvibazar', nameBn: 'মৌলভীবাজার', division: 'Sylhet' },
  { id: 'habiganj', nameEn: 'Habiganj', nameBn: 'হবিগঞ্জ', division: 'Sylhet' },
  { id: 'sunamganj', nameEn: 'Sunamganj', nameBn: 'সুনামগঞ্জ', division: 'Sylhet' },

  // Rajshahi Division
  { id: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী', division: 'Rajshahi' },
  { id: 'bogura', nameEn: 'Bogura (Bogra)', nameBn: 'বগুড়া', division: 'Rajshahi' },
  { id: 'pabna', nameEn: 'Pabna', nameBn: 'পাবনা', division: 'Rajshahi' },
  { id: 'sirajganj', nameEn: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', division: 'Rajshahi' },
  { id: 'naogaon', nameEn: 'Naogaon', nameBn: 'নওগাঁ', division: 'Rajshahi' },
  { id: 'natore', nameEn: 'Natore', nameBn: 'নাটোর', division: 'Rajshahi' },
  { id: 'chapainawabganj', nameEn: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi' },
  { id: 'joypurhat', nameEn: 'Joypurhat', nameBn: 'জয়পুরহাট', division: 'Rajshahi' },

  // Khulna Division
  { id: 'khulna', nameEn: 'Khulna', nameBn: 'খুলনা', division: 'Khulna' },
  { id: 'jashore', nameEn: 'Jashore (Jessore)', nameBn: 'যশোর', division: 'Khulna' },
  { id: 'kushtia', nameEn: 'Kushtia', nameBn: 'কুষ্টিয়া', division: 'Khulna' },
  { id: 'satkhira', nameEn: 'Satkhira', nameBn: 'সাতক্ষীরা', division: 'Khulna' },
  { id: 'bagerhat', nameEn: 'Bagerhat', nameBn: 'বাগেরহাট', division: 'Khulna' },
  { id: 'jhenaidah', nameEn: 'Jhenaidah', nameBn: 'ঝিনাইদহ', division: 'Khulna' },
  { id: 'chuadanga', nameEn: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', division: 'Khulna' },
  { id: 'magura', nameEn: 'Magura', nameBn: 'মাগুরা', division: 'Khulna' },
  { id: 'meherpur', nameEn: 'Meherpur', nameBn: 'মেহেরপুর', division: 'Khulna' },
  { id: 'narail', nameEn: 'Narail', nameBn: 'নড়াইল', division: 'Khulna' },

  // Barishal Division
  { id: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল', division: 'Barishal' },
  { id: 'patuakhali', nameEn: 'Patuakhali', nameBn: 'পটুয়াখালী', division: 'Barishal' },
  { id: 'bhola', nameEn: 'Bhola', nameBn: 'ভোলা', division: 'Barishal' },
  { id: 'pirojpur', nameEn: 'Pirojpur', nameBn: 'পিরোজপুর', division: 'Barishal' },
  { id: 'barguna', nameEn: 'Barguna', nameBn: 'বরগুনা', division: 'Barishal' },
  { id: 'jhalokati', nameEn: 'Jhalokati', nameBn: 'ঝালকাঠি', division: 'Barishal' },

  // Rangpur Division
  { id: 'rangpur', nameEn: 'Rangpur', nameBn: 'রংপুর', division: 'Rangpur' },
  { id: 'dinajpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর', division: 'Rangpur' },
  { id: 'gaibandha', nameEn: 'Gaibandha', nameBn: 'গাইবান্ধা', division: 'Rangpur' },
  { id: 'kurigram', nameEn: 'Kurigram', nameBn: 'কুড়িগ্রাম', division: 'Rangpur' },
  { id: 'nilphamari', nameEn: 'Nilphamari', nameBn: 'নীলফামারী', division: 'Rangpur' },
  { id: 'panchagarh', nameEn: 'Panchagarh', nameBn: 'পঞ্চগড়', division: 'Rangpur' },
  { id: 'lalmonirhat', nameEn: 'Lalmonirhat', nameBn: 'লালমনিরহাট', division: 'Rangpur' },
  { id: 'thakurgaon', nameEn: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', division: 'Rangpur' },

  // Mymensingh Division
  { id: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ', division: 'Mymensingh' },
  { id: 'jamalpur', nameEn: 'Jamalpur', nameBn: 'জামালপুর', division: 'Mymensingh' },
  { id: 'netrokona', nameEn: 'Netrokona', nameBn: 'নেত্রকোণা', division: 'Mymensingh' },
  { id: 'sherpur', nameEn: 'Sherpur', nameBn: 'শেরপুর', division: 'Mymensingh' },
];

// Dhaka City & Sub-urban Areas (Thanas)
export const DHAKA_AREAS: DhakaArea[] = [
  // Dhaka City Regular (Inside Dhaka ৳80)
  { id: 'mirpur', nameEn: 'Mirpur', nameBn: 'মিরপুর' },
  { id: 'dhanmondi', nameEn: 'Dhanmondi', nameBn: 'ধানমন্ডি' },
  { id: 'gulshan', nameEn: 'Gulshan', nameBn: 'গুলশান' },
  { id: 'banani', nameEn: 'Banani', nameBn: 'বনানী' },
  { id: 'uttara', nameEn: 'Uttara', nameBn: 'উত্তরা' },
  { id: 'mohammadpur', nameEn: 'Mohammadpur', nameBn: 'মোহাম্মদপুর' },
  { id: 'badda', nameEn: 'Badda', nameBn: 'বাড্ডা' },
  { id: 'rampura', nameEn: 'Rampura', nameBn: 'রামপুরা' },
  { id: 'motijheel', nameEn: 'Motijheel', nameBn: 'মতিঝিল' },
  { id: 'khilgaon', nameEn: 'Khilgaon', nameBn: 'খিলগাঁও' },
  { id: 'malibagh', nameEn: 'Malibagh', nameBn: 'মালিবাগ' },
  { id: 'mogbazar', nameEn: 'Mogbazar', nameBn: 'মগবাজার' },
  { id: 'tejgaon', nameEn: 'Tejgaon', nameBn: 'তেজগাঁও' },
  { id: 'farmgate', nameEn: 'Farmgate', nameBn: 'ফার্মগেট' },
  { id: 'bashundhara', nameEn: 'Bashundhara R/A', nameBn: 'বসুন্ধরা আ/এ' },
  { id: 'baridhara', nameEn: 'Baridhara', nameBn: 'বারিধারা' },
  { id: 'lalmatia', nameEn: 'Lalmatia', nameBn: 'লালমাটিয়া' },
  { id: 'paltan', nameEn: 'Paltan', nameBn: 'পল্টন' },
  { id: 'shantinagar', nameEn: 'Shantinagar', nameBn: 'শান্তিনগর' },
  { id: 'jatrabari', nameEn: 'Jatrabari', nameBn: 'যাত্রাবাড়ী' },
  { id: 'wari', nameEn: 'Wari', nameBn: 'ওয়ারী' },
  { id: 'old-dhaka', nameEn: 'Old Dhaka (পুরান ঢাকা)', nameBn: 'পুরান ঢাকা' },
  { id: 'cantonment', nameEn: 'Cantonment', nameBn: 'সেনানিবাস' },
  { id: 'kafrul', nameEn: 'Kafrul', nameBn: 'কাফরুল' },
  { id: 'kalabagan', nameEn: 'Kalabagan', nameBn: 'কলাবাগান' },
  { id: 'new-market', nameEn: 'New Market / Elephant Rd', nameBn: 'নিউ মার্কেট / এলিফ্যান্ট রোড' },
  { id: 'panthapath', nameEn: 'Panthapath', nameBn: 'পান্থপথ' },
  { id: 'khilkhet', nameEn: 'Khilkhet / Nikunja', nameBn: 'খিলক্ষেত / নিকুঞ্জ' },
  { id: 'hazaribagh', nameEn: 'Hazaribagh', nameBn: 'হাজারীবাগ' },
  { id: 'other-city', nameEn: 'Other Dhaka City Area', nameBn: 'অন্যান্য (ঢাকা সিটি)' },

  // Dhaka Sub-urban (Outside courier rate applies)
  { id: 'savar', nameEn: 'Savar (সাভার - Sub-Dhaka)', nameBn: 'সাভার (ঢাকার বাইরে/সাব-ঢাকা)', isSubUrban: true },
  { id: 'ashulia', nameEn: 'Ashulia (আশুলিয়া - Sub-Dhaka)', nameBn: 'আশুলিয়া (ঢাকার বাইরে/সাব-ঢাকা)', isSubUrban: true },
  { id: 'keraniganj', nameEn: 'Keraniganj (কেরানীগঞ্জ - Sub-Dhaka)', nameBn: 'কেরানীগঞ্জ (ঢাকার বাইরে/সাব-ঢাকা)', isSubUrban: true },
  { id: 'dhamrai', nameEn: 'Dhamrai (ধামরাই - Sub-Dhaka)', nameBn: 'ধামরাই (ঢাকার বাইরে/সাব-ঢাকা)', isSubUrban: true },
  { id: 'dohar', nameEn: 'Dohar (দোহার - Sub-Dhaka)', nameBn: 'দোহার (ঢাকার বাইরে/সাব-ঢাকা)', isSubUrban: true },
  { id: 'nawabganj', nameEn: 'Nawabganj (নবাবগঞ্জ - Sub-Dhaka)', nameBn: 'নবাবগঞ্জ (ঢাকার বাইরে/সাব-ঢাকা)', isSubUrban: true },
];

// Keywords commonly found in outside-Dhaka addresses
export const OUTSIDE_DHAKA_KEYWORDS = [
  // Districts
  'chittagong', 'chattogram', 'চট্টগ্রাম',
  'sylhet', 'সিলেট',
  'rajshahi', 'রাজশাহী',
  'khulna', 'খুলনা',
  'barishal', 'barisal', 'বরিশাল',
  'rangpur', 'রংপুর',
  'mymensingh', 'ময়মনসিংহ',
  'gazipur', 'গাজীপুর',
  'narayanganj', 'নারায়ণগঞ্জ',
  'cumilla', 'comilla', 'কুমিল্লা',
  'feni', 'ফেনী',
  'brahmanbaria', 'ব্রাহ্মণবাড়িয়া',
  'noakhali', 'নোয়াখালী',
  'chandpur', 'চাঁদপুর',
  'lakshmipur', 'লক্ষ্মীপুর',
  'coxs bazar', "cox's bazar", 'coxsbazar', 'কক্সবাজার',
  'bogura', 'bogra', 'বগুড়া',
  'pabna', 'পাবনা',
  'sirajganj', 'সিরাজগঞ্জ',
  'jashore', 'jessore', 'যশোর',
  'kushtia', 'কুষ্টিয়া',
  'tangail', 'টাঙ্গাইল',
  'faridpur', 'ফরিদপুর',
  'manikganj', 'মানিকগঞ্জ',
  'munshiganj', 'মুন্সীগঞ্জ',
  'narsingdi', 'নরসিংদী',
  'dinajpur', 'দিনাজপুর',
  'moulvibazar', 'মৌলভীবাজার',
  'habiganj', 'হবিগঞ্জ',
  'sunamganj', 'সুনামগঞ্জ',
  'patuakhali', 'পটুয়াখালী',
  // Dhaka Sub-urban Courier Zones
  'savar', 'সাভার',
  'ashulia', 'আশুলিয়া',
  'keraniganj', 'কেরানীগঞ্জ',
  'dhamrai', 'ধামরাই',
];

/**
 * Detects if a text string contains keywords indicating the address is outside Dhaka city.
 */
export function detectOutsideDhakaMatch(text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const kw of OUTSIDE_DHAKA_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      return kw;
    }
  }
  return null;
}
