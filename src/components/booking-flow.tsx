'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Check, ArrowLeft, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAppointment } from '@/app/actions/appointments'
import type { Lead } from '@/lib/types'

interface BookingFlowProps {
	lead: Lead
}

export function BookingFlow({ lead }: BookingFlowProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [step, setStep] = useState<'booking' | 'success'>('booking')
	const [scheduledDate, setScheduledDate] = useState('')
	const [scheduledTime, setScheduledTime] = useState('')

	// Cal.com URL - can be configured via env
	const calcomUrl = process.env.NEXT_PUBLIC_CALCOM_URL || ''

	function handleConfirmBooking() {
		startTransition(async () => {
			const scheduledAt = scheduledDate && scheduledTime
				? new Date(`${scheduledDate}T${scheduledTime}`)
				: undefined

			await createAppointment(lead.id, undefined, scheduledAt)
			setStep('success')
		})
	}

	function handleBackToCalling() {
		router.push('/calling')
	}

	if (step === 'success') {
		return (
			<Card className="w-full max-w-md border">
				<CardContent className="pt-8 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
						<Check className="h-8 w-8 text-success" />
					</div>
					<h2 className="mb-2 text-xl font-semibold">Termin gebucht!</h2>
					<p className="mb-6 text-muted-foreground">
						Der Termin für {lead.companyName} wurde erfolgreich gespeichert.
					</p>
					<Button
						className="w-full touch-target"
						onClick={handleBackToCalling}
					>
						Zurück zum Anrufen
					</Button>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="w-full max-w-md border">
			<CardHeader>
				<Button
					variant="ghost"
					size="sm"
					className="mb-2 w-fit"
					onClick={handleBackToCalling}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Abbrechen
				</Button>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="h-5 w-5 text-primary" />
					Termin buchen
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Lead info */}
				<div className="rounded-xl bg-muted p-4">
					<p className="font-medium">{lead.companyName}</p>
					<p className="text-sm text-muted-foreground">{lead.phone}</p>
				</div>

				{/* Cal.com link if configured */}
				{calcomUrl && (
					<div className="space-y-2">
						<Label>Über Cal.com buchen</Label>
						<Button
							variant="outline"
							className="w-full touch-target justify-between"
							asChild
						>
							<a
								href={calcomUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								Cal.com öffnen
								<ExternalLink className="h-4 w-4" />
							</a>
						</Button>
					</div>
				)}

				{/* Manual date/time entry */}
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="date">Datum (optional)</Label>
						<Input
							id="date"
							type="date"
							value={scheduledDate}
							onChange={(e) => setScheduledDate(e.target.value)}
							className="h-12"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="time">Uhrzeit (optional)</Label>
						<Input
							id="time"
							type="time"
							value={scheduledTime}
							onChange={(e) => setScheduledTime(e.target.value)}
							className="h-12"
						/>
					</div>
				</div>

				<Button
					className="w-full touch-target-lg text-base font-medium"
					onClick={handleConfirmBooking}
					disabled={isPending}
				>
					{isPending ? 'Wird gespeichert...' : 'Termin bestätigen'}
				</Button>
			</CardContent>
		</Card>
	)
}
