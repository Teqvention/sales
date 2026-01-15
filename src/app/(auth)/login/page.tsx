'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Phone } from 'lucide-react'
import { signIn } from '@/lib/auth-client'

export default function LoginPage() {
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setIsLoading(true)

		try {
			const result = await signIn.email({
				email,
				password,
			})

			if (result.error) {
				throw new Error(result.error.message || 'Login fehlgeschlagen')
			}

			router.push('/calling')
			router.refresh()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Card className="w-full max-w-sm border">
			<CardHeader className="items-center space-y-4 pb-2">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
					<Phone className="h-8 w-8 text-primary-foreground" />
				</div>
				<div className="text-center">
					<h1 className="text-2xl font-semibold">Rufhammer</h1>
					<p className="text-sm text-muted-foreground">Anmelden um fortzufahren</p>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">E-Mail</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="E-Mail eingeben"
							required
							autoComplete="email"
							className="h-12 touch-target"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Passwort</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Passwort eingeben"
							required
							autoComplete="current-password"
							className="h-12 touch-target"
						/>
					</div>
					{error && (
						<p className="text-sm text-destructive">{error}</p>
					)}
					<Button
						type="submit"
						className="h-12 w-full touch-target text-base font-medium"
						disabled={isLoading}
					>
						{isLoading ? 'Wird angemeldet...' : 'Anmelden'}
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}
