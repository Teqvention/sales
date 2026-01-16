'use server'

import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { unstable_cache } from 'next/cache'
import type { UserStats, EmployeeRanking, LeadOverview } from '@/lib/types'

async function fetchAdminStats(): Promise<UserStats> {
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
		db.call.count(),
		db.call.count({
			where: { createdAt: { gte: startOfDay } },
		}),
		db.call.count({
			where: { createdAt: { gte: startOfWeek } },
		}),
		db.appointment.count(),
		db.appointment.count({
			where: { status: 'CONVERTED' },
		}),
		// Last 7 days
		db.call.count({
			where: { createdAt: { gte: last7DaysStart } },
		}),
		db.appointment.count({
			where: { createdAt: { gte: last7DaysStart } },
		}),
		db.appointment.count({
			where: {
				status: 'CONVERTED',
				createdAt: { gte: last7DaysStart },
			},
		}),
		// Previous 7 days
		db.call.count({
			where: {
				createdAt: {
					gte: previous7DaysStart,
					lt: previous7DaysEnd,
				},
			},
		}),
		db.appointment.count({
			where: {
				createdAt: {
					gte: previous7DaysStart,
					lt: previous7DaysEnd,
				},
			},
		}),
		db.appointment.count({
			where: {
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

const getCachedAdminStats = unstable_cache(
	fetchAdminStats,
	['admin-stats'],
	{ revalidate: 60 }
)

export async function getAdminStats(): Promise<UserStats> {
	await requireAdmin()
	return getCachedAdminStats()
}

async function fetchEmployeeRankings(): Promise<EmployeeRanking[]> {
	const users = await db.user.findMany({
		include: {
			_count: {
				select: {
					calls: true,
					appointments: true,
				},
			},
			appointments: {
				where: { status: 'CONVERTED' },
			},
		},
	})

	return users
		.map((user) => ({
			id: user.id,
			name: user.name,
			totalCalls: user._count.calls,
			appointments: user._count.appointments,
			conversions: user.appointments.length,
			appointmentRate:
				user._count.calls > 0
					? Math.round((user._count.appointments / user._count.calls) * 100)
					: 0,
		}))
		.sort((a, b) => b.totalCalls - a.totalCalls)
}

const getCachedEmployeeRankings = unstable_cache(
	fetchEmployeeRankings,
	['employee-rankings'],
	{ revalidate: 60 }
)

export async function getEmployeeRankings(): Promise<EmployeeRanking[]> {
	await requireAdmin()
	return getCachedEmployeeRankings()
}

async function fetchLeadOverview(): Promise<LeadOverview> {
	const [open, noAnswer, noInterest, booked, converted] = await Promise.all([
		db.lead.count({ where: { status: 'OPEN' } }),
		db.lead.count({ where: { status: 'NO_ANSWER' } }),
		db.lead.count({ where: { status: 'NO_INTEREST' } }),
		db.lead.count({ where: { status: 'BOOKED' } }),
		db.lead.count({ where: { status: 'CONVERTED' } }),
	])

	return { open, noAnswer, noInterest, booked, converted }
}

const getCachedLeadOverview = unstable_cache(
	fetchLeadOverview,
	['lead-overview'],
	{ revalidate: 60 }
)

export async function getLeadOverview(): Promise<LeadOverview> {
	await requireAdmin()
	return getCachedLeadOverview()
}

async function fetchUserStatsById(userId: string): Promise<UserStats> {
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
		db.call.count({ where: { userId } }),
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
		db.appointment.count({ where: { userId } }),
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

const getCachedUserStatsById = unstable_cache(
	fetchUserStatsById,
	['user-stats-by-id'],
	{ revalidate: 60 }
)

export async function getUserStatsById(userId: string): Promise<UserStats> {
	await requireAdmin()
	return getCachedUserStatsById(userId)
}
