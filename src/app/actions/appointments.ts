'use server'

import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function createAppointment(
	leadId: string,
	calcomEventId?: string,
	scheduledAt?: Date
): Promise<{ success: boolean; appointmentId?: string }> {
	const user = await requireAuth()

	const appointment = await db.appointment.create({
		data: {
			leadId,
			userId: user.id,
			calcomEventId,
			scheduledAt,
			status: 'BOOKED',
		},
	})

	// Update lead status
	await db.lead.update({
		where: { id: leadId },
		data: { status: 'BOOKED' },
	})

	revalidatePath('/calling')
	revalidatePath('/dashboard')
	revalidatePath('/admin/leads')

	return { success: true, appointmentId: appointment.id }
}

export async function getAppointments(userId?: string) {
	const appointments = await db.appointment.findMany({
		where: userId ? { userId } : undefined,
		include: {
			lead: {
				include: {
					filterValues: {
						include: {
							option: {
								include: { category: true }
							}
						}
					}
				},
			},
			user: {
				select: {
					id: true,
					name: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	})

	return appointments
}
