import { getLeads } from '@/app/actions/leads'
import { getFilterCategories } from '@/app/actions/filters'
import { LeadManagement } from '@/components/lead-management'
import { requireAdmin } from '@/lib/auth'
import { List } from 'lucide-react'

export default async function LeadsPage() {
	await requireAdmin()

	const [leads, categories] = await Promise.all([
		getLeads(),
		getFilterCategories(),
	])

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="flex items-center gap-4">
				<div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
					<List className="h-6 w-6 text-primary-foreground" />
				</div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Lead-Verwaltung</h1>
					<p className="text-muted-foreground">Alle Leads einsehen und verwalten</p>
				</div>
			</div>
			<LeadManagement
				initialLeads={leads}
				categories={categories}
			/>
		</div>
	)
}
