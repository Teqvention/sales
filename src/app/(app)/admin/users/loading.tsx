import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Header with icon */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-24" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
