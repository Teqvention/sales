import { CallingInterface } from '@/components/calling-interface'
import { getNextLead } from '@/app/actions/leads'
import { getFilterCategories } from '@/app/actions/filters'

export default async function CallingPage() {
	const [lead, categories] = await Promise.all([
		getNextLead(),
		getFilterCategories(),
	])

	return (
		<CallingInterface
			initialLead={lead}
			categories={categories}
		/>
	)
}
