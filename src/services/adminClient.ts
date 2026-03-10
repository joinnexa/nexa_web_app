import axios from 'axios'
import { api } from './api'

export class AdminApiError extends Error {
  status?: number
  code?: string
  details?: unknown
}

const unwrap = <T>(response: any): T => {
  return (response?.data?.data ?? response?.data) as T
}

const mapError = (error: unknown): AdminApiError => {
  const e = new AdminApiError('Request failed')
  if (axios.isAxiosError(error)) {
    e.status = error.response?.status
    const body = error.response?.data
    const normalized = body?.error ?? body
    e.code = normalized?.code ?? body?.code
    e.message =
      normalized?.message ??
      body?.message ??
      error.message ??
      'Unexpected API error'
    e.details = normalized?.details ?? body
    return e
  }
  if (error instanceof Error) {
    e.message = error.message
  }
  return e
}

export const adminClient = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await api.get(url, { params })
      return unwrap<T>(response)
    } catch (error) {
      throw mapError(error)
    }
  },
  async post<T>(
    url: string,
    body?: Record<string, unknown> | undefined,
  ): Promise<T> {
    try {
      const response = await api.post(url, body)
      return unwrap<T>(response)
    } catch (error) {
      throw mapError(error)
    }
  },
  async patch<T>(
    url: string,
    body?: Record<string, unknown> | undefined,
  ): Promise<T> {
    try {
      const response = await api.patch(url, body)
      return unwrap<T>(response)
    } catch (error) {
      throw mapError(error)
    }
  },
}
