import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
	try {
		await requireAdmin()

		const leads = await db.lead.findMany({
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

		const statusLabels: Record<string, string> = {
			OPEN: 'Offen',
			NO_ANSWER: 'Nicht erreicht',
			NO_INTEREST: 'Kein Interesse',
			BOOKED: 'Gebucht',
			CONVERTED: 'Converted',
			CALLBACK: 'Rückruf',
		}

		const rows = leads.map((lead) => {
			// Group filter values by category
			const filters: Record<string, string[]> = {}
			lead.filterValues.forEach((fv) => {
				const categoryName = fv.option.category.name
				if (!filters[categoryName]) {
					filters[categoryName] = []
				}
				filters[categoryName].push(fv.option.name)
			})

			return {
				Firma: lead.companyName,
				Telefon: lead.phone,
				Filter: Object.entries(filters)
					.map(([cat, opts]) => `${cat}: ${opts.join(', ')}`)
					.join(' | '),
				Status: statusLabels[lead.status] || lead.status,
				'Erstellt am': lead.createdAt.toISOString().split('T')[0],
			}
		})

		// Create CSV
		const headers = rows.length > 0 ? Object.keys(rows[0]) : ['Firma', 'Telefon', 'Filter', 'Status', 'Erstellt am']
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
