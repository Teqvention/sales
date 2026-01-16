'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
	BarChart,
	Bar,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	ResponsiveContainer,
	Tooltip,
	CartesianGrid,
	Legend,
} from 'recharts'
import type { UserStats, DailyVolume, MonthlyVolume, Trend } from '@/lib/types'

interface DashboardContentProps {
	stats: UserStats
	weeklyVolume: DailyVolume[]
	monthlyVolume: DailyVolume[]
	yearlyVolume: MonthlyVolume[]
}

// Chart colors - using actual values for SVG compatibility
// Primary: Apple Blue (#007AFF / oklch 0.58 0.22 255)
// Muted: Neutral gray for non-converted
const CHART_COLORS = {
	primary: '#007AFF',           // Apple Blue
	primaryLight: '#5AC8FA',      // Light blue for gradient
	primaryDark: '#0055D4',       // Darker blue
	text: '#8E8E93',              // System gray
	grid: '#E5E5EA',              // Light border
	muted: '#C7C7CC',             // Muted gray for non-converted
	converted: '#007AFF',         // Primary blue for conversions
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

export function DashboardContent({
	stats,
	weeklyVolume,
	monthlyVolume,
	yearlyVolume,
}: DashboardContentProps) {
	const formattedWeekly = weeklyVolume.map((d) => ({
		...d,
		label: new Date(d.date).toLocaleDateString('de-DE', { weekday: 'short' }),
		nonConverted: Math.max(0, d.calls - d.conversions),
	}))

	const formattedMonthly = monthlyVolume.map((d) => ({
		...d,
		label: new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
		nonConverted: Math.max(0, d.calls - d.conversions),
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
											<linearGradient id="convertedGradient" x1="0" y1="0" x2="0" y2="1">
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
											isAnimationActive={false}
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
											formatter={(value: any, name: any) => {
												if (name === 'Anrufe') return [`${value} Anrufe`, 'Nicht konvertiert']
												if (name === 'Konvertiert') return [`${value} Konvertiert`, 'Konvertiert']
												return [value, name]
											}}
										/>
										<Legend />
										<Bar
											dataKey="conversions"
											name="Konvertiert"
											stackId="a"
											fill="url(#convertedGradient)"
											radius={[0, 0, 0, 0]}
											maxBarSize={50}
										/>
										<Bar
											dataKey="nonConverted"
											name="Anrufe"
											stackId="a"
											fill={CHART_COLORS.muted}
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
											<linearGradient id="convertedGradientMonthly" x1="0" y1="0" x2="0" y2="1">
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
											isAnimationActive={false}
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
											formatter={(value: any, name: any) => {
												if (name === 'Anrufe') return [`${value} Anrufe`, 'Nicht konvertiert']
												if (name === 'Konvertiert') return [`${value} Konvertiert`, 'Konvertiert']
												return [value, name]
											}}
										/>
										<Legend />
										<Bar
											dataKey="conversions"
											name="Konvertiert"
											stackId="a"
											fill="url(#convertedGradientMonthly)"
											radius={[0, 0, 0, 0]}
											maxBarSize={24}
										/>
										<Bar
											dataKey="nonConverted"
											name="Anrufe"
											stackId="a"
											fill={CHART_COLORS.muted}
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
