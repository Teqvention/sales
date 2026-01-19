import { db } from '@/lib/db'
import { getUserStatsById } from '@/app/actions/admin-stats'
import { DashboardContent } from '@/components/dashboard-content'
import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import type { DailyVolume, MonthlyVolume } from '@/lib/types'

interface UserDetailPageProps {
	params: Promise<{ userId: string }>
}

interface AllCallVolumes {
	weeklyVolume: DailyVolume[]
	monthlyVolume: DailyVolume[]
	yearlyVolume: MonthlyVolume[]
}

// Fetch all call data in a single query and compute all volumes
async function fetchAllCallVolumesForUser(userId: string): Promise<AllCallVolumes> {
	// Fetch 1 year of data in a single query
	const startDate = new Date()
	startDate.setMonth(startDate.getMonth() - 12)
	startDate.setDate(1)
	startDate.setHours(0, 0, 0, 0)

	const [calls, conversions] = await Promise.all([
		db.call.findMany({
			where: {
				userId,
				createdAt: { gte: startDate },
			},
			select: { createdAt: true },
		}),
		db.appointment.findMany({
			where: {
				userId,
				status: 'CONVERTED',
				createdAt: { gte: startDate },
			},
			select: { createdAt: true },
		}),
	])

	// Compute weekly (7 days)
	const weeklyMap = new Map<string, { calls: number; conversions: number; bookings: number }>()
	const now = new Date()
	for (let i = 0; i < 7; i++) {
		const date = new Date(now)
		date.setDate(date.getDate() - i)
		weeklyMap.set(date.toISOString().split('T')[0], { calls: 0, conversions: 0, bookings: 0 })
	}

	// Compute monthly (30 days)
	const monthlyMap = new Map<string, { calls: number; conversions: number; bookings: number }>()
	for (let i = 0; i < 30; i++) {
		const date = new Date(now)
		date.setDate(date.getDate() - i)
		monthlyMap.set(date.toISOString().split('T')[0], { calls: 0, conversions: 0, bookings: 0 })
	}

	// Compute yearly (12 months)
	const yearlyMap = new Map<string, { calls: number; conversions: number; bookings: number }>()
	for (let i = 11; i >= 0; i--) {
		const date = new Date(now)
		date.setMonth(date.getMonth() - i)
		const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		yearlyMap.set(monthStr, { calls: 0, conversions: 0, bookings: 0 })
	}

	// Count calls into each bucket
	for (const call of calls) {
		const dateStr = call.createdAt.toISOString().split('T')[0]
		const monthStr = `${call.createdAt.getFullYear()}-${String(call.createdAt.getMonth() + 1).padStart(2, '0')}`

		if (weeklyMap.has(dateStr)) {
			weeklyMap.get(dateStr)!.calls++
		}
		if (monthlyMap.has(dateStr)) {
			monthlyMap.get(dateStr)!.calls++
		}
		if (yearlyMap.has(monthStr)) {
			yearlyMap.get(monthStr)!.calls++
		}
	}

	// Count conversions into each bucket
	for (const conversion of conversions) {
		const dateStr = conversion.createdAt.toISOString().split('T')[0]
		const monthStr = `${conversion.createdAt.getFullYear()}-${String(conversion.createdAt.getMonth() + 1).padStart(2, '0')}`

		if (weeklyMap.has(dateStr)) {
			weeklyMap.get(dateStr)!.conversions++
		}
		if (monthlyMap.has(dateStr)) {
			monthlyMap.get(dateStr)!.conversions++
		}
		if (yearlyMap.has(monthStr)) {
			yearlyMap.get(monthStr)!.conversions++
		}
	}

	const weeklyVolume = Array.from(weeklyMap.entries())
		.map(([date, stats]) => ({ date, ...stats }))
		.sort((a, b) => a.date.localeCompare(b.date))

	const monthlyVolume = Array.from(monthlyMap.entries())
		.map(([date, stats]) => ({ date, ...stats }))
		.sort((a, b) => a.date.localeCompare(b.date))

	const yearlyVolume = Array.from(yearlyMap.entries())
		.map(([month, stats]) => ({ month, ...stats }))
		.sort((a, b) => a.month.localeCompare(b.month))

	return { weeklyVolume, monthlyVolume, yearlyVolume }
}

const getCachedAllCallVolumes = unstable_cache(
	fetchAllCallVolumesForUser,
	['admin-user-call-volumes'],
	{ revalidate: 60 }
)

export default async function UserDetailPage({ params }: UserDetailPageProps) {
	await requireAdmin()
	const { userId } = await params

	const user = await db.user.findUnique({
		where: { id: userId },
		select: { id: true, name: true, role: true },
	})

	if (!user) {
		notFound()
	}

	// Fetch stats and all volumes in parallel (2 DB operations instead of 4)
	const [stats, allVolumes] = await Promise.all([
		getUserStatsById(userId),
		getCachedAllCallVolumes(userId),
	])

	const { weeklyVolume, monthlyVolume, yearlyVolume } = allVolumes

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" className="shrink-0" asChild>
					<Link href="/admin/users">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
					<User className="h-6 w-6 text-primary-foreground" />
				</div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
					<p className="text-muted-foreground">
						{user.role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'} Dashboard
					</p>
				</div>
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
