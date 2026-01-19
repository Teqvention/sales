import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getFilterCategories } from '@/app/actions/filters'
import { FilterManager } from '@/components/filter-manager'
import { Filter } from 'lucide-react'

export default async function AdminFiltersPage() {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const categories = await getFilterCategories()

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                    <Filter className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Filterverwaltung</h1>
                    <p className="text-muted-foreground">
                        Erstellen und verwalten Sie Filterkategorien und -optionen
                    </p>
                </div>
            </div>

            {/* Filter Manager */}
            <FilterManager categories={categories} />
        </div>
    )
}
