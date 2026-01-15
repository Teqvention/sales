'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Phone,
	Calendar,
	TrendingUp,
	Award,
	Clock,
	Target,
} from 'lucide-react'
import {
	BarChart,
	Bar,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	ResponsiveContainer,
	Tooltip,
	CartesianGrid,
} from 'recharts'
import type { UserStats, DailyVolume, MonthlyVolume } from '@/lib/types'

interface DashboardContentProps {
	stats: UserStats
	weeklyVolume: DailyVolume[]
	monthlyVolume: DailyVolume[]
	yearlyVolume: MonthlyVolume[]
}

// Apple Blue color palette
const CHART_COLORS = {
	primary: '#007AFF',
	primaryLight: '#5AC8FA',
	primaryDark: '#0051D5',
	text: '#8E8E93',
	grid: '#F2F2F7',
}

export function DashboardContent({ 
	stats, 
	weeklyVolume,
	monthlyVolume,
	yearlyVolume,
}: DashboardContentProps) {
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
						<p className="text-2xl font-bold">{stats.callsToday}</p>
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
						<p className="text-2xl font-bold">{stats.callsThisWeek}</p>
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
						<p className="text-2xl font-bold">{stats.appointmentsBooked}</p>
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
						<p className="text-2xl font-bold">{stats.conversions}</p>
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
						<p className="text-2xl font-bold">{stats.appointmentRate}%</p>
					</CardContent>
				</Card>
			</div>

			{/* Call volume chart with tabs */}
			<Card className="border shadow-none">
				<CardHeader>
					<CardTitle className="text-base">Anrufvolumen</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="weekly" className="w-full">
						<TabsList className="mb-4">
							<TabsTrigger value="weekly">Wöchentlich</TabsTrigger>
							<TabsTrigger value="monthly">Monatlich</TabsTrigger>
							<TabsTrigger value="yearly">Jährlich</TabsTrigger>
						</TabsList>

						<TabsContent value="weekly">
							<div className="h-[220px] w-full">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={formattedWeekly} barCategoryGap="20%">
										<defs>
											<linearGradient id="barGradientWeekly" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor={CHART_COLORS.primaryLight} stopOpacity={1} />
												<stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={1} />
											</linearGradient>
										</defs>
										<CartesianGrid 
											strokeDasharray="3 3" 
											stroke={CHART_COLORS.grid}
											vertical={false}
										/>
										<XAxis
											dataKey="label"
											fontSize={12}
											fontWeight={500}
											tickLine={false}
											axisLine={false}
											tick={{ fill: CHART_COLORS.text }}
											dy={8}
										/>
										<YAxis
											fontSize={12}
											fontWeight={500}
											tickLine={false}
											axisLine={false}
											allowDecimals={false}
											tick={{ fill: CHART_COLORS.text }}
											dx={-8}
										/>
										<Tooltip
											cursor={{ fill: 'rgba(0, 122, 255, 0.05)', radius: 8 }}
											contentStyle={{
												background: 'rgba(255, 255, 255, 0.95)',
												backdropFilter: 'blur(10px)',
												border: 'none',
												borderRadius: '12px',
												boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
												padding: '12px 16px',
											}}
											labelStyle={{ color: '#1D1D1F', fontWeight: 600, marginBottom: 4 }}
											itemStyle={{ color: CHART_COLORS.primary }}
											formatter={(value) => [`${value ?? 0} Anrufe`, '']}
										/>
										<Bar
											dataKey="calls"
											fill="url(#barGradientWeekly)"
											radius={[8, 8, 0, 0]}
											maxBarSize={50}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</TabsContent>

						<TabsContent value="monthly">
							<div className="h-[220px] w-full">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={formattedMonthly} barCategoryGap="10%">
										<defs>
											<linearGradient id="barGradientMonthly" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor={CHART_COLORS.primaryLight} stopOpacity={1} />
												<stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={1} />
											</linearGradient>
										</defs>
										<CartesianGrid 
											strokeDasharray="3 3" 
											stroke={CHART_COLORS.grid}
											vertical={false}
										/>
										<XAxis
											dataKey="label"
											fontSize={11}
											fontWeight={500}
											tickLine={false}
											axisLine={false}
											interval="preserveStartEnd"
											tick={{ fill: CHART_COLORS.text }}
											dy={8}
										/>
										<YAxis
											fontSize={12}
											fontWeight={500}
											tickLine={false}
											axisLine={false}
											allowDecimals={false}
											tick={{ fill: CHART_COLORS.text }}
											dx={-8}
										/>
										<Tooltip
											cursor={{ fill: 'rgba(0, 122, 255, 0.05)', radius: 8 }}
											contentStyle={{
												background: 'rgba(255, 255, 255, 0.95)',
												backdropFilter: 'blur(10px)',
												border: 'none',
												borderRadius: '12px',
												boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
												padding: '12px 16px',
											}}
											labelStyle={{ color: '#1D1D1F', fontWeight: 600, marginBottom: 4 }}
											itemStyle={{ color: CHART_COLORS.primary }}
											formatter={(value) => [`${value ?? 0} Anrufe`, '']}
										/>
										<Bar
											dataKey="calls"
											fill="url(#barGradientMonthly)"
											radius={[6, 6, 0, 0]}
											maxBarSize={24}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</TabsContent>

						<TabsContent value="yearly">
							<div className="h-[220px] w-full">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={formattedYearly}>
										<defs>
											<linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
												<stop offset="50%" stopColor={CHART_COLORS.primaryLight} stopOpacity={0.15} />
												<stop offset="100%" stopColor={CHART_COLORS.primaryLight} stopOpacity={0} />
											</linearGradient>
											<linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
												<stop offset="0%" stopColor={CHART_COLORS.primary} />
												<stop offset="50%" stopColor={CHART_COLORS.primaryLight} />
												<stop offset="100%" stopColor={CHART_COLORS.primary} />
											</linearGradient>
										</defs>
										<CartesianGrid 
											strokeDasharray="3 3" 
											stroke={CHART_COLORS.grid}
											vertical={false}
										/>
										<XAxis
											dataKey="label"
											fontSize={12}
											fontWeight={500}
											tickLine={false}
											axisLine={false}
											tick={{ fill: CHART_COLORS.text }}
											dy={8}
										/>
										<YAxis
											fontSize={12}
											fontWeight={500}
											tickLine={false}
											axisLine={false}
											allowDecimals={false}
											tick={{ fill: CHART_COLORS.text }}
											dx={-8}
										/>
										<Tooltip
											cursor={{ stroke: CHART_COLORS.primary, strokeWidth: 1, strokeDasharray: '4 4' }}
											contentStyle={{
												background: 'rgba(255, 255, 255, 0.95)',
												backdropFilter: 'blur(10px)',
												border: 'none',
												borderRadius: '12px',
												boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
												padding: '12px 16px',
											}}
											labelStyle={{ color: '#1D1D1F', fontWeight: 600, marginBottom: 4 }}
											itemStyle={{ color: CHART_COLORS.primary }}
											formatter={(value) => [`${value ?? 0} Anrufe`, '']}
										/>
										<Area
											type="monotone"
											dataKey="calls"
											stroke="url(#lineGradient)"
											strokeWidth={3}
											fill="url(#areaGradient)"
											dot={false}
											activeDot={{
												r: 6,
												fill: CHART_COLORS.primary,
												stroke: '#fff',
												strokeWidth: 2,
											}}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	)
}
