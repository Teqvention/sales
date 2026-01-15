import { db } from '@/lib/db'
import { getUserStatsById } from '@/app/actions/admin-stats'
import { DashboardContent } from '@/components/dashboard-content'
import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { DailyVolume, MonthlyVolume } from '@/lib/types'

interface UserDetailPageProps {
	params: Promise<{ userId: string }>
}

async function getDailyCallVolumeForUser(userId: string, days = 14): Promise<DailyVolume[]> {
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

	const volumeMap = new Map<string, number>()

	for (let i = 0; i < days; i++) {
		const date = new Date()
		date.setDate(date.getDate() - i)
		const dateStr = date.toISOString().split('T')[0]
		volumeMap.set(dateStr, 0)
	}

	for (const call of calls) {
		const dateStr = call.createdAt.toISOString().split('T')[0]
		volumeMap.set(dateStr, (volumeMap.get(dateStr) || 0) + 1)
	}

	return Array.from(volumeMap.entries())
		.map(([date, calls]) => ({ date, calls }))
		.sort((a, b) => a.date.localeCompare(b.date))
}

async function getWeeklyCallVolumeForUser(userId: string): Promise<DailyVolume[]> {
	return getDailyCallVolumeForUser(userId, 7)
}

async function getMonthlyCallVolumeForUser(userId: string): Promise<DailyVolume[]> {
	return getDailyCallVolumeForUser(userId, 30)
}

async function getYearlyCallVolumeForUser(userId: string): Promise<MonthlyVolume[]> {
	const startDate = new Date()
	startDate.setMonth(startDate.getMonth() - 12)
	startDate.setDate(1)
	startDate.setHours(0, 0, 0, 0)

	const calls = await db.call.findMany({
		where: {
			userId,
			createdAt: { gte: startDate },
		},
		select: { createdAt: true },
	})

	const volumeMap = new Map<string, number>()

	for (let i = 11; i >= 0; i--) {
		const date = new Date()
		date.setMonth(date.getMonth() - i)
		const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		volumeMap.set(monthStr, 0)
	}

	for (const call of calls) {
		const date = call.createdAt
		const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		if (volumeMap.has(monthStr)) {
			volumeMap.set(monthStr, (volumeMap.get(monthStr) || 0) + 1)
		}
	}

	return Array.from(volumeMap.entries())
		.map(([month, calls]) => ({ month, calls }))
		.sort((a, b) => a.month.localeCompare(b.month))
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
	await requireAdmin()
	const { userId } = await params

	const user = await db.user.findUnique({
		where: { id: userId },
		select: { id: true, username: true, role: true },
	})

	if (!user) {
		notFound()
	}

	const [stats, weeklyVolume, monthlyVolume, yearlyVolume] = await Promise.all([
		getUserStatsById(userId),
		getWeeklyCallVolumeForUser(userId),
		getMonthlyCallVolumeForUser(userId),
		getYearlyCallVolumeForUser(userId),
	])

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div>
				<Button variant="ghost" size="sm" className="mb-2" asChild>
					<Link href="/admin/users">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Zurück
					</Link>
				</Button>
				<h1 className="text-2xl font-semibold">{user.username}</h1>
				<p className="text-muted-foreground">
					{user.role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'} Dashboard
				</p>
			</div>
			<DashboardContent
				stats={stats}
				weeklyVolume={weeklyVolume}
				monthlyVolume={monthlyVolume}
				yearlyVolume={yearlyVolume}
			/>
		</div>
	)
}
