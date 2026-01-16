import { getAllUsers } from '@/app/actions/users'
import { UserManagement } from '@/components/user-management'
import { requireAdmin } from '@/lib/auth'
import { Users } from 'lucide-react'

export default async function UsersPage() {
	await requireAdmin()
	const users = await getAllUsers()

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div className="flex items-center gap-4">
				<div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
					<Users className="h-6 w-6 text-primary-foreground" />
				</div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Benutzerverwaltung</h1>
					<p className="text-muted-foreground">Benutzer erstellen und verwalten</p>
				</div>
			</div>
			<UserManagement users={users} />
		</div>
	)
}
