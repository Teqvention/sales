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

	const [totalCalls, callsToday, callsThisWeek, appointmentsBooked, conversions] =
		await Promise.all([
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
			username: user.username,
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

	const [totalCalls, callsToday, callsThisWeek, appointmentsBooked, conversions] =
		await Promise.all([
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

const getCachedUserStatsById = unstable_cache(
	fetchUserStatsById,
	['user-stats-by-id'],
	{ revalidate: 60 }
)

export async function getUserStatsById(userId: string): Promise<UserStats> {
	await requireAdmin()
	return getCachedUserStatsById(userId)
}
