'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, PhoneOff, ThumbsDown, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DynamicFilterSelector } from '@/components/category-selector'
import { getIcon } from '@/components/icon-picker'
import { recordCall, getNextLead } from '@/app/actions/leads'
import type { Lead, FilterCategory, CallOutcome } from '@/lib/types'

interface CallingInterfaceProps {
	initialLead: Lead | null
	categories: FilterCategory[]
}

export function CallingInterface({
	initialLead,
	categories,
}: CallingInterfaceProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [lead, setLead] = useState<Lead | null>(initialLead)
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
		// Initialize from initial lead's filter values
		if (!initialLead) return {}
		const options: Record<string, string> = {}
		initialLead.filterValues?.forEach((fv) => {
			if (fv.option?.category) {
				options[fv.option.category.id] = fv.optionId
			}
		})
		return options
	})

	function handleSelectionChange(categoryId: string, optionId: string | null) {
		const newOptions = { ...selectedOptions }
		if (optionId === null) {
			delete newOptions[categoryId]
		} else {
			newOptions[categoryId] = optionId
		}
		setSelectedOptions(newOptions)

		// Fetch next lead with new filters
		const optionIds = Object.values(newOptions).filter(Boolean)
		startTransition(async () => {
			const nextLead = await getNextLead(optionIds.length > 0 ? optionIds : undefined)
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

	// Get filter badges for the current lead
	const hasFilters = Object.values(selectedOptions).some(Boolean)

	return (
		<div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:min-h-dvh">
			{/* Header with selectors */}
			<div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:top-0">
				<DynamicFilterSelector
					categories={categories}
					selectedOptions={selectedOptions}
					onSelectionChange={handleSelectionChange}
				/>
			</div>

			{/* Main content */}
			<div className="flex flex-1 flex-col items-center justify-center p-4">
				{lead ? (
					<Card className="w-full max-w-md border bg-card p-8">
						{/* Filter badges */}
						{lead.filterValues && lead.filterValues.length > 0 && (
							<div className="mb-6 flex flex-wrap justify-center gap-2">
								{lead.filterValues.map((fv) => {
									const Icon = getIcon(fv.option.icon)
									return (
										<Badge key={fv.id} variant="secondary" className="text-sm gap-1">
											<Icon className="h-3 w-3" />
											{fv.option.name}
										</Badge>
									)
								})}
							</div>
						)}

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
							{hasFilters
								? 'Keine offenen Leads für diese Filter gefunden.'
								: 'Alle Leads wurden bearbeitet.'}
						</p>
					</Card>
				)}
			</div>
		</div>
	)
}
