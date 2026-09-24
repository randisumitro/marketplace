const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string | null
}

async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = await res.json().catch(() => null)

  if (!res.ok || !json?.success) {
    throw new ApiError(json?.error ?? 'Terjadi kesalahan pada server', res.status)
  }

  return json as T
}

/** Untuk multipart/form-data (upload gambar) — jangan set Content-Type manual, browser yang isi boundary-nya. */
async function requestForm<T>(path: string, method: 'POST' | 'PUT', formData: FormData, token?: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })

  const json = await res.json().catch(() => null)

  if (!res.ok || !json?.success) {
    throw new ApiError(json?.error ?? 'Terjadi kesalahan pada server', res.status)
  }

  return json as T
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>(path, { method: 'GET', token }),
  post: <T>(path: string, body?: unknown, token?: string | null) => request<T>(path, { method: 'POST', body, token }),
  put: <T>(path: string, body?: unknown, token?: string | null) => request<T>(path, { method: 'PUT', body, token }),
  del: <T>(path: string, token?: string | null) => request<T>(path, { method: 'DELETE', token }),
  postForm: <T>(path: string, formData: FormData, token?: string | null) => requestForm<T>(path, 'POST', formData, token),
  putForm: <T>(path: string, formData: FormData, token?: string | null) => requestForm<T>(path, 'PUT', formData, token),
}
