'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Phone, PhoneOff, ThumbsDown, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DynamicFilterSelector } from '@/components/category-selector'
import { getIcon } from '@/components/icon-picker'
import { recordCall, getNextLead, scheduleCallback } from '@/app/actions/leads'
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
	const [callbackOpen, setCallbackOpen] = useState(false)
	const [date, setDate] = useState<Date | undefined>(undefined)
	const [selectedTime, setSelectedTime] = useState<string | null>(null)
	const [callbackNote, setCallbackNote] = useState('')

	// Generate time slots (every 15 mins from 09:00, similar to reference but covering work hours)
	// Reference uses: Math.floor(totalMinutes / 60) + 9 -> starts at 9:00
	const timeSlots = Array.from({ length: 37 }, (_, i) => {
		const totalMinutes = i * 15
		const hour = Math.floor(totalMinutes / 60) + 9
		const minute = totalMinutes % 60
		return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
	})

	function handleDateSelect(newDate: Date | undefined) {
		setDate(newDate)
	}

	function handleTimeSelect(time: string) {
		setSelectedTime(time)
	}

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
			if (nextLead) {
				router.push(`/calling?leadId=${nextLead.id}`)
			} else {
				router.push('/calling')
			}
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
					router.push(`/calling?leadId=${result.nextLead.id}`)
				} else {
					router.push('/calling')
				}
			}
		})
	}

	function handleCallbackSubmit() {
		if (!lead || !date || !selectedTime) return

		startTransition(async () => {
			const [hours, minutes] = selectedTime.split(':').map(Number)
			const callbackDateTime = new Date(date)
			callbackDateTime.setHours(hours)
			callbackDateTime.setMinutes(minutes)

			const result = await scheduleCallback(lead.id, callbackDateTime, callbackNote)

			if (result.success) {
				setCallbackOpen(false)
				setDate(undefined)
				setSelectedTime(null)
				setCallbackNote('')
				// Fetch next lead using current filters
				const optionIds = Object.values(selectedOptions).filter(Boolean)
				const nextLead = await getNextLead(optionIds.length > 0 ? optionIds : undefined)
				if (nextLead) {
					router.push(`/calling?leadId=${nextLead.id}`)
				} else {
					router.push('/calling')
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
						{/* Callback Notice */}
						{lead.nextCallAt && (
							<div className="mb-6 rounded-lg bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400 border border-amber-500/20">
								<div className={cn("flex items-center gap-2 font-medium", lead.nextCallNotes && "mb-1")}>
									<Clock className="h-4 w-4" />
									Rückruf {lead.nextCallAt && `vom ${format(new Date(lead.nextCallAt), 'dd.MM.yyyy', { locale: de })}`}
								</div>
								{lead.nextCallNotes && <p className="text-sm">{lead.nextCallNotes}</p>}
							</div>
						)}

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
								className="h-14 touch-target-lg rounded-xl text-base font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
								onClick={() => handleCallOutcome('NO_INTEREST')}
								disabled={isPending}
							>
								<ThumbsDown className="mr-2 h-5 w-5" />
								Kein Interesse
							</Button>
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
								className="h-14 touch-target-lg rounded-xl text-base font-medium"
								onClick={() => setCallbackOpen(true)}
								disabled={isPending}
							>
								<Clock className="mr-2 h-5 w-5" />
								Anderer Zeitpunkt
							</Button>
							<Button
								size="lg"
								className="h-14 touch-target-lg rounded-xl text-base font-medium"
								onClick={() => handleCallOutcome('BOOKED')}
								disabled={isPending}
							>
								<CalendarIcon className="mr-2 h-5 w-5" />
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

			<Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
				<DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
					<div className="px-6 pt-6 pb-4">
						<DialogHeader>
							<DialogTitle>Rückruf planen</DialogTitle>
						</DialogHeader>
					</div>

					<div className="relative p-0 md:pr-48 border-t border-b">
						<div className="p-6 flex justify-center">
							<Calendar
								mode="single"
								selected={date}
								onSelect={setDate}
								initialFocus
								className="bg-transparent p-0 [--cell-size:2.5rem] md:[--cell-size:3rem]"
								classNames={{
									day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
								}}
							/>
						</div>
						<div className="inset-y-0 right-0 flex max-h-72 w-full flex-col gap-2 overflow-y-auto border-t p-6 md:absolute md:max-h-none md:w-48 md:border-t-0 md:border-l [&::-webkit-scrollbar]:hidden">
							{timeSlots.map((time) => (
								<Button
									key={time}
									variant={selectedTime === time ? "default" : "outline"}
									onClick={() => setSelectedTime(time)}
									className="w-full justify-center shadow-none"
								>
									{time}
								</Button>
							))}
						</div>
					</div>

					<div className="p-6 space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="notes">Notiz</Label>
							<Textarea
								id="notes"
								placeholder="Warum später anrufen?"
								value={callbackNote}
								onChange={(e) => setCallbackNote(e.target.value)}
							/>
						</div>

						<DialogFooter className="flex flex-col gap-4 sm:flex-row items-center">
							<div className="text-sm flex-1 text-muted-foreground text-center sm:text-left">
								{date && selectedTime ? (
									<span>
										Termin am <span className="font-medium text-foreground">{format(date, 'EEEE, d. MMMM', { locale: de })}</span> um <span className="font-medium text-foreground">{selectedTime}</span>
									</span>
								) : (
									<span>Bitte Datum und Uhrzeit wählen</span>
								)}
							</div>
							<div className="flex gap-2 w-full sm:w-auto">
								<Button className="flex-1 sm:flex-none" variant="outline" onClick={() => setCallbackOpen(false)}>
									Abbrechen
								</Button>
								<Button className="flex-1 sm:flex-none" onClick={handleCallbackSubmit} disabled={!date || !selectedTime || isPending}>
									Speichern
								</Button>
							</div>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
