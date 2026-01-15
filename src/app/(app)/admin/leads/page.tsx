import { getLeads } from '@/app/actions/leads'
import { getIndustries, getServices } from '@/app/actions/categories'
import { LeadManagement } from '@/components/lead-management'
import { requireAdmin } from '@/lib/auth'

export default async function LeadsPage() {
	await requireAdmin()

	const [leads, industries, services] = await Promise.all([
		getLeads(),
		getIndustries(),
		getServices(),
	])

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div>
				<h1 className="text-2xl font-semibold">Lead-Verwaltung</h1>
				<p className="text-muted-foreground">Alle Leads einsehen und verwalten</p>
			</div>
			<LeadManagement
				initialLeads={leads}
				industries={industries}
				services={services}
			/>
		</div>
	)
}
