import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeadsLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Header with icon */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-36" />
                    <Skeleton className="h-4 w-52" />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-12 w-full rounded-md" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
