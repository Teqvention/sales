import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AdminNotificationForm } from '@/components/admin-notification-form'

export default async function AdminNotificationsPage() {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <div className="container py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Nachrichten senden</h1>
                <p className="text-muted-foreground">
                    Senden Sie eine Nachricht an alle Benutzer
                </p>
            </div>
            <AdminNotificationForm />
        </div>
    )
}
