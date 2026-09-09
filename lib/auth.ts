const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export const AUTH_TOKEN_KEY = process.env.AUTH_TOKEN_KEY ?? 'auth_token'

export function getApiUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`
}

export function storeAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
}