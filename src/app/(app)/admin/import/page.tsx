import { getFilterCategories } from '@/app/actions/filters'
import { LeadImport } from '@/components/lead-import'
import { requireAdmin } from '@/lib/auth'
import { Upload, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ImportPage() {
	await requireAdmin()

	const categories = await getFilterCategories()

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
						<Upload className="h-6 w-6 text-primary-foreground" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Lead Import</h1>
						<p className="text-muted-foreground">CSV oder Excel Datei hochladen</p>
					</div>
				</div>
				<Button variant="outline" asChild>
					<Link href="/admin/filters">
						<Settings className="mr-2 h-4 w-4" />
						Filter verwalten
					</Link>
				</Button>
			</div>
			<LeadImport categories={categories} />
		</div>
	)
}
