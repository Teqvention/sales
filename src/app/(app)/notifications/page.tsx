import { getAllNotifications } from '@/app/actions/notifications'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NotificationsList } from '@/components/notifications-list'

export default async function NotificationsPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    const notifications = await getAllNotifications(user.id)

    return (
        <div className="container py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Benachrichtigungen</h1>
                <p className="text-muted-foreground">
                    Alle Ihre Benachrichtigungen auf einen Blick
                </p>
            </div>
            <NotificationsList notifications={notifications} />
        </div>
    )
}
