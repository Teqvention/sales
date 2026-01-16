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
        <div className="container py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25">
                    <Megaphone className="h-6 w-6 text-white" />
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
