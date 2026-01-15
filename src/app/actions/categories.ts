'use server'

import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import type { Industry, Service } from '@/lib/types'

export async function getIndustries(): Promise<Industry[]> {
	const industries = await db.industry.findMany({
		orderBy: { name: 'asc' },
	})
	return industries
}

export async function getServices(): Promise<Service[]> {
	const services = await db.service.findMany({
		orderBy: { name: 'asc' },
	})
	return services
}

export async function createIndustry(name: string, icon = 'building'): Promise<Industry> {
	await requireAdmin()

	const industry = await db.industry.create({
		data: { name, icon },
	})
	return industry
}

export async function createService(name: string, icon = 'briefcase'): Promise<Service> {
	await requireAdmin()

	const service = await db.service.create({
		data: { name, icon },
	})
	return service
}

export async function deleteIndustry(id: string): Promise<void> {
	await requireAdmin()
	await db.industry.delete({ where: { id } })
}

export async function deleteService(id: string): Promise<void> {
	await requireAdmin()
	await db.service.delete({ where: { id } })
}
