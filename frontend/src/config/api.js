// API configuration
// empty string          → nginx-proxied relative paths (Docker Compose / Render static site via its own proxy)
// bare hostname         → Render: fromService gives host without scheme → prepend https://
// full http(s):// URL  → explicit override (local dev or custom domain)
// undefined             → local dev fallback to localhost:8000
const _raw = import.meta.env.VITE_API_URL
const API_URL =
  _raw === undefined
    ? 'http://localhost:8000'          // dev: not set at all
    : _raw === ''
    ? ''                               // Docker / Render nginx proxy (relative paths)
    : _raw.startsWith('http')
    ? _raw                             // already a full URL
    : `https://${_raw}`                // Render: bare hostname from fromService

export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${API_URL}/${cleanEndpoint}`
}

export default API_URL
