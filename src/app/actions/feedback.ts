'use server'

import { db } from '@/lib/db'

import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function createFeedback(data: {
    type: string
    subject: string
    description: string
}) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error('Unauthorized')
    }

    await db.feedback.create({
        data: {
            type: data.type,
            subject: data.subject,
            description: data.description,
            userId: session.user.id,
        },
    })

    revalidateTag('feedback-list', 'default')
    revalidateTag('my-feedback-list', 'default')
    revalidatePath('/admin/feedback')
    revalidatePath('/support')
}

// Get current user's feedback tickets
export async function getMyFeedbacks() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error('Unauthorized')
    }

    const feedbacks = await db.feedback.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
    })

    return feedbacks
}


// Internal cached function
const _getCachedFeedbacks = unstable_cache(
    async (status?: string) => {
        const where = status ? { status } : {}
        const feedbacks = await db.feedback.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
        return feedbacks
    },
    ['feedback-list'],
    {
        revalidate: 300, // 5 minutes
        tags: ['feedback-list'],
    }
)

export async function getFeedbacks(status?: string) {
    // Ensure only admin can fetch (optional, but good practice)
    // For now, assuming middleware protects the route
    return _getCachedFeedbacks(status)
}


const statusLabels: Record<string, string> = {
    OPEN: 'Offen',
    IN_PROGRESS: 'In Bearbeitung',
    RESOLVED: 'Gelöst',
    CLOSED: 'Geschlossen',
}

export async function updateFeedbackStatus(id: string, status: string) {
    // First get the feedback to find the owner
    const feedback = await db.feedback.findUnique({
        where: { id },
        select: { userId: true, subject: true },
    })

    await db.feedback.update({
        where: { id },
        data: { status },
    })

    // Create notification for the feedback owner
    if (feedback?.userId) {
        const statusLabel = statusLabels[status] || status
        await db.notification.create({
            data: {
                userId: feedback.userId,
                title: 'Status-Update für Ihr Feedback',
                message: `Ihr Bericht "${feedback.subject}" wurde auf "${statusLabel}" aktualisiert.`,
                type: 'info',
            },
        })
    }

    revalidateTag('feedback-list', 'default')
    revalidatePath('/admin/feedback')
}

export async function deleteFeedback(id: string) {
    await db.feedback.delete({
        where: { id },
    })
    revalidateTag('feedback-list', 'default')
    revalidatePath('/admin/feedback')
}
