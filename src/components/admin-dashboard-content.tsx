'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Phone,
	Calendar,
	Award,
	Users,
	FileCheck,
	FileX,
	PhoneOff,
	Clock,
	ExternalLink,
	Download,
	TrendingUp,
	TrendingDown,
} from 'lucide-react'
import type { UserStats, EmployeeRanking, LeadOverview, Trend } from '@/lib/types'

interface AdminDashboardContentProps {
	stats: UserStats
	rankings: EmployeeRanking[]
	leadOverview: LeadOverview
}

function TrendIndicator({ trend }: { trend?: Trend }) {
	if (!trend) return null
	
	if (trend === 'up') {
		return (
			<TrendingUp className="h-3.5 w-3.5 text-green-600" />
		)
	}
	
	return (
		<TrendingDown className="h-3.5 w-3.5 text-red-600" />
	)
}

export function AdminDashboardContent({
	stats,
	rankings,
	leadOverview,
}: AdminDashboardContentProps) {
	const totalLeads =
		leadOverview.open +
		leadOverview.noAnswer +
		leadOverview.noInterest +
		leadOverview.booked +
		leadOverview.converted

	return (
		<div className="space-y-6">
			{/* Export buttons */}
			<div className="flex flex-wrap gap-3">
				<Button variant="outline" className="gap-2" asChild>
					<a href="/api/exports/employees" download>
						<Download className="h-4 w-4" />
						Mitarbeiter CSV
					</a>
				</Button>
				<Button variant="outline" className="gap-2" asChild>
					<a href="/api/exports/leads" download>
						<Download className="h-4 w-4" />
						Leads CSV
					</a>
				</Button>
			</div>

			{/* Global stats */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				<Card className="border shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Anrufe gesamt
						</CardTitle>
						<Phone className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{stats.totalCalls}</p>
					</CardContent>
				</Card>

				<Card className="border shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Heute
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<p className="text-2xl font-bold">{stats.callsToday}</p>
							<TrendIndicator trend={stats.trends?.callsToday} />
						</div>
					</CardContent>
				</Card>

				<Card className="border shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Termine
						</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<p className="text-2xl font-bold">{stats.appointmentsBooked}</p>
							<TrendIndicator trend={stats.trends?.appointmentsBooked} />
						</div>
					</CardContent>
				</Card>

				<Card className="border shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Conversions
						</CardTitle>
						<Award className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<p className="text-2xl font-bold">{stats.conversions}</p>
							<TrendIndicator trend={stats.trends?.conversions} />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Lead overview */}
			<Card className="border shadow-none">
				<CardHeader>
					<CardTitle className="flex items-center justify-between text-base">
						<span>Lead-Übersicht</span>
						<Badge variant="secondary">{totalLeads} gesamt</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
						<div className="flex items-center gap-3 rounded-xl border bg-card p-4">
							<FileCheck className="h-5 w-5 text-primary" />
							<div>
								<p className="text-sm text-muted-foreground">Offen</p>
								<p className="text-xl font-semibold">{leadOverview.open}</p>
							</div>
						</div>
						<div className="flex items-center gap-3 rounded-xl border bg-card p-4">
							<PhoneOff className="h-5 w-5 text-muted-foreground" />
							<div>
								<p className="text-sm text-muted-foreground">Nicht erreicht</p>
								<p className="text-xl font-semibold">{leadOverview.noAnswer}</p>
							</div>
						</div>
						<div className="flex items-center gap-3 rounded-xl border bg-card p-4">
							<FileX className="h-5 w-5 text-destructive" />
							<div>
								<p className="text-sm text-muted-foreground">Kein Interesse</p>
								<p className="text-xl font-semibold">{leadOverview.noInterest}</p>
							</div>
						</div>
						<div className="flex items-center gap-3 rounded-xl border bg-card p-4">
							<Calendar className="h-5 w-5 text-primary" />
							<div>
								<p className="text-sm text-muted-foreground">Gebucht</p>
								<p className="text-xl font-semibold">{leadOverview.booked}</p>
							</div>
						</div>
						<div className="flex items-center gap-3 rounded-xl border bg-card p-4">
							<Award className="h-5 w-5 text-success" />
							<div>
								<p className="text-sm text-muted-foreground">Converted</p>
								<p className="text-xl font-semibold">{leadOverview.converted}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Employee rankings */}
			<Card className="border shadow-none">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<Users className="h-5 w-5" />
						Mitarbeiter-Ranking
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{rankings.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground">
							Noch keine Mitarbeiter-Daten
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">#</TableHead>
									<TableHead>Benutzer</TableHead>
									<TableHead className="text-right">Anrufe</TableHead>
									<TableHead className="text-right">Termine</TableHead>
									<TableHead className="text-right">Conv.</TableHead>
									<TableHead className="text-right">Quote</TableHead>
									<TableHead className="w-12"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{rankings.map((employee, index) => (
									<TableRow key={employee.id}>
										<TableCell>
											<div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
												{index + 1}
											</div>
										</TableCell>
										<TableCell className="font-medium">{employee.name}</TableCell>
										<TableCell className="text-right">{employee.totalCalls}</TableCell>
										<TableCell className="text-right">{employee.appointments}</TableCell>
										<TableCell className="text-right">{employee.conversions}</TableCell>
										<TableCell className="text-right">
											<Badge variant="secondary">{employee.appointmentRate}%</Badge>
										</TableCell>
										<TableCell>
											<Button variant="ghost" size="icon" className="h-8 w-8" asChild>
												<Link href={`/admin/users/${employee.id}`}>
													<ExternalLink className="h-4 w-4" />
												</Link>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
