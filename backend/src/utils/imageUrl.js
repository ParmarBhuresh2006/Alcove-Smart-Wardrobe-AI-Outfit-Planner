const path = require('path');

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

/**
 * Converts an imagePath or imageUrl stored in DB into a valid, reachable HTTP URL.
 * Handles Windows paths, relative upload paths, full URLs, data URIs, and fallback placeholders.
 */
function buildImageUrl(req, filePath, fallbackUrl = null) {
  if (!filePath) return fallbackUrl;

  // If already a full URL or data URI, return as-is
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('data:') ||
    filePath.startsWith('blob:')
  ) {
    return filePath;
  }

  // Normalize backslashes
  const normalized = String(filePath).replace(/\\/g, '/');

  let relative = '';
  if (normalized.includes('/uploads/')) {
    relative = normalized.split('/uploads/').pop();
  } else if (normalized.startsWith('uploads/')) {
    relative = normalized.substring('uploads/'.length);
  } else if (normalized.startsWith('/uploads/')) {
    relative = normalized.substring('/uploads/'.length);
  } else {
    try {
      relative = path.relative(UPLOAD_DIR, filePath).replace(/\\/g, '/');
      if (relative.startsWith('..')) {
        relative = path.basename(filePath);
      }
    } catch {
      relative = path.basename(filePath);
    }
  }

  // Clean leading slashes
  relative = relative.replace(/^\/+/, '');

  // Determine protocol & host from request
  let protocol = 'http';
  let host = 'localhost:5000';

  if (req) {
    if (req.protocol) protocol = req.protocol;
    if (req.get && req.get('host')) host = req.get('host');
  }

  return `${protocol}://${host}/uploads/${relative}`;
}

module.exports = { buildImageUrl, UPLOAD_DIR };
