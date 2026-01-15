'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, PhoneOff, ThumbsDown, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CategorySelector } from '@/components/category-selector'
import { recordCall, getNextLead } from '@/app/actions/leads'
import type { Lead, Industry, Service, CallOutcome } from '@/lib/types'

interface CallingInterfaceProps {
	initialLead: Lead | null
	industries: Industry[]
	services: Service[]
}

export function CallingInterface({
	initialLead,
	industries,
	services,
}: CallingInterfaceProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [lead, setLead] = useState<Lead | null>(initialLead)
	const [selectedIndustry, setSelectedIndustry] = useState<string | null>(
		initialLead?.industryId ?? null
	)
	const [selectedService, setSelectedService] = useState<string | null>(
		initialLead?.serviceId ?? null
	)

	function handleIndustryChange(id: string | null) {
		setSelectedIndustry(id)
		startTransition(async () => {
			const nextLead = await getNextLead(id, selectedService)
			setLead(nextLead)
		})
	}

	function handleServiceChange(id: string | null) {
		setSelectedService(id)
		startTransition(async () => {
			const nextLead = await getNextLead(selectedIndustry, id)
			setLead(nextLead)
		})
	}

	function handleCallOutcome(outcome: CallOutcome) {
		if (!lead) return

		startTransition(async () => {
			const result = await recordCall(lead.id, outcome)

			if (result.success) {
				if (outcome === 'BOOKED') {
					router.push(`/booking/${lead.id}`)
				} else if (result.nextLead) {
					setLead(result.nextLead)
				} else {
					setLead(null)
				}
			}
		})
	}

	return (
		<div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:min-h-dvh">
			{/* Header with selectors */}
			<div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:top-0">
				<CategorySelector
					industries={industries}
					services={services}
					selectedIndustry={selectedIndustry}
					selectedService={selectedService}
					onIndustryChange={handleIndustryChange}
					onServiceChange={handleServiceChange}
				/>
			</div>

			{/* Main content */}
			<div className="flex flex-1 flex-col items-center justify-center p-4">
				{lead ? (
					<Card className="w-full max-w-md border bg-card p-8">
						{/* Industry/Service badges */}
						<div className="mb-6 flex flex-wrap justify-center gap-2">
							{lead.industry && (
								<Badge variant="secondary" className="text-sm">
									{lead.industry.name}
								</Badge>
							)}
							{lead.service && (
								<Badge variant="outline" className="text-sm">
									{lead.service.name}
								</Badge>
							)}
						</div>

						{/* Phone number - tap to call */}
						<a
							href={`tel:${lead.phone}`}
							className="mb-4 block text-center"
						>
							<div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
								<Phone className="h-10 w-10 text-primary" />
							</div>
							<p className="text-3xl font-semibold tracking-tight text-primary">
								{lead.phone}
							</p>
						</a>

						{/* Company name */}
						<p className="mb-8 text-center text-xl text-muted-foreground">
							{lead.companyName}
						</p>

						{/* Action buttons */}
						<div className="grid gap-3">
							<Button
								size="lg"
								variant="outline"
								className="h-14 touch-target-lg rounded-xl text-base font-medium"
								onClick={() => handleCallOutcome('NO_ANSWER')}
								disabled={isPending}
							>
								<PhoneOff className="mr-2 h-5 w-5" />
								Nicht rangegangen
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="h-14 touch-target-lg rounded-xl text-base font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
								onClick={() => handleCallOutcome('NO_INTEREST')}
								disabled={isPending}
							>
								<ThumbsDown className="mr-2 h-5 w-5" />
								Kein Interesse
							</Button>
							<Button
								size="lg"
								className="h-14 touch-target-lg rounded-xl text-base font-medium"
								onClick={() => handleCallOutcome('BOOKED')}
								disabled={isPending}
							>
								<Calendar className="mr-2 h-5 w-5" />
								Termin vereinbart
							</Button>
						</div>
					</Card>
				) : (
					<Card className="w-full max-w-md border bg-card p-8 text-center">
						<div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
							<Phone className="h-10 w-10 text-muted-foreground" />
						</div>
						<h2 className="mb-2 text-xl font-semibold">Keine Leads verfügbar</h2>
						<p className="text-muted-foreground">
							{selectedIndustry || selectedService
								? 'Keine offenen Leads für diese Filter gefunden.'
								: 'Alle Leads wurden bearbeitet.'}
						</p>
					</Card>
				)}
			</div>
		</div>
	)
}
