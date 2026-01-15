import { getAllUsers } from '@/app/actions/users'
import { UserManagement } from '@/components/user-management'
import { requireAdmin } from '@/lib/auth'

export default async function UsersPage() {
	await requireAdmin()
	const users = await getAllUsers()

	return (
		<div className="flex flex-col gap-6 p-4 md:p-6">
			<div>
				<h1 className="text-2xl font-semibold">Benutzerverwaltung</h1>
				<p className="text-muted-foreground">Benutzer erstellen und verwalten</p>
			</div>
			<UserManagement users={users} />
		</div>
	)
}
