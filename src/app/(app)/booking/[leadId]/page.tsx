import { getLeadById } from '@/app/actions/leads'
import { BookingFlow } from '@/components/booking-flow'
import { notFound } from 'next/navigation'

interface BookingPageProps {
	params: Promise<{ leadId: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
	const { leadId } = await params
	const lead = await getLeadById(leadId)

	if (!lead) {
		notFound()
	}

	return (
		<div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center p-4 md:min-h-dvh">
			<BookingFlow lead={lead} />
		</div>
	)
}
