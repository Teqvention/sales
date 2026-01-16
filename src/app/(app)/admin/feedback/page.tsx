import { getFeedbacks } from '@/app/actions/feedback'
import { AdminReportsTable } from '@/components/admin-reports-table'
import { requireAdmin } from '@/lib/auth'

export default async function FeedbackPage() {
    await requireAdmin()
    const reports = await getFeedbacks()

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div>
                <h1 className="text-2xl font-semibold">Feedback & Reports</h1>
                <p className="text-muted-foreground">
                    Verwalte Benutzer-Feedback und Fehlermeldungen
                </p>
            </div>
            <AdminReportsTable reports={reports} />
        </div>
    )
}
