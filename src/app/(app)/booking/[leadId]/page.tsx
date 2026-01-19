import { getLeadById } from '@/app/actions/leads'
import { getCurrentUser } from '@/lib/auth'
import { BookingFlow } from '@/components/booking-flow'
import { notFound, redirect } from 'next/navigation'

interface BookingPageProps {
	params: Promise<{ leadId: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
	const { leadId } = await params
	const [lead, user] = await Promise.all([
		getLeadById(leadId),
		getCurrentUser()
	])

	if (!user) {
		redirect('/login')
	}

	if (!lead) {
		notFound()
	}

	return (
		<div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center p-4 md:min-h-dvh">
			<BookingFlow
				lead={lead}
				userName={user.name}
				userEmail={user.email}
			/>
		</div>
	)
}

