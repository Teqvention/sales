'use client'

import { useState } from 'react'
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    MessageSquare,
    Bug,
    Eye,
    Circle,
    Clock,
    CheckCircle2,
    FolderOpen,
    ArrowUpRight,
    Plus,
} from 'lucide-react'
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty'
import { FeedbackDialog } from '@/components/feedback-dialog'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Ticket {
    id: string
    type: string
    subject: string
    description: string
    status: string
    createdAt: Date
}

interface MyTicketsTableProps {
    tickets: Ticket[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ElementType }> = {
    OPEN: { label: 'Offen', variant: 'outline', icon: Circle },
    IN_PROGRESS: { label: 'In Bearbeitung', variant: 'secondary', icon: Clock },
    RESOLVED: { label: 'Gelöst', variant: 'default', icon: CheckCircle2 },
    CLOSED: { label: 'Geschlossen', variant: 'secondary', icon: CheckCircle2 },
}

export function MyTicketsTable({ tickets }: MyTicketsTableProps) {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [feedbackOpen, setFeedbackOpen] = useState(false)

    if (tickets.length === 0) {
        return (
            <>
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderOpen />
                        </EmptyMedia>
                        <EmptyTitle>Keine Tickets vorhanden</EmptyTitle>
                        <EmptyDescription>
                            Sie haben noch keine Support-Tickets erstellt. Erstellen Sie jetzt Ihr erstes Ticket.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={() => setFeedbackOpen(true)}>
                            Ticket erstellen
                        </Button>
                    </EmptyContent>
                </Empty>
                <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
            </>
        )
    }

    return (
        <>
            <Card className="border shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base">Tickets ({tickets.length})</CardTitle>
                    <Button size="sm" onClick={() => setFeedbackOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ticket erstellen
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Typ</TableHead>
                                <TableHead>Betreff</TableHead>
                                <TableHead>Erstellt</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.map((ticket) => {
                                const status = statusConfig[ticket.status] || statusConfig.OPEN
                                const StatusIcon = status.icon
                                const TypeIcon = ticket.type === 'bug' ? Bug : MessageSquare
                                return (
                                    <TableRow key={ticket.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                                <Badge variant={ticket.type === 'bug' ? 'destructive' : 'secondary'}>
                                                    {ticket.type === 'bug' ? 'Fehler' : 'Feedback'}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">{ticket.subject}</span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(ticket.createdAt), {
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedTicket(ticket)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>

                    </Table>
                </CardContent>
            </Card >

            <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-2">
                            {selectedTicket?.type === 'bug' ? (
                                <Badge variant="destructive">Fehler</Badge>
                            ) : (
                                <Badge variant="secondary">Feedback</Badge>
                            )}
                            {selectedTicket && (
                                <Badge
                                    variant={statusConfig[selectedTicket.status]?.variant || 'outline'}
                                    className="gap-1"
                                >
                                    {(() => {
                                        const StatusIcon = statusConfig[selectedTicket.status]?.icon || Circle
                                        return <StatusIcon className="h-3 w-3" />
                                    })()}
                                    {statusConfig[selectedTicket.status]?.label || selectedTicket.status}
                                </Badge>
                            )}
                        </div>
                        <DialogTitle>{selectedTicket?.subject}</DialogTitle>
                        <DialogDescription>
                            Erstellt {selectedTicket && formatDistanceToNow(new Date(selectedTicket.createdAt), {
                                addSuffix: true,
                                locale: de,
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Beschreibung</h4>
                        <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm whitespace-pre-wrap">{selectedTicket?.description}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
        </>
    )
}
