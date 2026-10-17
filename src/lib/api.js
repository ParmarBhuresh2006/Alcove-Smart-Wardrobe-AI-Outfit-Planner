/**
 * src/lib/api.js
 * Centralized API client for the Alcove backend.
 * All fetch calls go through this module — handles auth headers and error parsing.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('alcove_token');
}

async function request(method, path, body = null, isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const options = {
    method,
    headers,
    signal: controller.signal,
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : undefined,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch (fetchErr) {
    if (fetchErr.name === 'AbortError') {
      throw new Error('API request timed out. Please check if the backend server is running.');
    }
    throw fetchErr;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => null);

  // Handle 401 — token expired or invalid credentials
  if (response.status === 401) {
    localStorage.removeItem('alcove_token');
    localStorage.removeItem('alcove_user');
    const isAuthRoute = path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register');
    if (!isAuthRoute && typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }

  if (!response.ok) {
    const message = data?.error || `HTTP ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  login:    (email, password)      => request('POST', '/api/auth/login',    { email, password }),
  register: (name, email, password)=> request('POST', '/api/auth/register', { name, email, password }),
  getMe:    ()                     => request('GET',  '/api/auth/me'),
  updateMe: (data)                 => request('PUT',  '/api/auth/me', data),
};

// ── Wardrobe ─────────────────────────────────────────────────────────────────
export const wardrobe = {
  list:          (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/api/wardrobe${q ? '?' + q : ''}`);
  },
  get:           (id)          => request('GET',    `/api/wardrobe/${id}`),
  create:        (formData)    => request('POST',   '/api/wardrobe', formData, true),
  update:        (id, data)    => request('PUT',    `/api/wardrobe/${id}`, data),
  delete:        (id)          => request('DELETE', `/api/wardrobe/${id}`),
  updateStatus:  (id, status)  => request('PUT',    `/api/wardrobe/${id}/status`, { status }),
  getAnalysis:   ()            => request('GET',    '/api/wardrobe/analysis'),
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const ai = {
  /**
   * Analyze an image file. Returns prediction JSON.
   * @param {File} file
   */
  analyze: (file) => {
    const form = new FormData();
    form.append('image', file);
    return request('POST', '/api/ai/analyze', form, true);
  },
  /**
   * Confirm analysis and save item to wardrobe.
   */
  confirm: (data) => request('POST', '/api/ai/confirm', data),
};

// ── Outfits ───────────────────────────────────────────────────────────────────
export const outfits = {
  recommend: (occasion, weather, location, count) =>
    request('POST', '/api/outfits/recommend', { occasion, weather, location, count }),
  list:     ()       => request('GET', '/api/outfits'),
  save:     (data)   => request('POST', '/api/outfits', data),
  get:      (id)     => request('GET', `/api/outfits/${id}`),
  delete:   (id)     => request('DELETE', `/api/outfits/${id}`),
  wear:     (id)     => request('POST', `/api/outfits/${id}/wear`),
  feedback: (id, vote, reason) => request('POST', `/api/outfits/${id}/feedback`, { vote, reason }),
  share:    (id)     => request('POST', `/api/outfits/${id}/share`),
  getShared:(shareId)=> request('GET', `/api/outfits/share/${shareId}`),
  sharedFeedback: (shareId, vote, reason) =>
    request('POST', `/api/outfits/share/${shareId}/feedback`, { vote, reason, source: 'share' }),
};

// ── Calendar ──────────────────────────────────────────────────────────────────
export const calendar = {
  get:  (year, month) => request('GET', `/api/calendar?year=${year}&month=${month}`),
  log:  (data)        => request('POST', '/api/calendar', data),
};

// ── Trips ─────────────────────────────────────────────────────────────────────
export const trips = {
  list:   ()      => request('GET', '/api/trips'),
  create: (data)  => request('POST', '/api/trips', data),
  get:    (id)    => request('GET', `/api/trips/${id}`),
  update: (id, d) => request('PUT', `/api/trips/${id}`, d),
  delete: (id)    => request('DELETE', `/api/trips/${id}`),
};

export default { auth, wardrobe, ai, outfits, calendar, trips };
