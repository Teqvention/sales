'use client'

import * as React from 'react'
import {
    MessageSquare,
    Bug,
    Send,
    CheckCircle2,
    Loader2,
    Smile,
    AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { createFeedback } from '@/app/actions/feedback'
import { useRouter } from 'next/navigation'

interface FeedbackDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type FeedbackType = 'feedback' | 'bug'

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
    const router = useRouter()
    const [type, setType] = React.useState<FeedbackType>('feedback')
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)

    // Reset state when opening
    React.useEffect(() => {
        if (open) {
            setIsSuccess(false)
            setIsSubmitting(false)
            setType('feedback')
        }
    }, [open])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const subject = formData.get('subject') as string
        const description = formData.get('description') as string

        try {
            await createFeedback({
                type,
                subject,
                description,
            })
            setIsSuccess(true)
            router.refresh()

            // Auto close after success
            setTimeout(() => {
                onOpenChange(false)
            }, 2000)
        } catch (error) {
            console.error('Failed to submit feedback:', error)
            // Optionally show error state
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] overflow-hidden">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-50 duration-500">
                        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Vielen Dank!</h3>
                        <p className="text-muted-foreground max-w-[300px]">
                            Wir haben Ihre Nachricht erhalten und werden uns darum kümmern.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Feedback & Support</DialogTitle>
                            <DialogDescription>
                                Wir schätzen Ihr Feedback! Helfen Sie uns, Rufhammer noch besser zu machen.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <Tabs
                                defaultValue="feedback"
                                value={type}
                                onValueChange={(v) => setType(v as FeedbackType)}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="feedback" className="gap-2">
                                        <Smile className="h-4 w-4" />
                                        Feedback geben
                                    </TabsTrigger>
                                    <TabsTrigger value="bug" className="gap-2">
                                        <Bug className="h-4 w-4" />
                                        Fehler melden
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Betreff</Label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        placeholder={
                                            type === 'feedback'
                                                ? 'z.B. Vorschlag für neue Funktion...'
                                                : 'z.B. Fehler beim Laden der Leads...'
                                        }
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Beschreibung</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder={
                                            type === 'feedback'
                                                ? 'Was gefällt Ihnen, oder was könnten wir verbessern?'
                                                : 'Bitte beschreiben Sie, was passiert ist und wie wir es reproduzieren können.'
                                        }
                                        className="min-h-[120px] resize-none"
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                >
                                    Abbrechen
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="gap-2 min-w-[120px]">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Senden...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Absenden
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
