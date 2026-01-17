'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getPendingNotifications, markNotificationsAsRead } from '@/app/actions/notifications'
import type { Notification } from '@prisma/client'

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface NotificationHandlerProps {
    userId: string
}

export function NotificationHandler({ userId }: NotificationHandlerProps) {
    const router = useRouter()
    const hasFetched = useRef(false)

    useEffect(() => {
        // Prevent duplicate fetches from React StrictMode or re-renders
        if (hasFetched.current) return
        hasFetched.current = true

        async function loadNotifications() {
            try {
                const notifications = await getPendingNotifications(userId)

                if (notifications.length === 0) return

                // Get already shown notifications from session storage to prevent duplicates on refresh
                const shownIds = JSON.parse(sessionStorage.getItem('shown_notifications') || '[]')
                const newNotifications = notifications.filter((n) => !shownIds.includes(n.id))

                if (newNotifications.length === 0) return

                // Trigger server revalidation to update badge in sidebar
                // This is needed because Sidebar is a server component getting data from layout
                router.refresh()

                // Show toasts with staggered delays
                newNotifications.forEach((notification: Notification, index: number) => {
                    const notificationType = notification.type as ToastType
                    const toastFn = {
                        info: toast.info,
                        success: toast.success,
                        warning: toast.warning,
                        error: toast.error,
                    }[notificationType] || toast.info

                    setTimeout(() => {
                        toastFn(notification.title, {
                            description: notification.message,
                            duration: 6000,
                        })
                    }, index * 300)
                })

                // Mark as shown in session storage but NOT as read in DB (so badge stays)
                const newShownIds = [...shownIds, ...newNotifications.map((n) => n.id)]
                sessionStorage.setItem('shown_notifications', JSON.stringify(newShownIds))

            } catch (error) {
                console.error('Failed to load notifications:', error)
            }
        }

        // Initial load
        loadNotifications()

        // Poll every 10 seconds for new notifications
        const interval = setInterval(loadNotifications, 10000)

        return () => clearInterval(interval)
    }, [userId])

    return null
}
