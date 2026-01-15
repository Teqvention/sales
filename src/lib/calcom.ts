// Cal.com API integration utilities

const CALCOM_API_BASE = 'https://api.cal.com/v1'

interface CalcomBookingInput {
	eventTypeId: number
	start: string
	end: string
	name: string
	email: string
	timeZone?: string
	metadata?: Record<string, string>
}

interface CalcomBookingResponse {
	uid: string
	startTime: string
	endTime: string
}

export async function createCalcomBooking(
	input: CalcomBookingInput
): Promise<CalcomBookingResponse | null> {
	const apiKey = process.env.CALCOM_API_KEY

	if (!apiKey) {
		console.warn('Cal.com API key not configured')
		return null
	}

	try {
		const response = await fetch(`${CALCOM_API_BASE}/bookings`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				eventTypeId: input.eventTypeId,
				start: input.start,
				end: input.end,
				responses: {
					name: input.name,
					email: input.email,
				},
				timeZone: input.timeZone || 'Europe/Berlin',
				metadata: input.metadata,
			}),
		})

		if (!response.ok) {
			const error = await response.text()
			console.error('Cal.com booking error:', error)
			return null
		}

		return response.json()
	} catch (error) {
		console.error('Cal.com API error:', error)
		return null
	}
}

export async function getCalcomEventTypes(): Promise<
	Array<{ id: number; title: string; length: number }> | null
> {
	const apiKey = process.env.CALCOM_API_KEY

	if (!apiKey) {
		return null
	}

	try {
		const response = await fetch(`${CALCOM_API_BASE}/event-types`, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		})

		if (!response.ok) {
			return null
		}

		const data = await response.json()
		return data.event_types
	} catch {
		return null
	}
}
