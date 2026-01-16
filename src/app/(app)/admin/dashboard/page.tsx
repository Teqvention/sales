import { getAdminStats, getEmployeeRankings, getLeadOverview } from '@/app/actions/admin-stats'
import { AdminDashboardContent } from '@/components/admin-dashboard-content'
import { requireAdmin } from '@/lib/auth'
import { Shield } from 'lucide-react'

export default async function AdminDashboardPage() {
	await requireAdmin()

	const [stats, rankings, leadOverview] = await Promise.all([
		getAdminStats(),
		getEmployeeRankings(),
		getLeadOverview(),
	])

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="flex items-center gap-4">
				<div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
					<Shield className="h-6 w-6 text-primary-foreground" />
				</div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
					<p className="text-muted-foreground">Gesamtübersicht aller Aktivitäten</p>
				</div>
			</div>
			<AdminDashboardContent
				stats={stats}
				rankings={rankings}
				leadOverview={leadOverview}
			/>
		</div>
	)
}
