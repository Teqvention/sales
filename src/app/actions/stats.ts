'use server'

import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import type { UserStats, DailyVolume, MonthlyVolume } from '@/lib/types'

export async function getUserStats(): Promise<UserStats> {
	const user = await requireAuth()

	const now = new Date()
	const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const startOfWeek = new Date(startOfDay)
	startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

	const [totalCalls, callsToday, callsThisWeek, appointmentsBooked, conversions] =
		await Promise.all([
			db.call.count({
				where: { userId: user.id },
			}),
			db.call.count({
				where: {
					userId: user.id,
					createdAt: { gte: startOfDay },
				},
			}),
			db.call.count({
				where: {
					userId: user.id,
					createdAt: { gte: startOfWeek },
				},
			}),
			db.appointment.count({
				where: { userId: user.id },
			}),
			db.appointment.count({
				where: {
					userId: user.id,
					status: 'CONVERTED',
				},
			}),
		])

	const appointmentRate = totalCalls > 0
		? Math.round((appointmentsBooked / totalCalls) * 100)
		: 0

	return {
		totalCalls,
		callsToday,
		callsThisWeek,
		appointmentsBooked,
		conversions,
		appointmentRate,
	}
}

export async function getDailyCallVolume(days = 14): Promise<DailyVolume[]> {
	const user = await requireAuth()

	const startDate = new Date()
	startDate.setDate(startDate.getDate() - days)
	startDate.setHours(0, 0, 0, 0)

	const calls = await db.call.findMany({
		where: {
			userId: user.id,
			createdAt: { gte: startDate },
		},
		select: { createdAt: true },
	})

	// Group by date
	const volumeMap = new Map<string, number>()

	// Initialize all days
	for (let i = 0; i < days; i++) {
		const date = new Date()
		date.setDate(date.getDate() - i)
		const dateStr = date.toISOString().split('T')[0]
		volumeMap.set(dateStr, 0)
	}

	// Count calls per day
	for (const call of calls) {
		const dateStr = call.createdAt.toISOString().split('T')[0]
		volumeMap.set(dateStr, (volumeMap.get(dateStr) || 0) + 1)
	}

	// Convert to array and sort
	return Array.from(volumeMap.entries())
		.map(([date, calls]) => ({ date, calls }))
		.sort((a, b) => a.date.localeCompare(b.date))
}

export async function getWeeklyCallVolume(): Promise<DailyVolume[]> {
	return getDailyCallVolume(7)
}

export async function getMonthlyCallVolume(): Promise<DailyVolume[]> {
	return getDailyCallVolume(30)
}

export async function getYearlyCallVolume(): Promise<MonthlyVolume[]> {
	const user = await requireAuth()

	const startDate = new Date()
	startDate.setMonth(startDate.getMonth() - 12)
	startDate.setDate(1)
	startDate.setHours(0, 0, 0, 0)

	const calls = await db.call.findMany({
		where: {
			userId: user.id,
			createdAt: { gte: startDate },
		},
		select: { createdAt: true },
	})

	// Group by month
	const volumeMap = new Map<string, number>()

	// Initialize all months
	for (let i = 11; i >= 0; i--) {
		const date = new Date()
		date.setMonth(date.getMonth() - i)
		const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		volumeMap.set(monthStr, 0)
	}

	// Count calls per month
	for (const call of calls) {
		const date = call.createdAt
		const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		if (volumeMap.has(monthStr)) {
			volumeMap.set(monthStr, (volumeMap.get(monthStr) || 0) + 1)
		}
	}

	// Convert to array and sort
	return Array.from(volumeMap.entries())
		.map(([month, calls]) => ({ month, calls }))
		.sort((a, b) => a.month.localeCompare(b.month))
}
