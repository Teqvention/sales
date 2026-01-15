import { db } from '@/lib/db'
import { getUserStatsById } from '@/app/actions/admin-stats'
import { DashboardContent } from '@/components/dashboard-content'
import { requireAdmin } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface UserDetailPageProps {
	params: Promise<{ userId: string }>
}

async function getDailyCallVolumeForUser(userId: string, days = 14) {
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

	const [stats, dailyVolume] = await Promise.all([
		getUserStatsById(userId),
		getDailyCallVolumeForUser(userId),
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
			<DashboardContent stats={stats} dailyVolume={dailyVolume} />
		</div>
	)
}
