'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
	Phone,
	Building,
	Briefcase,
	Check,
	X,
	PhoneOff,
	Calendar,
	Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { CategorySelector } from '@/components/category-selector'
import { markAsConverted } from '@/app/actions/leads'
import type { Lead, Industry, Service, LeadStatus } from '@/lib/types'

interface LeadManagementProps {
	initialLeads: Lead[]
	industries: Industry[]
	services: Service[]
}

const statusConfig: Record<LeadStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Phone }> = {
	OPEN: { label: 'Offen', variant: 'secondary', icon: Phone },
	NO_ANSWER: { label: 'Nicht erreicht', variant: 'outline', icon: PhoneOff },
	NO_INTEREST: { label: 'Kein Interesse', variant: 'destructive', icon: X },
	BOOKED: { label: 'Gebucht', variant: 'default', icon: Calendar },
	CONVERTED: { label: 'Converted', variant: 'default', icon: Award },
}

export function LeadManagement({
	initialLeads,
	industries,
	services,
}: LeadManagementProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
	const [selectedService, setSelectedService] = useState<string | null>(null)
	const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null)

	// Status priority for sorting: CONVERTED > BOOKED > OPEN > NO_ANSWER > NO_INTEREST
	const statusOrder: Record<string, number> = {
		CONVERTED: 0,
		BOOKED: 1,
		OPEN: 2,
		NO_ANSWER: 3,
		NO_INTEREST: 4,
	}

	const filteredLeads = initialLeads
		.filter((lead) => {
			if (selectedIndustry && lead.industryId !== selectedIndustry) return false
			if (selectedService && lead.serviceId !== selectedService) return false
			if (selectedStatus && lead.status !== selectedStatus) return false
			return true
		})
		.sort((a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5))

	function handleMarkConverted(leadId: string) {
		startTransition(async () => {
			await markAsConverted(leadId)
			router.refresh()
		})
	}

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<CategorySelector
					industries={industries}
					services={services}
					selectedIndustry={selectedIndustry}
					selectedService={selectedService}
					onIndustryChange={setSelectedIndustry}
					onServiceChange={setSelectedService}
				/>

				<div className="flex gap-2">
					{(Object.entries(statusConfig) as [LeadStatus, typeof statusConfig.OPEN][]).map(
						([status, config]) => (
							<Button
								key={status}
								variant={selectedStatus === status ? 'default' : 'outline'}
								size="sm"
								className="h-10 rounded-xl"
								onClick={() =>
									setSelectedStatus(selectedStatus === status ? null : status)
								}
							>
								{config.label}
							</Button>
						)
					)}
				</div>
			</div>

			{/* Lead table */}
			<Card className="border shadow-none">
				<CardHeader>
					<CardTitle className="text-base">
						Leads ({filteredLeads.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{filteredLeads.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground">
							Keine Leads gefunden
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Firma</TableHead>
									<TableHead>Telefon</TableHead>
									<TableHead>Branche</TableHead>
									<TableHead>Service</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-12"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredLeads.map((lead) => {
									const config = statusConfig[lead.status as LeadStatus]
									const StatusIcon = config.icon
									return (
										<TableRow key={lead.id}>
											<TableCell className="font-medium">{lead.companyName}</TableCell>
											<TableCell className="text-muted-foreground">{lead.phone}</TableCell>
											<TableCell>
												{lead.industry && (
													<span className="flex items-center gap-1 text-sm text-muted-foreground">
														<Building className="h-3 w-3" />
														{lead.industry.name}
													</span>
												)}
											</TableCell>
											<TableCell>
												{lead.service && (
													<span className="flex items-center gap-1 text-sm text-muted-foreground">
														<Briefcase className="h-3 w-3" />
														{lead.service.name}
													</span>
												)}
											</TableCell>
											<TableCell>
												<Badge variant={config.variant} className="gap-1">
													<StatusIcon className="h-3 w-3" />
													{config.label}
												</Badge>
											</TableCell>
											<TableCell>
												{lead.status === 'BOOKED' && (
													<Button
														size="sm"
														variant="outline"
														className="gap-1 h-8"
														onClick={() => handleMarkConverted(lead.id)}
														disabled={isPending}
													>
														<Check className="h-3 w-3" />
														Convert
													</Button>
												)}
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
