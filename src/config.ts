const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
export const API_URL = rawApiUrl || 'https://onwear-server-bnwo.onrender.com/api';
export const GOOGLE_CLIENT_ID = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim().replace(/^["']|["']$/g, '');
