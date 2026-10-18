const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

function buildApiUrl(path) {
  const normalizedPath = `/${String(path).replace(/^\/+/, '')}`
  const base = `${API_BASE}${normalizedPath}`

  if (/^https?:\/\//i.test(API_BASE)) return new URL(base)
  return new URL(base, window.location.origin)
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request(path, { token, method = 'GET', body, query } = {}) {
  const url = buildApiUrl(path)
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  })
  let response
  try {
    response = await fetch(url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new ApiError(`No se pudo conectar con la API en ${API_BASE}. Revisá que el backend esté activo y que la ruta de conexión esté disponible.`)
  }
  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const details = payload?.detalle
    const message = Array.isArray(details)
      ? details.map((item) => `${Array.isArray(item.ubicacion) ? item.ubicacion.join('.') : ''}: ${item.mensaje}`).join(' · ')
      : typeof details === 'string' ? details : `La solicitud no se pudo completar (${response.status}).`
    throw new ApiError(message, response.status)
  }
  return payload
}

export const apiBaseUrl = API_BASE
