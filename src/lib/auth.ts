import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from './db'
import crypto from 'crypto'

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 6,
	},
	session: {
		expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
		updateAge: 24 * 60 * 60, // Update session every 24 hours
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'EMPLOYEE',
				input: false,
			},
			encryptedPw: {
				type: 'string',
				required: false,
				input: false,
			},
		},
	},
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user

export interface SessionUser {
	id: string
	name: string
	email: string
	role: 'ADMIN' | 'EMPLOYEE'
}

export async function getSession() {
	const headersList = await headers()
	return auth.api.getSession({
		headers: headersList,
	})
}

export async function getCurrentUser(): Promise<SessionUser | null> {
	const session = await getSession()
	if (!session?.user) return null

	// Fetch additional user data from DB (role)
	const dbUser = await db.user.findUnique({
		where: { id: session.user.id },
		select: { role: true },
	})

	return {
		id: session.user.id,
		name: session.user.name,
		email: session.user.email,
		role: (dbUser?.role as 'ADMIN' | 'EMPLOYEE') || 'EMPLOYEE',
	}
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
