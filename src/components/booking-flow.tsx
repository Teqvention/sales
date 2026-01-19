'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Check, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createAppointment } from '@/app/actions/appointments'
import type { Lead } from '@/lib/types'

interface BookingFlowProps {
	lead: Lead
	userName: string
	userEmail: string
}

// Cal.com base URL
const CALCOM_BASE_URL = 'https://cal.com/teqvention-meeting/15min'

export function BookingFlow({ lead, userName, userEmail }: BookingFlowProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [step, setStep] = useState<'booking' | 'success'>('booking')
	const [iframeLoaded, setIframeLoaded] = useState(false)

	// Build Cal.com embed URL with pre-filled user data
	const calcomEmbedUrl = `${CALCOM_BASE_URL}?embed=true&theme=auto&hideEventTypeDetails=false&name=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`

	function handleConfirmCalcomBooking() {
		startTransition(async () => {
			await createAppointment(lead.id, undefined, undefined)
			setStep('success')
		})
	}

	function handleBackToCalling() {
		router.push('/calling')
	}

	if (step === 'success') {
		return (
			<Card className="w-full max-w-2xl border">
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
		<Card className="w-full max-w-2xl border">
			<CardHeader className="pb-4">
				<Button
					variant="ghost"
					size="sm"
					className="mb-2 w-fit"
					onClick={handleBackToCalling}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Abbrechen
				</Button>
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5 text-primary" />
						Termin buchen für {lead.companyName}
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Cal.com Embed */}
				<div className="relative rounded-xl border bg-background overflow-hidden" style={{ minHeight: '500px' }}>
					{!iframeLoaded && (
						<div className="absolute inset-0 flex items-center justify-center bg-muted/50">
							<div className="flex flex-col items-center gap-2">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
								<p className="text-sm text-muted-foreground">Kalender wird geladen...</p>
							</div>
						</div>
					)}
					<iframe
						src={calcomEmbedUrl}
						className="w-full h-full border-0"
						style={{ minHeight: '500px' }}
						onLoad={() => setIframeLoaded(true)}
						title="Cal.com Terminbuchung"
						allow="payment"
					/>
				</div>

				{/* Confirm booking button */}
				<div className="flex flex-col gap-2">
					<Button
						className="w-full touch-target-lg text-base font-medium h-12"
						onClick={handleConfirmCalcomBooking}
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Wird gespeichert...
							</>
						) : (
							<>
								<Check className="mr-2 h-5 w-5" />
								Termin abschließen
							</>
						)}
					</Button>
					<p className="text-xs text-center text-muted-foreground">
						Wählen Sie oben einen Termin und klicken Sie dann auf &quot;Termin abschließen&quot;
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
