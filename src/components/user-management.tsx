'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Shield, User as UserIcon, MoreVertical, Plus, Eye, Key, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createUser, updateUserRole, resetUserPassword, getUserPassword, deleteUser } from '@/app/actions/users'
import type { User, Role } from '@/lib/types'

interface UserManagementProps {
	users: User[]
}

export function UserManagement({ users }: UserManagementProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [createOpen, setCreateOpen] = useState(false)
	const [newName, setNewName] = useState('')
	const [newEmail, setNewEmail] = useState('')
	const [createdUser, setCreatedUser] = useState<{ name: string; email: string; password: string } | null>(null)
	const [copiedId, setCopiedId] = useState<string | null>(null)
	const [passwordModal, setPasswordModal] = useState<{ userId: string; password: string } | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; userName: string } | null>(null)

	function handleCreateUser() {
		if (!newName.trim() || !newEmail.trim()) return

		startTransition(async () => {
			try {
				const user = await createUser(newName.trim(), newEmail.trim())
				setCreatedUser({
					name: user.name,
					email: user.email,
					password: user.plainPassword || '',
				})
				setNewName('')
				setNewEmail('')
				router.refresh()
			} catch (err) {
				alert(err instanceof Error ? err.message : 'Fehler beim Erstellen')
			}
		})
	}

	function handleRoleChange(userId: string, role: Role) {
		startTransition(async () => {
			await updateUserRole(userId, role)
			router.refresh()
		})
	}

	function handleResetPassword(userId: string) {
		startTransition(async () => {
			const newPassword = await resetUserPassword(userId)
			setPasswordModal({ userId, password: newPassword })
		})
	}

	async function handleShowPassword(userId: string) {
		const password = await getUserPassword(userId)
		if (password) {
			setPasswordModal({ userId, password })
		}
	}

	function copyToClipboard(text: string, id: string) {
		navigator.clipboard.writeText(text)
		setCopiedId(id)
		setTimeout(() => setCopiedId(null), 2000)
	}

	function handleDeleteUser(userId: string) {
		startTransition(async () => {
			await deleteUser(userId)
			setDeleteConfirm(null)
			router.refresh()
		})
	}

	return (
		<div className="space-y-6">
			{/* Create user dialog */}
			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogTrigger asChild>
					<Button className="touch-target">
						<Plus className="mr-2 h-4 w-4" />
						Neuer Benutzer
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Neuen Benutzer erstellen</DialogTitle>
					</DialogHeader>
					{createdUser ? (
						<div className="space-y-4 py-4">
							<div className="rounded-xl bg-muted p-4">
								<p className="mb-2 text-sm text-muted-foreground">Zugangsdaten</p>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="font-medium">E-Mail:</span>
										<div className="flex items-center gap-2">
											<code className="rounded bg-background px-2 py-1">
												{createdUser.email}
											</code>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => copyToClipboard(createdUser.email, 'email')}
											>
												{copiedId === 'email' ? (
													<Check className="h-4 w-4 text-success" />
												) : (
													<Copy className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
									<div className="flex items-center justify-between">
										<span className="font-medium">Passwort:</span>
										<div className="flex items-center gap-2">
											<code className="rounded bg-background px-2 py-1">
												{createdUser.password}
											</code>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => copyToClipboard(createdUser.password, 'password')}
											>
												{copiedId === 'password' ? (
													<Check className="h-4 w-4 text-success" />
												) : (
													<Copy className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button
									onClick={() => {
										setCreatedUser(null)
										setCreateOpen(false)
									}}
								>
									Fertig
								</Button>
							</DialogFooter>
						</div>
					) : (
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									placeholder="z.B. Max Mustermann"
									className="h-12"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">E-Mail</Label>
								<Input
									id="email"
									type="email"
									value={newEmail}
									onChange={(e) => setNewEmail(e.target.value)}
									placeholder="z.B. max@beispiel.de"
									className="h-12"
								/>
							</div>
							<p className="text-sm text-muted-foreground">
								Das Passwort wird automatisch generiert.
							</p>
							<DialogFooter>
								<Button
									onClick={handleCreateUser}
									disabled={isPending || !newName.trim() || !newEmail.trim()}
								>
									{isPending ? 'Wird erstellt...' : 'Erstellen'}
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Password display modal */}
			<Dialog open={!!passwordModal} onOpenChange={() => setPasswordModal(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Passwort</DialogTitle>
					</DialogHeader>
					{passwordModal && (
						<div className="space-y-4 py-4">
							<div className="flex items-center justify-between rounded-xl bg-muted p-4">
								<code className="text-lg">{passwordModal.password}</code>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => copyToClipboard(passwordModal.password, 'modal-pw')}
								>
									{copiedId === 'modal-pw' ? (
										<Check className="h-4 w-4 text-success" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
							</div>
							<DialogFooter>
								<Button onClick={() => setPasswordModal(null)}>Schließen</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete confirmation dialog */}
			<Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Benutzer löschen?</DialogTitle>
					</DialogHeader>
					{deleteConfirm && (
						<div className="space-y-4 py-4">
							<p className="text-muted-foreground">
								Möchten Sie den Benutzer <span className="font-medium text-foreground">{deleteConfirm.userName}</span> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
							</p>
							<DialogFooter className="gap-2 sm:gap-0">
								<Button variant="outline" onClick={() => setDeleteConfirm(null)}>
									Abbrechen
								</Button>
								<Button
									variant="destructive"
									onClick={() => handleDeleteUser(deleteConfirm.userId)}
									disabled={isPending}
								>
									{isPending ? 'Wird gelöscht...' : 'Löschen'}
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* User list */}
			<Card className="border shadow-none">
				<CardHeader>
					<CardTitle className="text-base">Alle Benutzer ({users.length})</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12"></TableHead>
								<TableHead>Name</TableHead>
								<TableHead>E-Mail</TableHead>
								<TableHead>Erstellt</TableHead>
								<TableHead>Rolle</TableHead>
								<TableHead className="w-12"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell>
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
											{user.role === 'ADMIN' ? (
												<Shield className="h-4 w-4 text-primary" />
											) : (
												<UserIcon className="h-4 w-4 text-muted-foreground" />
											)}
										</div>
									</TableCell>
									<TableCell className="font-medium">{user.name}</TableCell>
									<TableCell className="text-muted-foreground">{user.email}</TableCell>
									<TableCell className="text-muted-foreground">
										{new Date(user.createdAt).toLocaleDateString('de-DE')}
									</TableCell>
									<TableCell>
										<Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
											{user.role === 'ADMIN' ? 'Admin' : 'Mitarbeiter'}
										</Badge>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => handleShowPassword(user.id)}>
													<Eye className="mr-2 h-4 w-4" />
													Passwort anzeigen
												</DropdownMenuItem>
												<DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
													<Key className="mr-2 h-4 w-4" />
													Passwort zurücksetzen
												</DropdownMenuItem>
												{user.role === 'EMPLOYEE' ? (
													<DropdownMenuItem
														onClick={() => handleRoleChange(user.id, 'ADMIN')}
													>
														<Shield className="mr-2 h-4 w-4" />
														Zum Admin befördern
													</DropdownMenuItem>
												) : (
													<DropdownMenuItem
														onClick={() => handleRoleChange(user.id, 'EMPLOYEE')}
													>
														<UserIcon className="mr-2 h-4 w-4" />
														Zum Mitarbeiter herabstufen
													</DropdownMenuItem>
												)}
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => setDeleteConfirm({ userId: user.id, userName: user.name })}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Benutzer löschen
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
