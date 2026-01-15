import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'

// Cal.com webhook types
interface CalcomBookingPayload {
	triggerEvent: string
	createdAt: string
	payload: {
		uid: string
		eventTypeId: number
		startTime: string
		endTime: string
		organizer: {
			email: string
			name: string
		}
		attendees: Array<{
			email: string
			name: string
			timeZone: string
		}>
		metadata?: {
			leadId?: string
			userId?: string
		}
	}
}

function verifyWebhookSignature(
	payload: string,
	signature: string | null,
	secret: string
): boolean {
	if (!signature || !secret) return false

	const expectedSignature = crypto
		.createHmac('sha256', secret)
		.update(payload)
		.digest('hex')

	return crypto.timingSafeEqual(
		Buffer.from(signature),
		Buffer.from(expectedSignature)
	)
}

export async function POST(request: NextRequest) {
	try {
		const payload = await request.text()
		const signature = request.headers.get('x-cal-signature-256')
		const secret = process.env.CALCOM_WEBHOOK_SECRET

		// Verify signature if secret is configured
		if (secret && !verifyWebhookSignature(payload, signature, secret)) {
			return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
		}

		const data: CalcomBookingPayload = JSON.parse(payload)

		// Handle booking created event
		if (data.triggerEvent === 'BOOKING_CREATED') {
			const { uid, startTime, metadata } = data.payload

			if (metadata?.leadId && metadata?.userId) {
				// Create appointment record
				await db.appointment.create({
					data: {
						leadId: metadata.leadId,
						userId: metadata.userId,
						calcomEventId: uid,
						scheduledAt: new Date(startTime),
						status: 'BOOKED',
					},
				})

				// Update lead status
				await db.lead.update({
					where: { id: metadata.leadId },
					data: { status: 'BOOKED' },
				})
			}
		}

		// Handle booking cancelled event
		if (data.triggerEvent === 'BOOKING_CANCELLED') {
			const { uid } = data.payload

			const appointment = await db.appointment.findFirst({
				where: { calcomEventId: uid },
			})

			if (appointment) {
				await db.appointment.update({
					where: { id: appointment.id },
					data: { status: 'CANCELLED' },
				})
			}
		}

		return NextResponse.json({ received: true })
	} catch (error) {
		console.error('Cal.com webhook error:', error)
		return NextResponse.json(
			{ error: 'Webhook processing failed' },
			{ status: 500 }
		)
	}
}
