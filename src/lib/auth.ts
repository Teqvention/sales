import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from './db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionUser {
	id: string
	username: string
	role: 'ADMIN' | 'EMPLOYEE'
}

export interface Session {
	user: SessionUser
	expiresAt: Date
}

export async function createSession(userId: string): Promise<string> {
	const token = crypto.randomBytes(32).toString('hex')
	const expiresAt = new Date(Date.now() + SESSION_DURATION)

	await db.session.create({
		data: {
			token,
			userId,
			expiresAt,
		},
	})

	return token
}

export async function verifySession(token: string): Promise<Session | null> {
	const session = await db.session.findUnique({
		where: { token },
		include: { user: true },
	})

	if (!session) return null
	if (session.expiresAt < new Date()) {
		await db.session.delete({ where: { id: session.id } })
		return null
	}

	return {
		user: {
			id: session.user.id,
			username: session.user.username,
			role: session.user.role as 'ADMIN' | 'EMPLOYEE',
		},
		expiresAt: session.expiresAt,
	}
}

export async function deleteSession(token: string): Promise<void> {
	await db.session.deleteMany({ where: { token } })
}

export async function getCurrentUser(): Promise<SessionUser | null> {
	const cookieStore = await cookies()
	const token = cookieStore.get('session')?.value

	if (!token) return null

	const session = await verifySession(token)
	return session?.user ?? null
}

export async function requireAuth(): Promise<SessionUser> {
	const user = await getCurrentUser()
	if (!user) redirect('/login')
	return user
}

export async function requireAdmin(): Promise<SessionUser> {
	const user = await requireAuth()
	if (user.role !== 'ADMIN') redirect('/calling')
	return user
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash)
}

// Simple encryption for recoverable passwords
const ALGORITHM = 'aes-256-gcm'

export function encryptPassword(password: string): string {
	const key = process.env.ENCRYPTION_KEY || '32-char-secret-key-change-prod!!'
	const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32))
	const iv = crypto.randomBytes(16)
	const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv)

	let encrypted = cipher.update(password, 'utf8', 'hex')
	encrypted += cipher.final('hex')
	const authTag = cipher.getAuthTag()

	return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decryptPassword(encrypted: string): string {
	const key = process.env.ENCRYPTION_KEY || '32-char-secret-key-change-prod!!'
	const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32))
	const [ivHex, authTagHex, encryptedData] = encrypted.split(':')

	const iv = Buffer.from(ivHex, 'hex')
	const authTag = Buffer.from(authTagHex, 'hex')
	const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv)
	decipher.setAuthTag(authTag)

	let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
	decrypted += decipher.final('utf8')

	return decrypted
}

// Generate random password
export function generatePassword(length = 12): string {
	const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
	let password = ''
	const randomBytes = crypto.randomBytes(length)
	for (let i = 0; i < length; i++) {
		password += chars[randomBytes[i] % chars.length]
	}
	return password
}
