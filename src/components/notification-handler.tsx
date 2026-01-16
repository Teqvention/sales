'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getPendingNotifications, markNotificationsAsRead } from '@/app/actions/notifications'

interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
}

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

                // Mark all as read FIRST to prevent duplicates
                const notificationIds = notifications.map((n: Notification) => n.id)
                await markNotificationsAsRead(userId, notificationIds)

                // Then display each notification as a toast
                notifications.forEach((notification: Notification) => {
                    const toastFn = {
                        info: toast.info,
                        success: toast.success,
                        warning: toast.warning,
                        error: toast.error,
                    }[notification.type] || toast

                    toastFn(notification.title, {
                        description: notification.message,
                        duration: 5000,
                    })
                })
            } catch (error) {
                console.error('Failed to load notifications:', error)
            }
        }

        loadNotifications()
    }, [userId])

    return null
}
