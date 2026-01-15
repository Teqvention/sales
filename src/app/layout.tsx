import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeInitializer } from '@/components/theme-initializer'

export const metadata: Metadata = {
	title: 'Rufhammer - AI Calling',
	description: 'Internal calling application for AI automation agency',
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: '#ffffff',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="de" suppressHydrationWarning>
			<body className="min-h-dvh">
				<ThemeInitializer />
				{children}
			</body>
		</html>
	)
}
