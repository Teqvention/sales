import { getMyFeedbacks } from '@/app/actions/feedback'
import { MyTicketsTable } from '@/components/my-tickets-table'
import { MessageSquarePlus } from 'lucide-react'

export default async function SupportPage() {
    const tickets = await getMyFeedbacks()

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Meine Support-Tickets</h1>
                    <p className="text-muted-foreground">
                        Übersicht über Ihre eingereichten Feedback- und Fehlerberichte
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquarePlus className="h-4 w-4" />
                    <span>{tickets.length} Ticket{tickets.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            <MyTicketsTable tickets={tickets} />
        </div>
    )
}
