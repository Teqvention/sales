'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    UserCog,
    TrendingUp,
    Info,
    Megaphone,
    CheckCheck,
    Bell,
    BellOff,
    Sparkles,
    Check
} from 'lucide-react'
import { markSingleAsRead, markAllAsRead } from '@/app/actions/notifications'
import type { Notification } from '@prisma/client'

interface NotificationsListProps {
    notifications: Notification[]
}

const categoryConfig: Record<string, {
    icon: React.ElementType
    gradient: string
    bgColor: string
    textColor: string
    label: string
}> = {
    account: {
        icon: UserCog,
        gradient: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-600 dark:text-blue-400',
        label: 'Konto',
    },
    lead: {
        icon: TrendingUp,
        gradient: 'from-emerald-500 to-green-600',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        label: 'Lead',
    },
    system: {
        icon: Info,
        gradient: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-600 dark:text-amber-400',
        label: 'System',
    },
    broadcast: {
        icon: Megaphone,
        gradient: 'from-purple-500 to-violet-600',
        bgColor: 'bg-purple-500/10',
        textColor: 'text-purple-600 dark:text-purple-400',
        label: 'Nachricht',
    },
}

function formatRelativeTime(date: Date) {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Gerade eben'
    if (minutes < 60) return `vor ${minutes} Min.`
    if (hours < 24) return `vor ${hours} Std.`
    if (days === 1) return 'Gestern'
    if (days < 7) return `vor ${days} Tagen`
    return new Date(date).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'short',
        year: days > 365 ? 'numeric' : undefined
    })
}

export function NotificationsList({ notifications }: NotificationsListProps) {
    const [items, setItems] = useState(notifications)
    const [isPending, startTransition] = useTransition()
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const unreadCount = items.filter(n => !n.read).length
    const readCount = items.filter(n => n.read).length

    async function handleMarkAsRead(id: string) {
        setLoadingId(id)
        startTransition(async () => {
            try {
                await markSingleAsRead(id)
                setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
            } catch (error) {
                console.error('Failed to mark as read:', error)
            } finally {
                setLoadingId(null)
            }
        })
    }

    async function handleMarkAllAsRead() {
        setLoadingId('all')
        startTransition(async () => {
            try {
                await markAllAsRead()
                setItems(prev => prev.map(n => ({ ...n, read: true })))
            } catch (error) {
                console.error('Failed to mark all as read:', error)
            } finally {
                setLoadingId(null)
            }
        })
    }

    // Empty state
    if (items.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50">
                        <BellOff className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Keine Benachrichtigungen</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        Sie haben aktuell keine Benachrichtigungen. Neue Nachrichten werden hier angezeigt.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Stats & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {unreadCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                {unreadCount} ungelesen
                            </span>
                        </div>
                    )}
                    {readCount > 0 && unreadCount === 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                            <Check className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Alles gelesen
                            </span>
                        </div>
                    )}
                </div>

                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={loadingId === 'all' || isPending}
                        className="gap-2"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Alle als gelesen
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <div className="space-y-3">
                    {items.map((notification, index) => {
                        const config = categoryConfig[notification.category] || categoryConfig.system
                        const Icon = config.icon
                        const isLoading = loadingId === notification.id

                        return (
                            <div
                                key={notification.id}
                                className={`
                                    group relative overflow-hidden rounded-xl border bg-card p-4
                                    transition-all duration-300 ease-out
                                    hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5
                                    ${!notification.read
                                        ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent'
                                        : 'border-border hover:border-border/80'
                                    }
                                `}
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                }}
                            >
                                {/* Unread indicator */}
                                {!notification.read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-l-xl" />
                                )}

                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`
                                        flex-shrink-0 p-2.5 rounded-xl
                                        bg-gradient-to-br ${config.gradient}
                                        shadow-lg shadow-${config.gradient.split(' ')[0].replace('from-', '')}/25
                                    `}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <h4 className={`font-medium leading-tight ${!notification.read ? 'text-foreground' : 'text-foreground/80'}`}>
                                                    {notification.title}
                                                </h4>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`${config.bgColor} ${config.textColor} border-0 text-xs font-medium`}
                                                    >
                                                        {config.label}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatRelativeTime(notification.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mark as read button */}
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    disabled={isLoading || isPending}
                                                    className={`
                                                        shrink-0 h-8 px-3 text-xs
                                                        opacity-0 group-hover:opacity-100
                                                        transition-opacity duration-200
                                                        ${isLoading ? 'opacity-100' : ''}
                                                    `}
                                                >
                                                    {isLoading ? (
                                                        <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Check className="h-3 w-3 mr-1" />
                                                            Gelesen
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>

                                        <p className={`mt-2 text-sm leading-relaxed ${!notification.read ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                {items.length} Benachrichtigung{items.length !== 1 ? 'en' : ''} insgesamt
            </div>
        </div>
    )
}
