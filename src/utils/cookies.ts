const DEFAULT_MAX_AGE = 60 * 60 * 24 * 30

const encode = (value: string) => encodeURIComponent(value)
const decode = (value: string) => decodeURIComponent(value)

export const getCookie = (name: string) => {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${encode(name)}=`))

  return cookie ? decode(cookie.split('=').slice(1).join('=')) : null
}

export const setCookie = (name: string, value: string, maxAge = DEFAULT_MAX_AGE) => {
  document.cookie = `${encode(name)}=${encode(value)}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export const deleteCookie = (name: string) => {
  document.cookie = `${encode(name)}=; path=/; max-age=0; SameSite=Lax`
}

export const getJsonCookie = <Value>(name: string): Value | null => {
  const value = getCookie(name)
  if (!value) return null

  try {
    return JSON.parse(value) as Value
  } catch {
    deleteCookie(name)
    return null
  }
}

export const setJsonCookie = (name: string, value: unknown, maxAge?: number) => {
  setCookie(name, JSON.stringify(value), maxAge)
}

export const hasCookieConsent = () => getCookie('collabos:cookieConsent') === 'accepted'

export const hasCookieChoice = () => Boolean(getCookie('collabos:cookieConsent'))

export const setCookieConsent = (accepted: boolean) => {
  setCookie('collabos:cookieConsent', accepted ? 'accepted' : 'declined', 60 * 60 * 24 * 365)
}
