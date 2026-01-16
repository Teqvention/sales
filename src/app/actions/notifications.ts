'use server'

import { db } from '@/lib/db'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export type NotificationCategory = 'account' | 'lead' | 'system' | 'broadcast'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'info',
    category: NotificationCategory = 'system'
) {
    await db.notification.create({
        data: {
            userId,
            title,
            message,
            type,
            category,
        },
    })
    revalidateTag('unread-count', 'default')
    revalidateTag('notifications-list', 'default')
}

export async function getPendingNotifications(userId: string) {
    const notifications = await db.notification.findMany({
        where: {
            userId,
            read: false,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    return notifications
}

// Get all notifications for user (paginated)
export async function getAllNotifications(userId: string) {
    const notifications = await db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit to last 100 notifications
    })
    return notifications
}

// Cached unread count for sidebar badge (short cache)
const _getCachedUnreadCount = unstable_cache(
    async (userId: string) => {
        const count = await db.notification.count({
            where: {
                userId,
                read: false,
            },
        })
        return count
    },
    ['unread-count'],
    {
        revalidate: 30, // 30 seconds - shorter for fresher counts
        tags: ['unread-count'],
    }
)

export async function getUnreadCount(userId: string) {
    return _getCachedUnreadCount(userId)
}

// Fresh unread count (no cache) - use for initial page load
export async function getFreshUnreadCount(userId: string) {
    const count = await db.notification.count({
        where: {
            userId,
            read: false,
        },
    })
    return count
}

// Mark notifications as read (batch)
export async function markNotificationsAsRead(userId: string, notificationIds: string[]) {
    await db.notification.updateMany({
        where: {
            id: { in: notificationIds },
            userId, // Security: ensure user owns these notifications
        },
        data: {
            read: true,
        },
    })

    revalidateTag('unread-count', 'default')
    revalidateTag('notifications-list', 'default')
    revalidatePath('/notifications')
}

// Mark single notification as read
export async function markSingleAsRead(notificationId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error('Unauthorized')
    }

    await db.notification.update({
        where: {
            id: notificationId,
            userId: session.user.id, // Security check
        },
        data: {
            read: true,
        },
    })

    revalidateTag('unread-count', 'default')
    revalidateTag('notifications-list', 'default')
    revalidatePath('/notifications')
}

// Mark all as read for a user
export async function markAllAsRead() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error('Unauthorized')
    }

    await db.notification.updateMany({
        where: {
            userId: session.user.id,
            read: false,
        },
        data: {
            read: true,
        },
    })

    revalidateTag('unread-count', 'default')
    revalidateTag('notifications-list', 'default')
    revalidatePath('/notifications')
}

// Admin-only: Send broadcast to all users
export async function sendBroadcast(title: string, message: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error('Unauthorized')
    }

    // Check if user is admin
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required')
    }

    // Get all users
    const users = await db.user.findMany({
        select: { id: true },
    })

    // Create notification for each user
    await db.notification.createMany({
        data: users.map((u) => ({
            userId: u.id,
            title,
            message,
            type: 'info',
            category: 'broadcast',
        })),
    })

    revalidateTag('unread-count', 'default')
    revalidateTag('notifications-list', 'default')
}
