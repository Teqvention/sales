import { Skeleton } from '@/components/ui/skeleton'

export default function SupportLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Header with icon */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-56" />
                    </div>
                </div>
                <Skeleton className="h-5 w-20" />
            </div>

            <div className="rounded-md border">
                <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-4 w-48 flex-1" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-28" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
