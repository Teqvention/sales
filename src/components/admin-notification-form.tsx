'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Megaphone, Loader2, CheckCircle } from 'lucide-react'
import { sendBroadcast } from '@/app/actions/notifications'

export function AdminNotificationForm() {
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim() || !message.trim()) return

        setLoading(true)
        setSuccess(false)

        try {
            await sendBroadcast(title, message)
            setSuccess(true)
            setTitle('')
            setMessage('')
            setTimeout(() => setSuccess(false), 3000)
        } catch (error) {
            console.error('Failed to send broadcast:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Neue Nachricht
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titel</Label>
                        <Input
                            id="title"
                            placeholder="Betreff der Nachricht"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Nachricht</Label>
                        <Textarea
                            id="message"
                            placeholder="Ihre Nachricht an alle Benutzer..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                            rows={4}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={loading || !title.trim() || !message.trim()}>
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Wird gesendet...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Gesendet!
                            </>
                        ) : (
                            <>
                                <Megaphone className="h-4 w-4 mr-2" />
                                An alle senden
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
