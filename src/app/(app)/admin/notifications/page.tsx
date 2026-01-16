import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AdminNotificationForm } from '@/components/admin-notification-form'
import { Megaphone } from 'lucide-react'

export default async function AdminNotificationsPage() {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                    <Megaphone className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nachrichten senden</h1>
                    <p className="text-muted-foreground">
                        Senden Sie Benachrichtigungen an alle Benutzer
                    </p>
                </div>
            </div>

            {/* Form */}
            <AdminNotificationForm />
        </div>
    )
}
