import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { getCurrentUser } from '@/lib/auth'
import { Toaster } from 'sonner'
import { NotificationHandler } from '@/components/notification-handler'

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const user = await getCurrentUser()

	if (!user) {
		redirect('/login')
	}

	return (
		<SidebarProvider>
			<AppSidebar user={user} />
			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
					<SidebarTrigger className="touch-target" />
					<span className="font-semibold">Rufhammer</span>
				</header>
				<main className="flex-1">
					{children}
				</main>
			</SidebarInset>
			<NotificationHandler userId={user.id} />
			<Toaster richColors position="top-right" />
		</SidebarProvider>
	)
}
