import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function AdminNotificationsLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-72" />
                </div>
            </div>

            {/* Form Grid Skeleton */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="border-b">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                        <Skeleton className="h-11 w-40" />
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardHeader>
                        <Skeleton className="h-5 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-1 flex-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-1 flex-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
