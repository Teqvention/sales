'use server'

import { db } from '@/lib/db'
import { requireAuth, hashPassword, verifyPassword, encryptPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateProfile(username: string): Promise<void> {
	const user = await requireAuth()

	// Check if username is taken by another user
	const existing = await db.user.findFirst({
		where: {
			username,
			NOT: { id: user.id },
		},
	})

	if (existing) {
		throw new Error('Benutzername bereits vergeben')
	}

	await db.user.update({
		where: { id: user.id },
		data: { username },
	})

	revalidatePath('/settings')
}

export async function changePassword(
	currentPassword: string,
	newPassword: string
): Promise<void> {
	const user = await requireAuth()

	const dbUser = await db.user.findUnique({
		where: { id: user.id },
	})

	if (!dbUser) {
		throw new Error('Benutzer nicht gefunden')
	}

	const isValid = await verifyPassword(currentPassword, dbUser.passwordHash)

	if (!isValid) {
		throw new Error('Aktuelles Passwort ist falsch')
	}

	const passwordHash = await hashPassword(newPassword)
	const encryptedPw = encryptPassword(newPassword)

	await db.user.update({
		where: { id: user.id },
		data: { passwordHash, encryptedPw },
	})

	revalidatePath('/settings')
}
