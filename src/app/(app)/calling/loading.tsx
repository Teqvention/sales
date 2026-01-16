
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function CallingLoading() {
    return (
        <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:min-h-dvh">
            {/* Header with selectors */}
            <div className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:top-0">
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md border bg-card p-8">
                    {/* Industry/Service badges */}
                    <div className="mb-6 flex flex-wrap justify-center gap-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>

                    {/* Phone number - tap to call */}
                    <div className="mb-4 block text-center">
                        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center">
                            <Skeleton className="h-20 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-9 w-48 mx-auto" />
                    </div>

                    {/* Company name */}
                    <Skeleton className="h-7 w-64 mx-auto mb-8" />

                    {/* Action buttons */}
                    <div className="grid gap-3">
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                    </div>
                </Card>
            </div>
        </div>
    )
}
