export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?crop=entropy&cs=srgb&fm=jpg&w=800&q=80';

/**
 * Resolves an image URL safely for the frontend.
 * Prepends VITE_API_URL if the URL is a relative server path (/uploads/...).
 * Handles null/undefined with default fallback.
 */
export function resolveImageUrl(url, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (!url) return fallback;

  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${path}`;
}

/**
 * Graceful error handler for <img> tags.
 * Falls back to fallback image if the primary image URL fails to load.
 */
export function handleImageError(e, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (e && e.target && e.target.src !== fallback) {
    e.target.src = fallback;
  }
}

export default { resolveImageUrl, handleImageError, DEFAULT_FALLBACK_IMAGE };
