'use server'

import { db } from '@/lib/db'
import { auth, requireAuth, encryptPassword } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateProfile(name: string): Promise<void> {
	const user = await requireAuth()

	await db.user.update({
		where: { id: user.id },
		data: { name },
	})

	revalidatePath('/settings')
}

export async function changePassword(
	currentPassword: string,
	newPassword: string
): Promise<void> {
	const user = await requireAuth()

	// Get the credential account for this user
	const account = await db.account.findFirst({
		where: { userId: user.id, providerId: 'credential' },
	})

	if (!account?.password) {
		throw new Error('Kein Passwort-Account gefunden')
	}

	// Verify current password using better-auth's context
	const ctx = await auth.$context
	const isValid = await ctx.password.verify({
		hash: account.password,
		password: currentPassword,
	})

	if (!isValid) {
		throw new Error('Aktuelles Passwort ist falsch')
	}

	// Hash new password
	const hashedPassword = await ctx.password.hash(newPassword)
	const encryptedPw = encryptPassword(newPassword)

	// Update password in account table
	await db.account.update({
		where: { id: account.id },
		data: { password: hashedPassword },
	})

	// Update encrypted password for admin view
	await db.user.update({
		where: { id: user.id },
		data: { encryptedPw },
	})

	revalidatePath('/settings')
}
