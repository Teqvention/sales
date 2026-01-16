import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function NotificationsLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72 mt-2" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
