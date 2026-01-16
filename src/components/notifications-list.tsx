'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    UserCog,
    TrendingUp,
    Info,
    Megaphone,
    CheckCheck,
    Bell
} from 'lucide-react'
import { markSingleAsRead, markAllAsRead } from '@/app/actions/notifications'
import type { Notification } from '@prisma/client'

interface NotificationsListProps {
    notifications: Notification[]
}

const categoryIcons: Record<string, React.ElementType> = {
    account: UserCog,
    lead: TrendingUp,
    system: Info,
    broadcast: Megaphone,
}

const categoryColors: Record<string, string> = {
    account: 'bg-blue-500/10 text-blue-500',
    lead: 'bg-green-500/10 text-green-500',
    system: 'bg-yellow-500/10 text-yellow-500',
    broadcast: 'bg-purple-500/10 text-purple-500',
}

const categoryLabels: Record<string, string> = {
    account: 'Konto',
    lead: 'Lead',
    system: 'System',
    broadcast: 'Nachricht',
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
    if (days < 7) return `vor ${days} Tagen`
    return new Date(date).toLocaleDateString('de-DE')
}

export function NotificationsList({ notifications }: NotificationsListProps) {
    const [items, setItems] = useState(notifications)
    const [loading, setLoading] = useState<string | null>(null)

    const unreadCount = items.filter(n => !n.read).length

    async function handleMarkAsRead(id: string) {
        setLoading(id)
        try {
            await markSingleAsRead(id)
            setItems(items.map(n => n.id === id ? { ...n, read: true } : n))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        } finally {
            setLoading(null)
        }
    }

    async function handleMarkAllAsRead() {
        setLoading('all')
        try {
            await markAllAsRead()
            setItems(items.map(n => ({ ...n, read: true })))
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        } finally {
            setLoading(null)
        }
    }

    if (items.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                        Keine Benachrichtigungen vorhanden
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {unreadCount > 0 && (
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={loading === 'all'}
                    >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Alle als gelesen markieren
                    </Button>
                </div>
            )}

            <div className="space-y-3">
                {items.map((notification) => {
                    const Icon = categoryIcons[notification.category] || Info
                    const colorClass = categoryColors[notification.category] || categoryColors.system
                    const label = categoryLabels[notification.category] || 'System'

                    return (
                        <Card
                            key={notification.id}
                            className={`transition-colors ${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${colorClass}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-medium">
                                                {notification.title}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {label}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatRelativeTime(notification.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!notification.read && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            disabled={loading === notification.id}
                                        >
                                            Als gelesen
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {notification.message}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
