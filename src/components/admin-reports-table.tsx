'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
    MoreHorizontal,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Circle,
    Clock,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateFeedbackStatus, deleteFeedback } from '@/app/actions/feedback'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Feedback {
    id: string
    type: string
    subject: string
    description: string
    status: string
    createdAt: Date
    user: {
        name: string
        email: string
        image: string | null
    } | null
}

interface AdminReportsTableProps {
    reports: Feedback[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: any }> = {
    OPEN: { label: 'Offen', variant: 'outline', icon: Circle },
    IN_PROGRESS: { label: 'In Bearbeitung', variant: 'secondary', icon: Clock },
    RESOLVED: { label: 'Gelöst', variant: 'default', icon: CheckCircle2 },
    CLOSED: { label: 'Geschlossen', variant: 'secondary', icon: CheckCircle2 },
}

export function AdminReportsTable({ reports }: AdminReportsTableProps) {
    const [isPending, startTransition] = useTransition()

    function handleStatusChange(id: string, status: string) {
        startTransition(async () => {
            try {
                await updateFeedbackStatus(id, status)
                const statusLabel = statusConfig[status]?.label || status
                toast.success(`Status geändert`, {
                    description: `Der Status wurde auf "${statusLabel}" aktualisiert.`,
                })
            } catch (error) {
                toast.error('Fehler beim Ändern des Status', {
                    description: 'Bitte versuchen Sie es erneut.',
                })
            }
        })
    }

    function handleDelete(id: string) {
        startTransition(async () => {
            try {
                await deleteFeedback(id)
                toast.success('Bericht gelöscht', {
                    description: 'Der Bericht wurde erfolgreich entfernt.',
                })
            } catch (error) {
                toast.error('Fehler beim Löschen', {
                    description: 'Bitte versuchen Sie es erneut.',
                })
            }
        })
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Benutzer</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Betreff</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => {
                        const status = statusConfig[report.status] || statusConfig.OPEN
                        const StatusIcon = status.icon
                        return (
                            <TableRow key={report.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={report.user?.image || ''} />
                                            <AvatarFallback>
                                                {report.user?.name?.slice(0, 2).toUpperCase() || '??'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{report.user?.name}</span>
                                            <span className="text-xs text-muted-foreground">{report.user?.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={report.type === 'bug' ? 'destructive' : 'secondary'}>
                                        {report.type === 'bug' ? 'Fehler' : 'Feedback'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col max-w-[300px]">
                                        <span className="font-medium truncate">{report.subject}</span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {report.description}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDistanceToNow(new Date(report.createdAt), {
                                        addSuffix: true,
                                        locale: de,
                                    })}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={status.variant} className="gap-1">
                                        <StatusIcon className="h-3 w-3" />
                                        {status.label}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>Status ändern</DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuRadioGroup
                                                        value={report.status}
                                                        onValueChange={(value) => handleStatusChange(report.id, value)}
                                                    >
                                                        {Object.entries(statusConfig).map(([key, config]) => (
                                                            <DropdownMenuRadioItem key={key} value={key}>
                                                                {config.label}
                                                            </DropdownMenuRadioItem>
                                                        ))}
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                onClick={() => handleDelete(report.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Löschen
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
