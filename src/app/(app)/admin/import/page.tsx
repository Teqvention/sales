import { getIndustries, getServices } from '@/app/actions/categories'
import { LeadImport } from '@/components/lead-import'
import { requireAdmin } from '@/lib/auth'
import { Upload } from 'lucide-react'

export default async function ImportPage() {
	await requireAdmin()

	const [industries, services] = await Promise.all([
		getIndustries(),
		getServices(),
	])

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="flex items-center gap-4">
				<div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
					<Upload className="h-6 w-6 text-primary-foreground" />
				</div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Lead Import</h1>
					<p className="text-muted-foreground">CSV oder Excel Datei hochladen</p>
				</div>
			</div>
			<LeadImport industries={industries} services={services} />
		</div>
	)
}
