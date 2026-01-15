import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
	try {
		await requireAdmin()

		const users = await db.user.findMany({
			include: {
				_count: {
					select: {
						calls: true,
						appointments: true,
					},
				},
				appointments: {
					where: { status: 'CONVERTED' },
				},
			},
		})

		const rows = users.map((user) => ({
			Name: user.name,
			'E-Mail': user.email,
			Rolle: user.role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter',
			'Anrufe gesamt': user._count.calls,
			Termine: user._count.appointments,
			Conversions: user.appointments.length,
			Terminquote:
				user._count.calls > 0
					? `${Math.round((user._count.appointments / user._count.calls) * 100)}%`
					: '0%',
			'Erstellt am': user.createdAt.toISOString().split('T')[0],
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
				'Content-Disposition': `attachment; filename="mitarbeiter-${new Date().toISOString().split('T')[0]}.csv"`,
			},
		})
	} catch {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}
}
