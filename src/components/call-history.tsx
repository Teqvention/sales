'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Phone, PhoneOff, ThumbsDown, Calendar, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    const [searchQuery, setSearchQuery] = useState('')

    const filteredCalls = calls.filter((call) => {
        const query = searchQuery.toLowerCase()
        return (
            call.lead.companyName.toLowerCase().includes(query) ||
            call.lead.phone.toLowerCase().includes(query)
        )
    })

    return (
        <Card className="border shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base">Letzte Anrufe ({filteredCalls.length})</CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-9"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {filteredCalls.length === 0 ? (
                    <p className="py-12 text-center text-muted-foreground">
                        {searchQuery ? 'Keine Anrufe gefunden.' : 'Noch keine Anrufe getätigt.'}
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Zeitpunkt</TableHead>
                                <TableHead>Firma</TableHead>
                                <TableHead>Telefon</TableHead>
                                <TableHead>Ergebnis</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCalls.map((call) => {
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
                                        <TableCell>
                                            {call.outcome === 'SCHEDULED' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                    <a href={`/calling?leadId=${call.leadId}`}>
                                                        <Phone className="h-4 w-4" />
                                                        <span className="sr-only">Anrufen</span>
                                                    </a>
                                                </Button>
                                            )}
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
