'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getPendingNotifications, markNotificationsAsRead } from '@/app/actions/notifications'
import type { Notification } from '@prisma/client'

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface NotificationHandlerProps {
    userId: string
}

export function NotificationHandler({ userId }: NotificationHandlerProps) {
    const hasFetched = useRef(false)

    useEffect(() => {
        // Prevent duplicate fetches from React StrictMode or re-renders
        if (hasFetched.current) return
        hasFetched.current = true

        async function loadNotifications() {
            try {
                const notifications = await getPendingNotifications(userId)

                if (notifications.length === 0) return

                // Show toasts FIRST with staggered delays for better UX
                notifications.forEach((notification: Notification, index: number) => {
                    const notificationType = notification.type as ToastType
                    const toastFn = {
                        info: toast.info,
                        success: toast.success,
                        warning: toast.warning,
                        error: toast.error,
                    }[notificationType] || toast.info

                    // Stagger toasts with 300ms delay between each
                    setTimeout(() => {
                        toastFn(notification.title, {
                            description: notification.message,
                            duration: 6000,
                        })
                    }, index * 300)
                })

                // Mark all as read AFTER showing (slight delay to ensure toasts are queued)
                setTimeout(async () => {
                    try {
                        const notificationIds = notifications.map((n) => n.id)
                        await markNotificationsAsRead(userId, notificationIds)
                    } catch (error) {
                        console.error('Failed to mark notifications as read:', error)
                    }
                }, 500)

            } catch (error) {
                console.error('Failed to load notifications:', error)
            }
        }

        // Small delay to ensure the page is fully mounted
        const timer = setTimeout(loadNotifications, 100)
        return () => clearTimeout(timer)
    }, [userId])

    return null
}
