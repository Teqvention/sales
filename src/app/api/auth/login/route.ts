import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json()

		if (!username || !password) {
			return NextResponse.json(
				{ error: 'Benutzername und Passwort erforderlich' },
				{ status: 400 }
			)
		}

		const user = await db.user.findUnique({
			where: { username },
		})

		if (!user) {
			return NextResponse.json(
				{ error: 'Ungültige Anmeldedaten' },
				{ status: 401 }
			)
		}

		const isValid = await verifyPassword(password, user.passwordHash)

		if (!isValid) {
			return NextResponse.json(
				{ error: 'Ungültige Anmeldedaten' },
				{ status: 401 }
			)
		}

		const token = await createSession(user.id)

		const cookieStore = await cookies()
		cookieStore.set('session', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60, // 7 days
			path: '/',
		})

		return NextResponse.json({
			user: {
				id: user.id,
				username: user.username,
				role: user.role,
			},
		})
	} catch {
		return NextResponse.json(
			{ error: 'Ein Fehler ist aufgetreten' },
			{ status: 500 }
		)
	}
}
