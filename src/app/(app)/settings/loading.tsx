import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function SettingsLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Header with icon */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-4 w-56" />
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full max-w-2xl space-y-6">
                <Skeleton className="h-12 w-full rounded-xl" />

                {/* Profile Card */}
                <Card className="border shadow-none overflow-hidden">
                    <CardHeader className="border-b">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                        <Skeleton className="h-12 w-32 rounded-xl" />
                    </CardContent>
                </Card>

                {/* Password Card */}
                <Card className="border shadow-none">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-12 w-full rounded-xl" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-28" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                        </div>
                        <Skeleton className="h-12 w-40 rounded-xl" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
