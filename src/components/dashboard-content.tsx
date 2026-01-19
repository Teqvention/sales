'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
	Phone,
	Calendar,
	TrendingUp,
	TrendingDown,
	Award,
	Clock,
	Target,
} from 'lucide-react'
import {
	Area,
	AreaChart,
	CartesianGrid,
	XAxis,
	Tooltip,
	ResponsiveContainer,
} from 'recharts'
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from '@/components/ui/chart'
import type { UserStats, DailyVolume, MonthlyVolume, Trend } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DashboardContentProps {
	stats: UserStats
	weeklyVolume: DailyVolume[]
	monthlyVolume: DailyVolume[]
	yearlyVolume: MonthlyVolume[]
}

const chartConfig = {
	calls: {
		label: 'Anrufe',
		color: 'var(--chart-1)',
	},
	bookings: {
		label: 'Termine',
		color: 'var(--chart-2)',
	},
	conversions: {
		label: 'Converted',
		color: 'var(--chart-3)',
	},
} satisfies ChartConfig

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

export function DashboardContent({
	stats,
	weeklyVolume,
	monthlyVolume,
	yearlyVolume,
}: DashboardContentProps) {
	const [activeSeries, setActiveSeries] = React.useState<string[]>(['calls'])

	const toggleSeries = (series: string) => {
		setActiveSeries(prev =>
			prev.includes(series)
				? prev.filter(s => s !== series)
				: [...prev, series]
		)
	}

	const formattedWeekly = weeklyVolume.map((d) => ({
		...d,
		label: new Date(d.date).toLocaleDateString('de-DE', { weekday: 'short' }),
	}))

	const formattedMonthly = monthlyVolume.map((d) => ({
		...d,
		label: new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
	}))

	const formattedYearly = yearlyVolume.map((d) => ({
		...d,
		label: new Date(d.month + '-01').toLocaleDateString('de-DE', { month: 'short' }),
	}))

	const renderChart = (data: any[]) => (
		<div className="h-[300px] w-full">
			<ChartContainer config={chartConfig} className="h-full w-full">
				<AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
					<defs>
						<linearGradient id="fillCalls" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
							<stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
						</linearGradient>
						<linearGradient id="fillBookings" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
							<stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
						</linearGradient>
						<linearGradient id="fillConversions" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
							<stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
						</linearGradient>
					</defs>
					<CartesianGrid vertical={false} strokeDasharray="3 3" />
					<XAxis
						dataKey="label"
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						minTickGap={32}
					/>
					<ChartTooltip
						cursor={false}
						content={<ChartTooltipContent indicator="dot" />}
					/>
					{activeSeries.includes('conversions') && (
						<Area
							dataKey="conversions"
							type="monotone"
							fill="url(#fillConversions)"
							stroke="var(--chart-3)"
							stackId="a"
						/>
					)}
					{activeSeries.includes('bookings') && (
						<Area
							dataKey="bookings"
							type="monotone"
							fill="url(#fillBookings)"
							stroke="var(--chart-2)"
							stackId="a"
						/>
					)}
					{activeSeries.includes('calls') && (
						<Area
							dataKey="calls"
							type="monotone"
							fill="url(#fillCalls)"
							stroke="var(--chart-1)"
							stackId="a"
							fillOpacity={0.4}
						/>
					)}
					<ChartLegend content={<ChartLegendContent />} />
				</AreaChart>
			</ChartContainer>
		</div>
	)

	return (
		<div className="space-y-6">
			{/* Stats grid */}
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
							Diese Woche
						</CardTitle>
						<Target className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<p className="text-2xl font-bold">{stats.callsThisWeek}</p>
							<TrendIndicator trend={stats.trends?.callsThisWeek} />
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

				<Card className="border shadow-none">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Terminquote
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2">
							<p className="text-2xl font-bold">{stats.appointmentRate}%</p>
							<TrendIndicator trend={stats.trends?.appointmentRate} />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Call volume chart with tabs and toggles */}
			<Card className="border shadow-none">
				<CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<div>
						<CardTitle className="text-base">Anrufvolumen</CardTitle>
						<CardDescription>Interaktive Übersicht deiner Aktivitäten</CardDescription>
					</div>
					<div className="flex flex-wrap gap-2">
						{(['calls', 'bookings', 'conversions'] as const).map((series) => (
							<Button
								key={series}
								variant={activeSeries.includes(series) ? 'default' : 'outline'}
								size="sm"
								onClick={() => toggleSeries(series)}
								className={cn(
									"h-8 transition-all",
									activeSeries.includes(series) ? "" : "text-muted-foreground hover:text-foreground"
								)}
							>
								{chartConfig[series].label}
							</Button>
						))}
					</div>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="weekly" className="w-full">
						<TabsList className="mb-4">
							<TabsTrigger value="weekly">Wöchentlich</TabsTrigger>
							<TabsTrigger value="monthly">Monatlich</TabsTrigger>
							<TabsTrigger value="yearly">Jährlich</TabsTrigger>
						</TabsList>

						<TabsContent value="weekly">
							{renderChart(formattedWeekly)}
						</TabsContent>

						<TabsContent value="monthly">
							{renderChart(formattedMonthly)}
						</TabsContent>

						<TabsContent value="yearly">
							{renderChart(formattedYearly)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
}
