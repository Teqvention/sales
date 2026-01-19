import { getUserCallHistory } from '@/app/actions/leads'
import { CallHistoryList } from '@/components/call-history'
import { PhoneIncoming } from 'lucide-react'
import { requireAuth } from '@/lib/auth'

export default async function CallsPage() {
    await requireAuth()
    const calls = await getUserCallHistory()

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 text-2xl font-bold tracking-tight">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                    <PhoneIncoming className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Anrufliste</h1>
                    <p className="text-muted-foreground text-base font-normal">Historie Ihrer getätigten Anrufe</p>
                </div>
            </div>

            <CallHistoryList calls={calls} />
        </div>
    )
}
