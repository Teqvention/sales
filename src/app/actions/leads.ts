'use server'

import { db } from '@/lib/db'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache'
import type { Lead, LeadStatus, CallOutcome } from '@/lib/types'

export async function getNextLead(
	filterOptionIds?: string[]
): Promise<Lead | null> {
	const user = await requireAuth()

	// 1. Check for due callbacks assigned to this user
	const dueCallback = await db.lead.findFirst({
		where: {
			status: 'CALLBACK',
			assignedUserId: user.id,
			nextCallAt: {
				lte: new Date(), // Due now or in the past
			},
		},
		include: {
			filterValues: {
				include: {
					option: {
						include: { category: true },
					},
				},
			},
		},
		orderBy: { nextCallAt: 'asc' },
	})

	if (dueCallback) {
		return dueCallback as unknown as Lead
	}

	// 2. Normal pool logic (status OPEN, and NOT assigned to a specific user for callback - though status CALLBACK handles that)
	// Build the where clause for leads with optional filter matching
	let leadWhere: Record<string, unknown> = {
		status: 'OPEN',
		// Ensure we don't pick up leads that are technically open but assigned (if generic assignment exists in future)
		// For now, OPEN implies pool.
	}

	if (filterOptionIds && filterOptionIds.length > 0) {
		// Find leads that have ALL the specified filter options
		leadWhere = {
			...leadWhere,
			AND: filterOptionIds.map((optionId) => ({
				filterValues: {
					some: { optionId },
				},
			})),
		}
	}

	const lead = await db.lead.findFirst({
		where: leadWhere,
		include: {
			filterValues: {
				include: {
					option: {
						include: { category: true },
					},
				},
			},
		},
		orderBy: { createdAt: 'asc' },
	})

	return lead as unknown as Lead | null
}

export async function scheduleCallback(
	leadId: string,
	date: Date,
	notes: string
): Promise<{ success: boolean }> {
	const user = await requireAuth()

	await db.$transaction([
		db.lead.update({
			where: { id: leadId },
			data: {
				status: 'CALLBACK',
				assignedUserId: user.id,
				nextCallAt: date,
				nextCallNotes: notes,
			},
		}),
		db.call.create({
			data: {
				leadId,
				userId: user.id,
				outcome: 'SCHEDULED',
			},
		}),
	])

	revalidateTag('leads-list')
	revalidatePath('/calling')

	const lead = await db.lead.findUnique({
		where: { id: leadId },
		include: { filterValues: true }
	})

	// Return next lead
	return { success: true }
}

export async function getLeadById(id: string): Promise<Lead | null> {
	await requireAuth()

	const lead = await db.lead.findUnique({
		where: { id },
		include: {
			filterValues: {
				include: {
					option: {
						include: { category: true },
					},
				},
			},
		},
	})

	return lead as unknown as Lead | null
}

// Internal cached function
const _getCachedLeads = unstable_cache(
	async (filters?: {
		optionIds?: string[]
		status?: LeadStatus
	}) => {
		let where: Record<string, unknown> = {}

		if (filters?.status) where.status = filters.status

		if (filters?.optionIds && filters.optionIds.length > 0) {
			where = {
				...where,
				AND: filters.optionIds.map((optionId) => ({
					filterValues: {
						some: { optionId },
					},
				})),
			}
		}

		const leads = await db.lead.findMany({
			where,
			include: {
				filterValues: {
					include: {
						option: {
							include: { category: true },
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		return leads as unknown as Lead[]
	},
	['leads-list'],
	{
		revalidate: 3600,
		tags: ['leads-list'],
	}
)

export async function getLeads(
	filters?: {
		optionIds?: string[]
		status?: LeadStatus
	}
): Promise<Lead[]> {
	await requireAdmin()
	return _getCachedLeads(filters)
}

export async function recordCall(
	leadId: string,
	outcome: CallOutcome
): Promise<{ success: boolean; nextLead?: Lead | null }> {
	const user = await requireAuth()

	// Update lead status
	const statusMap: Record<CallOutcome, LeadStatus> = {
		NO_ANSWER: 'NO_ANSWER',
		NO_INTEREST: 'NO_INTEREST',
		BOOKED: 'BOOKED',
		SCHEDULED: 'CALLBACK',
	}

	const lead = await db.lead.findUnique({
		where: { id: leadId },
		include: {
			filterValues: true,
		},
	})

	if (!lead) {
		return { success: false }
	}

	await db.$transaction([
		db.call.create({
			data: {
				leadId,
				userId: user.id,
				outcome,
			},
		}),
		db.lead.update({
			where: { id: leadId },
			data: { status: statusMap[outcome] },
		}),
	])

	revalidateTag('leads-list')
	revalidatePath('/calling')
	revalidatePath('/dashboard')

	// If not booked, return next lead with same filters
	if (outcome !== 'BOOKED') {
		const optionIds = lead.filterValues.map((fv) => fv.optionId)
		const nextLead = await getNextLead(optionIds.length > 0 ? optionIds : undefined)
		return { success: true, nextLead }
	}

	return { success: true }
}

export async function getUserCallHistory(userId?: string) {
	const currentUser = await requireAuth()
	const targetUserId = userId || currentUser.id

	// If asking for another user's history, check admin role
	if (userId && userId !== currentUser.id) {
		await requireAdmin()
	}

	const calls = await db.call.findMany({
		where: { userId: targetUserId },
		include: {
			lead: true,
		},
		orderBy: { createdAt: 'desc' },
		take: 50, // Limit to last 50 calls
	})

	return calls
}

export async function markAsConverted(leadId: string): Promise<void> {
	await requireAdmin()

	// Get the lead with the employee who booked it (via the Call record)
	const lead = await db.lead.findUnique({
		where: { id: leadId },
		include: {
			calls: {
				where: { outcome: 'BOOKED' },
				select: { userId: true },
				take: 1,
			},
		},
	})

	await db.$transaction([
		db.lead.update({
			where: { id: leadId },
			data: { status: 'CONVERTED' },
		}),
		db.appointment.updateMany({
			where: { leadId },
			data: { status: 'CONVERTED' },
		}),
	])

	// Notify the employee who booked this lead
	if (lead?.calls?.[0]?.userId) {
		await db.notification.create({
			data: {
				userId: lead.calls[0].userId,
				title: 'Lead konvertiert! 🎉',
				message: `Super Arbeit! Der Lead "${lead.companyName}" wurde erfolgreich konvertiert.`,
				type: 'success',
				category: 'lead',
			},
		})
	}

	revalidateTag('leads-list')
	revalidatePath('/admin/leads')
	revalidatePath('/admin/dashboard')
}

export async function unconvertLead(leadId: string): Promise<void> {
	await requireAdmin()

	await db.$transaction([
		db.lead.update({
			where: { id: leadId },
			data: { status: 'BOOKED' },
		}),
		db.appointment.updateMany({
			where: { leadId },
			data: { status: 'BOOKED' },
		}),
	])

	revalidateTag('leads-list')
	revalidatePath('/admin/leads')
	revalidatePath('/admin/dashboard')
}

export async function updateLead(
	leadId: string,
	data: {
		companyName?: string
		phone?: string
		status?: LeadStatus
	},
	optionIds?: string[]
): Promise<void> {
	await requireAdmin()

	await db.$transaction(async (tx) => {
		await tx.lead.update({
			where: { id: leadId },
			data,
		})

		// Update filter values if provided
		if (optionIds !== undefined) {
			await tx.leadFilterValue.deleteMany({
				where: { leadId },
			})

			if (optionIds.length > 0) {
				await tx.leadFilterValue.createMany({
					data: optionIds.map((optionId) => ({
						leadId,
						optionId,
					})),
				})
			}
		}
	})

	revalidateTag('leads-list')
	revalidatePath('/admin/leads')
	revalidatePath('/admin/dashboard')
}

export async function deleteLead(leadId: string): Promise<void> {
	await requireAdmin()

	await db.lead.delete({
		where: { id: leadId },
	})

	revalidateTag('leads-list')
	revalidatePath('/admin/leads')
	revalidatePath('/admin/dashboard')
}

export async function deleteAllLeads(): Promise<void> {
	await requireAdmin()

	await db.lead.deleteMany({})

	revalidateTag('leads-list')
	revalidatePath('/admin/leads')
	revalidatePath('/admin/dashboard')
}

export async function importLeads(
	leads: Array<{ companyName: string; phone: string }>,
	optionIds: string[],
	filename: string
): Promise<{ count: number }> {
	await requireAdmin()

	const batch = await db.importBatch.create({
		data: {
			filename,
			rowCount: leads.length,
		},
	})

	// Create leads
	const createdLeads = await Promise.all(
		leads.map((lead) =>
			db.lead.create({
				data: {
					companyName: lead.companyName,
					phone: lead.phone,
					importBatchId: batch.id,
				},
			})
		)
	)

	// Assign filter options to all created leads
	if (optionIds.length > 0) {
		await db.leadFilterValue.createMany({
			data: createdLeads.flatMap((lead) =>
				optionIds.map((optionId) => ({
					leadId: lead.id,
					optionId,
				}))
			),
		})
	}

	revalidateTag('leads-list')
	revalidatePath('/admin/leads')

	return { count: leads.length }
}
