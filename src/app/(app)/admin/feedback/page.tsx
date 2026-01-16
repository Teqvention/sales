import { getFeedbacks } from '@/app/actions/feedback'
import { AdminReportsTable } from '@/components/admin-reports-table'
import { requireAdmin } from '@/lib/auth'
import { MessageSquarePlus } from 'lucide-react'

export default async function FeedbackPage() {
    await requireAdmin()
    const reports = await getFeedbacks()

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                    <MessageSquarePlus className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Feedback & Reports</h1>
                    <p className="text-muted-foreground">
                        Verwalte Benutzer-Feedback und Fehlermeldungen
                    </p>
                </div>
            </div>
            <AdminReportsTable reports={reports} />
        </div>
    )
}
