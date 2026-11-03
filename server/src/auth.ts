import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { jwtVerify, SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || randomBytes(32).toString('hex'))

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function checkPassword(password: string, saved: string) {
  const [salt, hash] = saved.split(':')
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'))
}

export function createToken(userId: number) {
  return new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setExpirationTime('30d')
    .sign(secret)
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '') ?? ''
  try {
    const { payload } = await jwtVerify(token, secret)
    res.locals.userId = Number(payload.sub)
    next()
  } catch {
    res.status(401).json({ error: 'Нужно войти' })
  }
}
