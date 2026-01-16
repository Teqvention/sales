import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SettingsContent } from '@/components/settings-content'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
	const user = await getCurrentUser()

	if (!user) {
		redirect('/login')
	}

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="flex items-center gap-4">
				<div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
					<Settings className="h-6 w-6 text-primary-foreground" />
				</div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Einstellungen</h1>
					<p className="text-muted-foreground">Verwalte dein Konto und Erscheinungsbild</p>
				</div>
			</div>
			<SettingsContent user={user} />
		</div>
	)
}
