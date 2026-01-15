import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { verifySession } from '@/lib/auth'

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const cookieStore = await cookies()
	const sessionToken = cookieStore.get('session')?.value

	if (!sessionToken) {
		redirect('/login')
	}

	const session = await verifySession(sessionToken)

	if (!session) {
		redirect('/login')
	}

	return (
		<SidebarProvider>
			<AppSidebar user={session.user} />
			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
					<SidebarTrigger className="touch-target" />
					<span className="font-semibold">Rufhammer</span>
				</header>
				<main className="flex-1">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
