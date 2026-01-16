
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeadsLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div>
                <Skeleton className="h-8 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
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
