import { cookies } from 'next/headers'

export type AdminSession = {
  id: string
  email: string
  name: string
  role: string
  token: string
}

export function getAdminSession(): AdminSession | null {
  try {
    const sessionCookie = cookies().get('admin_session')
    if (!sessionCookie?.value) return null

    return JSON.parse(sessionCookie.value) as AdminSession
  } catch {
    return null
  }
}

export function requireAdminAuth(): AdminSession {
  const session = getAdminSession()
  if (!session) {
    throw new Error('Admin authentication required')
  }
  return session
}
