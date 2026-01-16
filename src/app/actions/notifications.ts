'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
) {
    await db.notification.create({
        data: {
            userId,
            title,
            message,
            type,
        },
    })
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

    revalidatePath('/dashboard')
}
