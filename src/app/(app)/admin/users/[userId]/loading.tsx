import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserDetailLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Header with back button and icon */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <DashboardSkeleton />
        </div>
    )
}
