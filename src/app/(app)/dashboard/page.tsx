import { getUserStats, getWeeklyCallVolume, getMonthlyCallVolume, getYearlyCallVolume } from '@/app/actions/stats'
import { DashboardContent } from '@/components/dashboard-content'

export default async function DashboardPage() {
	const [stats, weeklyVolume, monthlyVolume, yearlyVolume] = await Promise.all([
		getUserStats(),
		getWeeklyCallVolume(),
		getMonthlyCallVolume(),
		getYearlyCallVolume(),
	])

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div>
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<p className="text-muted-foreground">Deine persönliche Übersicht</p>
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
