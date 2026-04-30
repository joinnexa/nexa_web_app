import axios, { type AxiosInstance } from 'axios'

const envBase = import.meta.env.VITE_API_BASE_URL?.trim()
const baseURL =
  envBase ||
  (import.meta.env.DEV ? '/api/v1' : 'http://localhost:3000/api/v1')

/** Same origin as axios `apiClient` (for authenticated media fetch / `<img>` blob URLs). */
export function getApiBaseUrl(): string {
  return baseURL
}

function getToken(): string | null {
  return localStorage.getItem('nexa_admin_token')
}

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nexa_admin_token')
      localStorage.removeItem('nexa_admin_user')
      window.dispatchEvent(new Event('nexa:unauthorized'))
    }
    return Promise.reject(err)
  }
)

export function setAuthToken(token: string) {
  localStorage.setItem('nexa_admin_token', token)
}

export function clearAuth() {
  localStorage.removeItem('nexa_admin_token')
  localStorage.removeItem('nexa_admin_user')
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
