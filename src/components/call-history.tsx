'use client'

import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Phone, PhoneOff, ThumbsDown, Calendar, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { Call, Lead } from '@/lib/types'

interface CallHistoryListProps {
    calls: (Call & { lead: Pick<Lead, 'companyName' | 'phone'> })[]
}

const outcomeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Phone }> = {
    NO_ANSWER: { label: 'Nicht erreicht', variant: 'outline', icon: PhoneOff },
    NO_INTEREST: { label: 'Kein Interesse', variant: 'destructive', icon: ThumbsDown },
    BOOKED: { label: 'Termin vereinbart', variant: 'default', icon: Calendar },
    SCHEDULED: { label: 'Rückruf geplant', variant: 'secondary', icon: Calendar },
}

export function CallHistoryList({ calls }: CallHistoryListProps) {
    return (
        <Card className="border shadow-none">
            <CardHeader>
                <CardTitle className="text-base">Letzte Anrufe ({calls.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {calls.length === 0 ? (
                    <p className="py-12 text-center text-muted-foreground">
                        Noch keine Anrufe getätigt.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Zeitpunkt</TableHead>
                                <TableHead>Firma</TableHead>
                                <TableHead>Telefon</TableHead>
                                <TableHead>Ergebnis</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {calls.map((call) => {
                                const config = outcomeConfig[call.outcome] || {
                                    label: call.outcome,
                                    variant: 'secondary',
                                    icon: CheckCircle2
                                }
                                const OutcomeIcon = config.icon

                                return (
                                    <TableRow key={call.id}>
                                        <TableCell className="whitespace-nowrap font-normal">
                                            {format(new Date(call.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                                        </TableCell>
                                        <TableCell className="font-normal">
                                            {call.lead.companyName}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground font-normal">
                                            {call.lead.phone}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={config.variant} className="gap-1 font-normal">
                                                <OutcomeIcon className="h-3 w-3" />
                                                {config.label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
