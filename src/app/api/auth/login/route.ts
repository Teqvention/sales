import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
	const startTime = Date.now()
	try {
		const { username, password } = await request.json()

		if (!username || !password) {
			return NextResponse.json(
				{ error: 'Benutzername und Passwort erforderlich' },
				{ status: 400 }
			)
		}

		const dbStart = Date.now()
		const user = await db.user.findUnique({
			where: { username },
		})
		console.log(`[login] db.user.findUnique: ${Date.now() - dbStart}ms`)

		if (!user) {
			return NextResponse.json(
				{ error: 'Ungültige Anmeldedaten' },
				{ status: 401 }
			)
		}

		const pwStart = Date.now()
		const isValid = await verifyPassword(password, user.passwordHash)
		console.log(`[login] verifyPassword: ${Date.now() - pwStart}ms`)

		if (!isValid) {
			return NextResponse.json(
				{ error: 'Ungültige Anmeldedaten' },
				{ status: 401 }
			)
		}

		const sessionStart = Date.now()
		const token = await createSession(user.id)
		console.log(`[login] createSession: ${Date.now() - sessionStart}ms`)

		const cookieStore = await cookies()
		cookieStore.set('session', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60, // 7 days
			path: '/',
		})

		console.log(`[login] total: ${Date.now() - startTime}ms`)
		return NextResponse.json({
			user: {
				id: user.id,
				username: user.username,
				role: user.role,
			},
		})
	} catch (error) {
		console.error(`[login] error after ${Date.now() - startTime}ms:`, error)
		return NextResponse.json(
			{ error: 'Ein Fehler ist aufgetreten' },
			{ status: 500 }
		)
	}
}
