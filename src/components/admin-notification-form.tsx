'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Megaphone, Loader2, CheckCircle, Send, Users, Sparkles } from 'lucide-react'
import { sendBroadcast } from '@/app/actions/notifications'

export function AdminNotificationForm() {
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState(false)
    const [isPending, startTransition] = useTransition()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim() || !message.trim()) return

        startTransition(async () => {
            try {
                await sendBroadcast(title, message)
                setSuccess(true)
                setTitle('')
                setMessage('')
                setTimeout(() => setSuccess(false), 4000)
            } catch (error) {
                console.error('Failed to send broadcast:', error)
            }
        })
    }

    const isValid = title.trim().length > 0 && message.trim().length > 0
    const charCount = message.length

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <Card className="lg:col-span-2 overflow-hidden">
                <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/25">
                            <Megaphone className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle>Neue Nachricht erstellen</CardTitle>
                            <CardDescription>
                                Senden Sie eine Benachrichtigung an alle Benutzer
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium">
                                Titel
                            </Label>
                            <Input
                                id="title"
                                placeholder="z.B. Wichtige Ankündigung, Systemwartung..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isPending}
                                className="h-11"
                                maxLength={100}
                            />
                            <p className="text-xs text-muted-foreground">
                                {title.length}/100 Zeichen
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-sm font-medium">
                                Nachricht
                            </Label>
                            <Textarea
                                id="message"
                                placeholder="Schreiben Sie hier Ihre Nachricht an alle Benutzer..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={isPending}
                                rows={5}
                                className="resize-none"
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground">
                                {charCount}/500 Zeichen
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <Button
                                type="submit"
                                disabled={isPending || !isValid}
                                className={`
                                    min-w-[160px] h-11
                                    transition-all duration-300
                                    ${success
                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                        : 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700'
                                    }
                                `}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Wird gesendet...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Erfolgreich gesendet!
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        An alle senden
                                    </>
                                )}
                            </Button>

                            {!isValid && !isPending && (
                                <p className="text-xs text-muted-foreground">
                                    Bitte füllen Sie alle Felder aus
                                </p>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="h-fit">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Hinweise
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Alle Benutzer</p>
                            <p className="text-xs text-muted-foreground">
                                Die Nachricht wird an alle aktiven Benutzer gesendet
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-purple-500/10">
                            <Megaphone className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Toast-Benachrichtigung</p>
                            <p className="text-xs text-muted-foreground">
                                Benutzer sehen die Nachricht beim nächsten Login
                            </p>
                        </div>
                    </div>

                    <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Verwenden Sie diese Funktion für wichtige Ankündigungen,
                            Systemwartungen oder Team-Updates.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
