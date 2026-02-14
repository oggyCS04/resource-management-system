import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode("rms_secret_key_change_later")

export async function getUserFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload
  } catch {
    return null
  }
}
