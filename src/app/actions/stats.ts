'use server'

import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { unstable_cache } from 'next/cache'
import type { UserStats, DailyVolume, MonthlyVolume } from '@/lib/types'

async function fetchUserStats(userId: string): Promise<UserStats> {
	const now = new Date()
	const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const startOfWeek = new Date(startOfDay)
	startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

	// Calculate date ranges for trends (last 7 days vs previous 7 days)
	const last7DaysStart = new Date(now)
	last7DaysStart.setDate(last7DaysStart.getDate() - 7)
	last7DaysStart.setHours(0, 0, 0, 0)

	const previous7DaysStart = new Date(last7DaysStart)
	previous7DaysStart.setDate(previous7DaysStart.getDate() - 7)
	const previous7DaysEnd = new Date(last7DaysStart)

	const yesterday = new Date(startOfDay)
	yesterday.setDate(yesterday.getDate() - 1)

	const [
		totalCalls,
		callsToday,
		callsThisWeek,
		appointmentsBooked,
		conversions,
		// Trend data: last 7 days
		callsLast7Days,
		appointmentsLast7Days,
		conversionsLast7Days,
		// Trend data: previous 7 days
		callsPrevious7Days,
		appointmentsPrevious7Days,
		conversionsPrevious7Days,
		// Yesterday for callsToday trend
		callsYesterday,
	] = await Promise.all([
		db.call.count({
			where: { userId },
		}),
		db.call.count({
			where: {
				userId,
				createdAt: { gte: startOfDay },
			},
		}),
		db.call.count({
			where: {
				userId,
				createdAt: { gte: startOfWeek },
			},
		}),
		db.appointment.count({
			where: { userId },
		}),
		db.appointment.count({
			where: {
				userId,
				status: 'CONVERTED',
			},
		}),
		// Last 7 days
		db.call.count({
			where: {
				userId,
				createdAt: { gte: last7DaysStart },
			},
		}),
		db.appointment.count({
			where: {
				userId,
				createdAt: { gte: last7DaysStart },
			},
		}),
		db.appointment.count({
			where: {
				userId,
				status: 'CONVERTED',
				createdAt: { gte: last7DaysStart },
			},
		}),
		// Previous 7 days
		db.call.count({
			where: {
				userId,
				createdAt: {
					gte: previous7DaysStart,
					lt: previous7DaysEnd,
				},
			},
		}),
		db.appointment.count({
			where: {
				userId,
				createdAt: {
					gte: previous7DaysStart,
					lt: previous7DaysEnd,
				},
			},
		}),
		db.appointment.count({
			where: {
				userId,
				status: 'CONVERTED',
				createdAt: {
					gte: previous7DaysStart,
					lt: previous7DaysEnd,
				},
			},
		}),
		// Yesterday
		db.call.count({
			where: {
				userId,
				createdAt: {
					gte: yesterday,
					lt: startOfDay,
				},
			},
		}),
	])

	const appointmentRate = totalCalls > 0
		? Math.round((appointmentsBooked / totalCalls) * 100)
		: 0

	// Calculate appointment rate for last 7 days and previous 7 days
	const appointmentRateLast7Days = callsLast7Days > 0
		? Math.round((appointmentsLast7Days / callsLast7Days) * 100)
		: 0
	const appointmentRatePrevious7Days = callsPrevious7Days > 0
		? Math.round((appointmentsPrevious7Days / callsPrevious7Days) * 100)
		: 0

	// Calculate trends (only show if there's a change)
	const calculateTrend = (current: number, previous: number): 'up' | 'down' | null => {
		if (current > previous) return 'up'
		if (current < previous) return 'down'
		return null
	}

	return {
		totalCalls,
		callsToday,
		callsThisWeek,
		appointmentsBooked,
		conversions,
		appointmentRate,
		trends: {
			callsToday: calculateTrend(callsToday, callsYesterday),
			callsThisWeek: calculateTrend(callsLast7Days, callsPrevious7Days),
			appointmentsBooked: calculateTrend(appointmentsLast7Days, appointmentsPrevious7Days),
			conversions: calculateTrend(conversionsLast7Days, conversionsPrevious7Days),
			appointmentRate: calculateTrend(appointmentRateLast7Days, appointmentRatePrevious7Days),
		},
	}
}

const getCachedUserStats = unstable_cache(
	fetchUserStats,
	['user-stats'],
	{ revalidate: 3600 } // Cache for 1 hour
)

export async function getUserStats(): Promise<UserStats> {
	const user = await requireAuth()
	return getCachedUserStats(user.id)
}

async function fetchDailyCallVolume(userId: string, days: number): Promise<DailyVolume[]> {
	const startDate = new Date()
	startDate.setDate(startDate.getDate() - days)
	startDate.setHours(0, 0, 0, 0)

	const calls = await db.call.findMany({
		where: {
			userId,
			createdAt: { gte: startDate },
		},
		select: { createdAt: true },
	})

	// Fetch converted appointments
	const conversions = await db.appointment.findMany({
		where: {
			userId,
			status: 'CONVERTED',
			createdAt: { gte: startDate },
		},
		select: { createdAt: true },
	})

	// Group by date
	const volumeMap = new Map<string, { calls: number; conversions: number }>()

	// Initialize all days
	for (let i = 0; i < days; i++) {
		const date = new Date()
		date.setDate(date.getDate() - i)
		const dateStr = date.toISOString().split('T')[0]
		volumeMap.set(dateStr, { calls: 0, conversions: 0 })
	}

	// Count calls per day
	for (const call of calls) {
		const dateStr = call.createdAt.toISOString().split('T')[0]
		const current = volumeMap.get(dateStr)
		if (current) {
			current.calls++
		}
	}

	// Count conversions per day
	for (const conversion of conversions) {
		const dateStr = conversion.createdAt.toISOString().split('T')[0]
		const current = volumeMap.get(dateStr)
		if (current) {
			current.conversions++
		}
	}

	// Convert to array and sort
	return Array.from(volumeMap.entries())
		.map(([date, stats]) => ({ date, ...stats }))
		.sort((a, b) => a.date.localeCompare(b.date))
}

const getCachedDailyCallVolume = unstable_cache(
	fetchDailyCallVolume,
	['daily-call-volume'],
	{ revalidate: 3600 }
)

export async function getDailyCallVolume(days = 14): Promise<DailyVolume[]> {
	const user = await requireAuth()
	return getCachedDailyCallVolume(user.id, days)
}

export async function getWeeklyCallVolume(): Promise<DailyVolume[]> {
	const user = await requireAuth()
	return getCachedDailyCallVolume(user.id, 7)
}

export async function getMonthlyCallVolume(): Promise<DailyVolume[]> {
	const user = await requireAuth()
	return getCachedDailyCallVolume(user.id, 30)
}

async function fetchYearlyCallVolume(userId: string): Promise<MonthlyVolume[]> {
	const startDate = new Date()
	startDate.setMonth(startDate.getMonth() - 12)
	startDate.setDate(1)
	startDate.setHours(0, 0, 0, 0)

	const calls = await db.call.findMany({
		where: {
			userId,
			createdAt: { gte: startDate },
		},
	})

	// Fetch converted appointments
	const conversions = await db.appointment.findMany({
		where: {
			userId,
			status: 'CONVERTED',
			createdAt: { gte: startDate },
		},
		select: { createdAt: true },
	})

	// Group by month
	const volumeMap = new Map<string, { calls: number; conversions: number }>()

	// Initialize all months
	for (let i = 11; i >= 0; i--) {
		const date = new Date()
		date.setMonth(date.getMonth() - i)
		const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		volumeMap.set(monthStr, { calls: 0, conversions: 0 })
	}

	// Count calls per month
	for (const call of calls) {
		const date = call.createdAt
		const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		const current = volumeMap.get(monthStr)
		if (current) {
			current.calls++
		}
	}

	// Count conversions per month
	for (const conversion of conversions) {
		const date = conversion.createdAt
		const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		const current = volumeMap.get(monthStr)
		if (current) {
			current.conversions++
		}
	}

	// Convert to array and sort
	return Array.from(volumeMap.entries())
		.map(([month, stats]) => ({ month, ...stats }))
		.sort((a, b) => a.month.localeCompare(b.month))
}

const getCachedYearlyCallVolume = unstable_cache(
	fetchYearlyCallVolume,
	['yearly-call-volume'],
	{ revalidate: 120 } // Cache yearly data longer (2 minutes)
)

export async function getYearlyCallVolume(): Promise<MonthlyVolume[]> {
	const user = await requireAuth()
	return getCachedYearlyCallVolume(user.id)
}
