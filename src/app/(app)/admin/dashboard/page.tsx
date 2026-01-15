import { getAdminStats, getEmployeeRankings, getLeadOverview } from '@/app/actions/admin-stats'
import { AdminDashboardContent } from '@/components/admin-dashboard-content'
import { requireAdmin } from '@/lib/auth'

export default async function AdminDashboardPage() {
	await requireAdmin()

	const [stats, rankings, leadOverview] = await Promise.all([
		getAdminStats(),
		getEmployeeRankings(),
		getLeadOverview(),
	])

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div>
				<h1 className="text-2xl font-semibold">Admin Dashboard</h1>
				<p className="text-muted-foreground">Gesamtübersicht aller Aktivitäten</p>
			</div>
			<AdminDashboardContent
				stats={stats}
				rankings={rankings}
				leadOverview={leadOverview}
			/>
		</div>
	)
}
