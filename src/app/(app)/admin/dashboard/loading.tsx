
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div>
                <Skeleton className="h-8 w-48 mb-1" />
                <Skeleton className="h-4 w-64" />
            </div>
            <DashboardSkeleton />
        </div>
    )
}
