/**
 * Helper to generate fast, auto-compressed, and responsive image URLs
 * Supports Cloudinary transformations (f_auto, q_auto, width resize)
 * and Unsplash dynamic sizing.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  width: number = 800,
  quality: number = 80
): string {
  if (!url || typeof url !== 'string') return '/placeholder.svg';
  const cleanUrl = url.trim();

  // 1. Cloudinary URL optimization
  // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567/sample.jpg
  // -> https://res.cloudinary.com/cloud_name/image/upload/f_auto,q_auto,w_800,c_limit/v1234567/sample.jpg
  if (cleanUrl.includes('res.cloudinary.com') && cleanUrl.includes('/upload/')) {
    // If already has transformation parameters, don't duplicate
    if (cleanUrl.includes('/upload/f_auto') || cleanUrl.includes('/upload/q_auto') || cleanUrl.includes('/upload/w_')) {
      return cleanUrl;
    }
    const transform = `f_auto,q_auto:good,w_${width},c_limit`;
    return cleanUrl.replace('/upload/', `/upload/${transform}/`);
  }

  // 2. Unsplash URL optimization
  if (cleanUrl.includes('images.unsplash.com')) {
    const urlObj = new URL(cleanUrl);
    urlObj.searchParams.set('auto', 'format');
    urlObj.searchParams.set('fit', 'crop');
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', quality.toString());
    return urlObj.toString();
  }

  return cleanUrl;
}
