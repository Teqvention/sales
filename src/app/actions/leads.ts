'use server'

import { db } from '@/lib/db'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { revalidatePath, unstable_cache, revalidateTag } from 'next/cache'
import type { Lead, LeadStatus, CallOutcome } from '@/lib/types'

export async function getNextLead(
	industryId?: string | null,
	serviceId?: string | null
): Promise<Lead | null> {
	await requireAuth()

	const where: Record<string, unknown> = {
		status: 'OPEN',
	}

	if (industryId) where.industryId = industryId
	if (serviceId) where.serviceId = serviceId

	const lead = await db.lead.findFirst({
		where,
		include: {
			industry: true,
			service: true,
		},
		orderBy: { createdAt: 'asc' },
	})

	return lead as Lead | null
}

export async function getLeadById(id: string): Promise<Lead | null> {
	await requireAuth()

	const lead = await db.lead.findUnique({
		where: { id },
		include: {
			industry: true,
			service: true,
		},
	})

	return lead as Lead | null
}

// Internal cached function
const _getCachedLeads = unstable_cache(
	async (filters?: {
		industryId?: string
		serviceId?: string
		status?: LeadStatus
	}) => {
		const where: Record<string, unknown> = {}

		if (filters?.industryId) where.industryId = filters.industryId
		if (filters?.serviceId) where.serviceId = filters.serviceId
		if (filters?.status) where.status = filters.status

		const leads = await db.lead.findMany({
			where,
			include: {
				industry: true,
				service: true,
			},
			orderBy: { createdAt: 'desc' },
		})

		return leads as Lead[]
	},
	['leads-list'],
	{
		revalidate: 3600,
		tags: ['leads-list'],
	}
)

export async function getLeads(
	filters?: {
		industryId?: string
		serviceId?: string
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
	}

	const lead = await db.lead.findUnique({
		where: { id: leadId },
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

	revalidateTag('leads-list', 'default')
	revalidatePath('/calling')
	revalidatePath('/dashboard')

	// If not booked, return next lead
	if (outcome !== 'BOOKED') {
		const nextLead = await getNextLead(lead.industryId, lead.serviceId)
		return { success: true, nextLead }
	}

	return { success: true }
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
			},
		})
	}

	revalidateTag('leads-list', 'default')
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

	revalidateTag('leads-list', 'default')
	revalidatePath('/admin/leads')
	revalidatePath('/admin/dashboard')
}

export async function updateLead(
	leadId: string,
	data: {
		companyName?: string
		phone?: string
		industryId?: string | null
		serviceId?: string | null
		status?: LeadStatus
	}
): Promise<void> {
	await requireAdmin()

	await db.lead.update({
		where: { id: leadId },
		data,
	})

	revalidateTag('leads-list', 'default')
	revalidatePath('/admin/leads')
	revalidatePath('/admin/dashboard')
}

export async function deleteLead(leadId: string): Promise<void> {
	await requireAdmin()

	await db.lead.delete({
		where: { id: leadId },
	})

	revalidateTag('leads-list', 'default')
	revalidatePath('/admin/leads')
	revalidatePath('/admin/dashboard')
}

export async function importLeads(
	leads: Array<{ companyName: string; phone: string }>,
	industryId: string | null,
	serviceId: string | null,
	filename: string
): Promise<{ count: number }> {
	await requireAdmin()

	const batch = await db.importBatch.create({
		data: {
			filename,
			rowCount: leads.length,
		},
	})

	await db.lead.createMany({
		data: leads.map((lead) => ({
			companyName: lead.companyName,
			phone: lead.phone,
			industryId,
			serviceId,
			importBatchId: batch.id,
		})),
	})

	revalidateTag('leads-list', 'default')
	revalidatePath('/admin/leads')

	return { count: leads.length }
}
