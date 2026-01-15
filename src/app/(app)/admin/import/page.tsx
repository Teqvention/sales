import { getIndustries, getServices } from '@/app/actions/categories'
import { LeadImport } from '@/components/lead-import'
import { requireAdmin } from '@/lib/auth'

export default async function ImportPage() {
	await requireAdmin()

	const [industries, services] = await Promise.all([
		getIndustries(),
		getServices(),
	])

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div>
				<h1 className="text-2xl font-semibold">Lead Import</h1>
				<p className="text-muted-foreground">CSV oder Excel Datei hochladen</p>
			</div>
			<LeadImport industries={industries} services={services} />
		</div>
	)
}
