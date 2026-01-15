import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SettingsContent } from '@/components/settings-content'

export default async function SettingsPage() {
	const user = await getCurrentUser()

	if (!user) {
		redirect('/login')
	}

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div>
				<h1 className="text-2xl font-semibold">Einstellungen</h1>
				<p className="text-muted-foreground">Verwalte dein Konto und Erscheinungsbild</p>
			</div>
			<SettingsContent user={user} />
		</div>
	)
}
