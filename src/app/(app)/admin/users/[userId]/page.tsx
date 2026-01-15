import { db } from '@/lib/db'
import { getUserStatsById } from '@/app/actions/admin-stats'
import { DashboardContent } from '@/components/dashboard-content'
import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
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

	const calls = await db.call.findMany({
		where: {
			userId,
			createdAt: { gte: startDate },
		},
		select: { createdAt: true },
	})

	// Compute weekly (7 days)
	const weeklyMap = new Map<string, number>()
	const now = new Date()
	for (let i = 0; i < 7; i++) {
		const date = new Date(now)
		date.setDate(date.getDate() - i)
		weeklyMap.set(date.toISOString().split('T')[0], 0)
	}

	// Compute monthly (30 days)
	const monthlyMap = new Map<string, number>()
	for (let i = 0; i < 30; i++) {
		const date = new Date(now)
		date.setDate(date.getDate() - i)
		monthlyMap.set(date.toISOString().split('T')[0], 0)
	}

	// Compute yearly (12 months)
	const yearlyMap = new Map<string, number>()
	for (let i = 11; i >= 0; i--) {
		const date = new Date(now)
		date.setMonth(date.getMonth() - i)
		const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		yearlyMap.set(monthStr, 0)
	}

	// Count calls into each bucket
	for (const call of calls) {
		const dateStr = call.createdAt.toISOString().split('T')[0]
		const monthStr = `${call.createdAt.getFullYear()}-${String(call.createdAt.getMonth() + 1).padStart(2, '0')}`

		if (weeklyMap.has(dateStr)) {
			weeklyMap.set(dateStr, (weeklyMap.get(dateStr) || 0) + 1)
		}
		if (monthlyMap.has(dateStr)) {
			monthlyMap.set(dateStr, (monthlyMap.get(dateStr) || 0) + 1)
		}
		if (yearlyMap.has(monthStr)) {
			yearlyMap.set(monthStr, (yearlyMap.get(monthStr) || 0) + 1)
		}
	}

	const weeklyVolume = Array.from(weeklyMap.entries())
		.map(([date, calls]) => ({ date, calls }))
		.sort((a, b) => a.date.localeCompare(b.date))

	const monthlyVolume = Array.from(monthlyMap.entries())
		.map(([date, calls]) => ({ date, calls }))
		.sort((a, b) => a.date.localeCompare(b.date))

	const yearlyVolume = Array.from(yearlyMap.entries())
		.map(([month, calls]) => ({ month, calls }))
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
			<div>
				<Button variant="ghost" size="sm" className="mb-2" asChild>
					<Link href="/admin/users">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Zurück
					</Link>
				</Button>
				<h1 className="text-2xl font-semibold">{user.name}</h1>
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
