import { getMyFeedbacks } from '@/app/actions/feedback'
import { MyTicketsTable } from '@/components/my-tickets-table'
import { MessageSquarePlus } from 'lucide-react'

export default async function SupportPage() {
    const tickets = await getMyFeedbacks()

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                        <MessageSquarePlus className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Feedback & Reports</h1>
                        <p className="text-muted-foreground">
                            Verwalte deine Support-Tickets und Feedback
                        </p>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    {tickets.length} Ticket{tickets.length !== 1 ? 's' : ''}
                </div>
            </div>

            <MyTicketsTable tickets={tickets} />
        </div>
    )
}
