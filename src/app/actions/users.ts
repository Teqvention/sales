'use server'

import { db } from '@/lib/db'
import {
	requireAdmin,
	hashPassword,
	generatePassword,
	encryptPassword,
	decryptPassword,
} from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { User, UserWithPassword, Role } from '@/lib/types'

export async function getAllUsers(): Promise<User[]> {
	await requireAdmin()

	const users = await db.user.findMany({
		select: {
			id: true,
			username: true,
			role: true,
			createdAt: true,
		},
		orderBy: { createdAt: 'desc' },
	})

	return users.map((u) => ({
		...u,
		role: u.role as Role,
	}))
}

export async function createUser(username: string): Promise<UserWithPassword> {
	await requireAdmin()

	// Check if username exists
	const existing = await db.user.findUnique({
		where: { username },
	})

	if (existing) {
		throw new Error('Benutzername bereits vergeben')
	}

	const plainPassword = generatePassword()
	const passwordHash = await hashPassword(plainPassword)
	const encryptedPw = encryptPassword(plainPassword)

	const user = await db.user.create({
		data: {
			username,
			passwordHash,
			encryptedPw,
		},
	})

	revalidatePath('/admin/users')

	return {
		id: user.id,
		username: user.username,
		role: user.role as Role,
		createdAt: user.createdAt,
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

	revalidatePath('/admin/users')
}

export async function resetUserPassword(userId: string): Promise<string> {
	await requireAdmin()

	const plainPassword = generatePassword()
	const passwordHash = await hashPassword(plainPassword)
	const encryptedPw = encryptPassword(plainPassword)

	await db.user.update({
		where: { id: userId },
		data: { passwordHash, encryptedPw },
	})

	revalidatePath('/admin/users')

	return plainPassword
}

export async function deleteUser(userId: string): Promise<void> {
	await requireAdmin()

	await db.user.delete({
		where: { id: userId },
	})

	revalidatePath('/admin/users')
}
