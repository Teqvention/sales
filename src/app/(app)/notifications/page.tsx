import { getAllNotifications } from '@/app/actions/notifications'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NotificationsList } from '@/components/notifications-list'
import { Bell } from 'lucide-react'

export default async function NotificationsPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    const notifications = await getAllNotifications(user.id)

    return (
        <div className="container max-w-4xl py-8 px-4 md:px-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                    <Bell className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Benachrichtigungen</h1>
                    <p className="text-muted-foreground">
                        Alle Ihre Benachrichtigungen auf einen Blick
                    </p>
                </div>
            </div>

            {/* Notifications List */}
            <NotificationsList notifications={notifications} />
        </div>
    )
}
