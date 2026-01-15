import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
	try {
		await requireAdmin()

		const leads = await db.lead.findMany({
			include: {
				industry: true,
				service: true,
			},
			orderBy: { createdAt: 'desc' },
		})

		const statusLabels: Record<string, string> = {
			OPEN: 'Offen',
			NO_ANSWER: 'Nicht erreicht',
			NO_INTEREST: 'Kein Interesse',
			BOOKED: 'Gebucht',
			CONVERTED: 'Converted',
		}

		const rows = leads.map((lead) => ({
			Firma: lead.companyName,
			Telefon: lead.phone,
			Branche: lead.industry?.name || '',
			Service: lead.service?.name || '',
			Status: statusLabels[lead.status] || lead.status,
			'Erstellt am': lead.createdAt.toISOString().split('T')[0],
		}))

		// Create CSV
		const headers = Object.keys(rows[0] || {})
		const csv = [
			headers.join(';'),
			...rows.map((row) =>
				headers.map((h) => String(row[h as keyof typeof row] ?? '')).join(';')
			),
		].join('\n')

		return new NextResponse(csv, {
			headers: {
				'Content-Type': 'text/csv; charset=utf-8',
				'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
			},
		})
	} catch {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
}
