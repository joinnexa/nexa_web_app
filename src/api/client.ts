import axios, { type AxiosInstance } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

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
