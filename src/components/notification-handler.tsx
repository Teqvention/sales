'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { getPendingNotifications } from '@/app/actions/notifications'
import type { Notification } from '@prisma/client'

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface NotificationHandlerProps {
    userId: string
}

export function NotificationHandler({ userId }: NotificationHandlerProps) {
    const router = useRouter()
    const lastKnownIdsRef = useRef<Set<string>>(new Set())
    const isFirstLoadRef = useRef(true)

    useEffect(() => {
        async function loadNotifications() {
            try {
                const notifications = await getPendingNotifications(userId)
                const currentIds = new Set(notifications.map((n) => n.id))

                // Get already shown notifications from session storage to prevent duplicate toasts
                const shownIds: string[] = JSON.parse(sessionStorage.getItem('shown_notifications') || '[]')
                const shownIdsSet = new Set(shownIds)

                // Find truly new notifications (not in session storage AND not in our last known set)
                const newNotifications = notifications.filter(
                    (n) => !shownIdsSet.has(n.id) && !lastKnownIdsRef.current.has(n.id)
                )

                // Only refresh if we have new notifications AND it's not the first load
                // (first load already has fresh data from the server layout)
                if (newNotifications.length > 0 && !isFirstLoadRef.current) {
                    router.refresh()
                }

                // Show toasts for new notifications
                if (newNotifications.length > 0) {
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

                    // Mark as shown in session storage
                    const newShownIds = [...shownIds, ...newNotifications.map((n) => n.id)]
                    sessionStorage.setItem('shown_notifications', JSON.stringify(newShownIds))
                }

                // Update our tracking of known IDs
                lastKnownIdsRef.current = currentIds
                isFirstLoadRef.current = false

            } catch (error) {
                console.error('Failed to load notifications:', error)
            }
        }

        // Initial load
        loadNotifications()

        // Poll every 30 seconds for new notifications (reduced frequency)
        const interval = setInterval(loadNotifications, 30000)

        return () => clearInterval(interval)
    }, [userId, router])

    return null
}
