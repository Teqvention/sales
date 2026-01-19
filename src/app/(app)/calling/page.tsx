import { CallingInterface } from '@/components/calling-interface'
import { getNextLead, getLeadById } from '@/app/actions/leads'
import { getFilterCategories } from '@/app/actions/filters'

interface PageProps {
	searchParams: {
		leadId?: string
	}
}

export default async function CallingPage({ searchParams }: PageProps) {
	// Await searchParams in Next.js 15+ (if applicable) or access directly.
	// In App Router usually props are promises or checking framework version.
	// Assuming standard Next.js 14/15 usage where searchParams might be a promise in future, 
	// but currently it's usually passed as props.
	// Safe to await if it's a promise, or just access.
	// Note: In Next.js 15 searchParams is a Promise. Let's handle it safely.

	const { leadId } = searchParams

	const [lead, categories] = await Promise.all([
		leadId ? getLeadById(leadId) : getNextLead(),
		getFilterCategories(),
	])

	return (
		<CallingInterface
			key={lead?.id}
			initialLead={lead}
			categories={categories}
		/>
	)
}
