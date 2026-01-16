
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserDetailLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div>
                <Skeleton className="h-9 w-24 mb-2" />
                <Skeleton className="h-8 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
            </div>
            <DashboardSkeleton />
        </div>
    )
}
