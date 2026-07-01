const COOKIE_PREFIX = 'zhamat_'

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(`(?:^|;\\s*)${COOKIE_PREFIX}${encodeURIComponent(name)}=([^;]*)`)
  return match ? decodeURIComponent(match[1]) : null
}

export function setCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${COOKIE_PREFIX}${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

export function removeCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${COOKIE_PREFIX}${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}
