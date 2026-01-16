'use server'

import { db } from '@/lib/db'
import { auth, requireAdmin, generatePassword, encryptPassword, decryptPassword } from '@/lib/auth'
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache'
import type { User, UserWithPassword, Role } from '@/lib/types'
import { createNotification } from './notifications'

// Internal cached function
const _getCachedUsers = unstable_cache(
	async () => {
		const users = await db.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
			},
			orderBy: { createdAt: 'desc' },
		})

		return users.map((u) => ({
			...u,
			role: u.role as Role,
		}))
	},
	['users-list'],
	{
		revalidate: 3600,
		tags: ['users-list'],
	}
)

export async function getAllUsers(): Promise<User[]> {
	await requireAdmin()
	return _getCachedUsers()
}

export async function createUser(name: string, email: string): Promise<UserWithPassword> {
	await requireAdmin()

	// Check if email exists
	const existing = await db.user.findUnique({
		where: { email },
	})

	if (existing) {
		throw new Error('E-Mail bereits vergeben')
	}

	const plainPassword = generatePassword()
	const encryptedPw = encryptPassword(plainPassword)

	// Use better-auth's internal API to create user with proper password hashing
	const ctx = await auth.api.signUpEmail({
		body: {
			email,
			password: plainPassword,
			name,
		},
		asResponse: false,
	})

	if (!ctx?.user) {
		throw new Error('Benutzer konnte nicht erstellt werden')
	}

	// Update with encrypted password for admin view
	await db.user.update({
		where: { id: ctx.user.id },
		data: { encryptedPw },
	})

	revalidateTag('users-list', 'default')
	revalidatePath('/admin/users')

	return {
		id: ctx.user.id,
		name: ctx.user.name,
		email: ctx.user.email,
		role: 'EMPLOYEE' as Role,
		createdAt: ctx.user.createdAt,
		plainPassword,
	}
}

export async function getUserPassword(userId: string): Promise<string | null> {
	await requireAdmin()

	const user = await db.user.findUnique({
		where: { id: userId },
		select: { encryptedPw: true },
	})

	if (!user?.encryptedPw) return null

	return decryptPassword(user.encryptedPw)
}

export async function updateUserRole(userId: string, role: Role): Promise<void> {
	await requireAdmin()

	await db.user.update({
		where: { id: userId },
		data: { role },
	})

	// Notify user about role change
	await createNotification(
		userId,
		'Rolle geändert',
		`Ihre Rolle wurde zu ${role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'} geändert.`,
		'info'
	)

	revalidateTag('users-list', 'default')
	revalidatePath('/admin/users')
}

export async function resetUserPassword(userId: string): Promise<string> {
	await requireAdmin()

	const plainPassword = generatePassword()
	const encryptedPw = encryptPassword(plainPassword)

	// Get the account for this user
	const account = await db.account.findFirst({
		where: { userId, providerId: 'credential' },
	})

	if (account) {
		// Hash the password using better-auth's context
		const ctx = await auth.$context
		const hashedPassword = await ctx.password.hash(plainPassword)

		await db.account.update({
			where: { id: account.id },
			data: { password: hashedPassword },
		})
	}

	// Update encrypted password for admin view
	await db.user.update({
		where: { id: userId },
		data: { encryptedPw },
	})

	revalidateTag('users-list', 'default')
	revalidatePath('/admin/users')

	return plainPassword
}

export async function deleteUser(userId: string): Promise<void> {
	await requireAdmin()

	await db.user.delete({
		where: { id: userId },
	})

	revalidateTag('users-list', 'default')
	revalidatePath('/admin/users')
}
