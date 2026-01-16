'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth-client'

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
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
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2">
                <a href="#" className="flex items-center gap-3 font-medium">
                    <div className="flex items-center justify-center rounded-md">
                        <img src="/Logo.png" alt="Rufhammer Logo" className="h-10 w-auto" />
                    </div>
                    <span className="text-3xl text-foreground flex items-center gap-0.5">
                        <span className="font-bold">Ruf</span>
                        <span className="font-normal">hammer</span>
                    </span>
                </a>
            </div>
            <Card className="overflow-hidden p-0 shadow-none border">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                <p className="text-muted-foreground text-balance">
                                    Login to your account
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-destructive font-medium text-center">{error}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>

                        </div>
                    </form>
                    <div className="bg-muted relative hidden md:block">
                        <img
                            src="/login-image.png"
                            alt="Login visual"
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-center text-sm text-muted-foreground">
                Internal Platform • Authorized Access Only
            </div>
        </div>
    )
}
