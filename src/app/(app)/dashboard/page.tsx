import { getUserStats, getWeeklyCallVolume, getMonthlyCallVolume, getYearlyCallVolume } from '@/app/actions/stats'
import { DashboardContent } from '@/components/dashboard-content'
import { LayoutDashboard } from 'lucide-react'

export default async function DashboardPage() {
	const [stats, weeklyVolume, monthlyVolume, yearlyVolume] = await Promise.all([
		getUserStats(),
		getWeeklyCallVolume(),
		getMonthlyCallVolume(),
		getYearlyCallVolume(),
	])

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="flex items-center gap-4">
				<div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
					<LayoutDashboard className="h-6 w-6 text-primary-foreground" />
				</div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">Deine persönliche Übersicht</p>
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
