'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
	User,
	Palette,
	Check,
	Moon,
	Sun,
	Monitor,
	Lock,
	Save,
	Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { updateProfile, changePassword } from '@/app/actions/settings'

interface SettingsContentProps {
	user: {
		id: string
		name: string
		email: string
		role: 'ADMIN' | 'EMPLOYEE'
	}
}

const themes = [
	{ id: 'light', label: 'Hell', icon: Sun },
	{ id: 'dark', label: 'Dunkel', icon: Moon },
	{ id: 'system', label: 'System', icon: Monitor },
] as const

const colors = [
	{ id: 'blue', label: 'Blau', oklch: 'oklch(0.623 0.214 259.1)', tailwind: 'bg-blue-500' },
	{ id: 'violet', label: 'Violett', oklch: 'oklch(0.606 0.25 292.7)', tailwind: 'bg-violet-500' },
	{ id: 'pink', label: 'Pink', oklch: 'oklch(0.656 0.241 354.3)', tailwind: 'bg-pink-500' },
	{ id: 'red', label: 'Rot', oklch: 'oklch(0.637 0.237 25.3)', tailwind: 'bg-red-500' },
	{ id: 'orange', label: 'Orange', oklch: 'oklch(0.705 0.191 47.6)', tailwind: 'bg-orange-500' },
	{ id: 'yellow', label: 'Gelb', oklch: 'oklch(0.795 0.184 86.0)', tailwind: 'bg-yellow-500' },
	{ id: 'green', label: 'Grün', oklch: 'oklch(0.723 0.219 149.6)', tailwind: 'bg-green-500' },
	{ id: 'teal', label: 'Türkis', oklch: 'oklch(0.704 0.14 182.5)', tailwind: 'bg-teal-500' },
	{ id: 'cyan', label: 'Cyan', oklch: 'oklch(0.715 0.143 215.2)', tailwind: 'bg-cyan-500' },
] as const

export function SettingsContent({ user }: SettingsContentProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	// Account state
	const [name, setName] = useState(user.name)
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [accountMessage, setAccountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
	const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

	// Appearance state
	const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
		if (typeof window !== 'undefined') {
			return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'light'
		}
		return 'light'
	})
	const [primaryColor, setPrimaryColor] = useState(() => {
		if (typeof window !== 'undefined') {
			return localStorage.getItem('primaryColor') || 'blue'
		}
		return 'blue'
	})

	function handleThemeChange(newTheme: 'light' | 'dark' | 'system') {
		setTheme(newTheme)
		localStorage.setItem('theme', newTheme)

		const root = document.documentElement
		root.classList.remove('light', 'dark')

		if (newTheme === 'system') {
			const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			root.classList.add(systemDark ? 'dark' : 'light')
		} else {
			root.classList.add(newTheme)
		}
	}

	function handleColorChange(colorId: string) {
		setPrimaryColor(colorId)
		localStorage.setItem('primaryColor', colorId)

		const color = colors.find((c) => c.id === colorId)
		if (color) {
			document.documentElement.style.setProperty('--primary', color.oklch)
			document.documentElement.style.setProperty('--ring', color.oklch)
			document.documentElement.style.setProperty('--sidebar-primary', color.oklch)
			document.documentElement.style.setProperty('--sidebar-ring', color.oklch)
		}
	}

	function handleUpdateProfile() {
		if (!name.trim()) return

		startTransition(async () => {
			try {
				await updateProfile(name.trim())
				setAccountMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert' })
				router.refresh()
			} catch (err) {
				setAccountMessage({
					type: 'error',
					text: err instanceof Error ? err.message : 'Fehler beim Aktualisieren',
				})
			}
		})
	}

	function handleChangePassword() {
		if (!currentPassword || !newPassword) return

		if (newPassword !== confirmPassword) {
			setPasswordMessage({ type: 'error', text: 'Passwörter stimmen nicht überein' })
			return
		}

		if (newPassword.length < 6) {
			setPasswordMessage({ type: 'error', text: 'Passwort muss mindestens 6 Zeichen haben' })
			return
		}

		startTransition(async () => {
			try {
				await changePassword(currentPassword, newPassword)
				setPasswordMessage({ type: 'success', text: 'Passwort erfolgreich geändert' })
				setCurrentPassword('')
				setNewPassword('')
				setConfirmPassword('')
			} catch (err) {
				setPasswordMessage({
					type: 'error',
					text: err instanceof Error ? err.message : 'Fehler beim Ändern des Passworts',
				})
			}
		})
	}

	return (
		<Tabs defaultValue="account" className="w-full max-w-2xl">
			<TabsList className="grid w-full grid-cols-2 h-12 p-1 border bg-muted/50 rounded-xl">
				<TabsTrigger
					value="account"
					className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm h-10 gap-2"
				>
					<User className="h-4 w-4" />
					Konto
				</TabsTrigger>
				<TabsTrigger
					value="appearance"
					className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm h-10 gap-2"
				>
					<Palette className="h-4 w-4" />
					Erscheinungsbild
				</TabsTrigger>
			</TabsList>

			<TabsContent value="account" className="mt-6 space-y-6">
				{/* Profile Card */}
				<Card className="border shadow-none overflow-hidden py-0">
					<CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 border-b py-4">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-semibold">
								{user.name.slice(0, 2).toUpperCase()}
							</div>
							<div>
								<CardTitle className="text-xl">{user.name}</CardTitle>
								<CardDescription>
									{user.email} · {user.role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-12 rounded-xl"
							/>
						</div>
						{accountMessage && (
							<p className={cn(
								'text-sm',
								accountMessage.type === 'success' ? 'text-success' : 'text-destructive'
							)}>
								{accountMessage.text}
							</p>
						)}
						<Button
							className="h-12 rounded-xl gap-2"
							onClick={handleUpdateProfile}
							disabled={isPending || name === user.name}
						>
							{isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Save className="h-4 w-4" />
							)}
							Speichern
						</Button>
					</CardContent>
				</Card>

				{/* Password Card */}
				<Card className="border shadow-none">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted">
								<Lock className="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<CardTitle className="text-base">Passwort ändern</CardTitle>
								<CardDescription>Aktualisiere dein Passwort</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="current-password">Aktuelles Passwort</Label>
							<Input
								id="current-password"
								type="password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								className="h-12 rounded-xl"
							/>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="new-password">Neues Passwort</Label>
								<Input
									id="new-password"
									type="password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className="h-12 rounded-xl"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirm-password">Passwort bestätigen</Label>
								<Input
									id="confirm-password"
									type="password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="h-12 rounded-xl"
								/>
							</div>
						</div>
						{passwordMessage && (
							<p className={cn(
								'text-sm',
								passwordMessage.type === 'success' ? 'text-success' : 'text-destructive'
							)}>
								{passwordMessage.text}
							</p>
						)}
						<Button
							className="h-12 rounded-xl gap-2"
							onClick={handleChangePassword}
							disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
						>
							{isPending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Lock className="h-4 w-4" />
							)}
							Passwort ändern
						</Button>
					</CardContent>
				</Card>
			</TabsContent>

			<TabsContent value="appearance" className="mt-6 space-y-6">
				{/* Theme Card */}
				<Card className="border shadow-none">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted">
								<Sun className="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<CardTitle className="text-base">Design-Modus</CardTitle>
								<CardDescription>Wähle zwischen hell, dunkel oder System</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 gap-3">
							{themes.map((t) => {
								const Icon = t.icon
								const isSelected = theme === t.id
								return (
									<button
										key={t.id}
										type="button"
										onClick={() => handleThemeChange(t.id)}
										className={cn(
											'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
											'hover:border-primary/50 hover:bg-primary/5',
											isSelected
												? 'border-primary bg-primary/10'
												: 'border-transparent bg-muted/50'
										)}
									>
										<div className={cn(
											'flex h-12 w-12 items-center justify-center rounded-xl border',
											isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'
										)}>
											<Icon className="h-6 w-6" />
										</div>
										<span className="text-sm font-medium">{t.label}</span>
										{isSelected && (
											<Check className="h-4 w-4 text-primary" />
										)}
									</button>
								)
							})}
						</div>
					</CardContent>
				</Card>

				{/* Color Card */}
				<Card className="border shadow-none">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted">
								<Palette className="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<CardTitle className="text-base">Akzentfarbe</CardTitle>
								<CardDescription>Wähle deine bevorzugte Farbe</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
							{colors.map((color) => {
								const isSelected = primaryColor === color.id
								return (
									<button
										key={color.id}
										type="button"
										onClick={() => handleColorChange(color.id)}
										className={cn(
											'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
											'hover:bg-muted/50',
											isSelected
												? 'border-foreground/20 bg-muted/50'
												: 'border-transparent'
										)}
									>
										<div
											className={cn(
												'h-10 w-10 rounded-full transition-transform',
												color.tailwind,
												isSelected && 'ring-2 ring-offset-2 ring-foreground/20'
											)}
										/>
										<span className="text-xs font-medium">{color.label}</span>
										{isSelected && (
											<Check className="h-3 w-3 text-foreground/70" />
										)}
									</button>
								)
							})}
						</div>
					</CardContent>
				</Card>

				{/* Preview Card */}
				<Card className="border shadow-none overflow-hidden py-0">
					<CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b py-4">
						<CardTitle className="text-base">Vorschau</CardTitle>
						<CardDescription>So sehen deine Einstellungen aus</CardDescription>
					</CardHeader>
					<CardContent className="p-6">
						<div className="flex flex-wrap gap-3">
							<Button>Primär Button</Button>
							<Button variant="secondary">Sekundär</Button>
							<Button variant="outline">Outline</Button>
							<Button variant="ghost">Ghost</Button>
						</div>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	)
}
