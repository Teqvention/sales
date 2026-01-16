'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
	Phone,
	LayoutDashboard,
	Users,
	Upload,
	List,
	LogOut,
	Shield,
	ChevronsUpDown,
	Settings,
	MessageSquarePlus,
	Ticket,
	Bell,
	Megaphone,
} from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuBadge,
} from '@/components/ui/sidebar'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FeedbackDialog } from '@/components/feedback-dialog'

interface AppSidebarProps {
	user: {
		id: string
		name: string
		email: string
		role: 'ADMIN' | 'EMPLOYEE'
	}
	unreadCount?: number
}

const employeeNav = [
	{ title: 'Anrufen', href: '/calling', icon: Phone },
	{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
	{ title: 'Meine Tickets', href: '/support', icon: Ticket },
]

const adminNav = [
	{ title: 'Admin Dashboard', href: '/admin/dashboard', icon: Shield },
	{ title: 'Benutzer', href: '/admin/users', icon: Users },
	{ title: 'Leads', href: '/admin/leads', icon: List },
	{ title: 'Reportings', href: '/admin/feedback', icon: MessageSquarePlus },
	{ title: 'Nachrichten', href: '/admin/notifications', icon: Megaphone },
	{ title: 'Import', href: '/admin/import', icon: Upload },
]


export function AppSidebar({ user, unreadCount = 0 }: AppSidebarProps) {
	const pathname = usePathname()
	const router = useRouter()
	const [feedbackOpen, setFeedbackOpen] = useState(false)

	async function handleLogout() {
		await signOut()
		window.location.href = '/login'
	}

	function handleSettings() {
		router.push('/settings')
	}

	return (
		<Sidebar>
			<SidebarHeader className="border-b border-sidebar-border px-4 py-3">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
						<Phone className="h-5 w-5 text-primary-foreground" />
					</div>
					<div>
						<h2 className="text-base font-semibold">Rufhammer</h2>
						<p className="text-xs text-muted-foreground">AI Calling</p>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{employeeNav.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={pathname === item.href}
										className="touch-target"
									>
										<Link href={item.href}>
											<item.icon className="h-5 w-5" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
							{/* Notifications with badge */}
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={pathname === '/notifications'}
									className="touch-target"
								>
									<Link href="/notifications">
										<Bell className="h-5 w-5" />
										<span>Benachrichtigungen</span>
									</Link>
								</SidebarMenuButton>
								{unreadCount > 0 && (
									<SidebarMenuBadge className="bg-primary text-primary-foreground">
										{unreadCount > 99 ? '99+' : unreadCount}
									</SidebarMenuBadge>
								)}
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{user.role === 'ADMIN' && (
					<SidebarGroup>
						<SidebarGroupLabel>Administration</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{adminNav.map((item) => (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton
											asChild
											isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
											className="touch-target"
										>
											<Link href={item.href}>
												<item.icon className="h-5 w-5" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>

			<SidebarFooter className="border-t border-sidebar-border p-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2 focus:ring-offset-sidebar"
						>
							<Avatar className="h-9 w-9 shrink-0">
								<AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
									{user.name.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-1 flex-col items-start text-left">
								<span className="text-sm font-medium">{user.name}</span>
								<span className="text-xs text-muted-foreground">
									{user.role === 'ADMIN' ? 'Administrator' : 'Mitarbeiter'}
								</span>
							</div>
							<ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="start"
						side="top"
						className="w-[--radix-dropdown-menu-trigger-width] rounded-xl"
					>
						<DropdownMenuItem
							onClick={handleSettings}
							className="gap-2 rounded-lg"
						>
							<Settings className="h-4 w-4" />
							Einstellungen
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setFeedbackOpen(true)}
							className="gap-2 rounded-lg"
						>
							<MessageSquarePlus className="h-4 w-4" />
							Feedback & Hilfe
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleLogout}
							className="gap-2 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
						>
							<LogOut className="h-4 w-4" />
							Abmelden
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarFooter>
			<FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
		</Sidebar>
	)
}
