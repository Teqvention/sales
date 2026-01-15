import { CallingInterface } from '@/components/calling-interface'
import { getNextLead } from '@/app/actions/leads'
import { getIndustries, getServices } from '@/app/actions/categories'

export default async function CallingPage() {
	const [lead, industries, services] = await Promise.all([
		getNextLead(),
		getIndustries(),
		getServices(),
	])

	return (
		<CallingInterface
			initialLead={lead}
			industries={industries}
			services={services}
		/>
	)
}
