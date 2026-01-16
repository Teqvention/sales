
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-9 w-[180px]" />
            </div>
            <DashboardSkeleton />
        </div>
    )
}
