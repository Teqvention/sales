
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <Skeleton className="h-4 w-[100px]" />
                            </CardTitle>
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-1" />
                            <Skeleton className="h-3 w-[80px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <div className="flex flex-col gap-6 p-6">
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-9 w-[200px]" />
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}
