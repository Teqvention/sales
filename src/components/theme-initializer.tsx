'use client'

import { useEffect } from 'react'

const colorMap: Record<string, string> = {
	blue: '255',
	violet: '270',
	pink: '330',
	red: '0',
	orange: '25',
	yellow: '45',
	green: '145',
	teal: '175',
	cyan: '195',
}

export function ThemeInitializer() {
	useEffect(() => {
		// Initialize theme
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
		const root = document.documentElement

		if (savedTheme === 'dark') {
			root.classList.add('dark')
		} else if (savedTheme === 'system') {
			const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			if (systemDark) root.classList.add('dark')
		}

		// Initialize color
		const savedColor = localStorage.getItem('primaryColor')
		if (savedColor && colorMap[savedColor]) {
			const hsl = colorMap[savedColor]
			root.style.setProperty('--primary', `oklch(0.58 0.22 ${hsl})`)
			root.style.setProperty('--ring', `oklch(0.58 0.22 ${hsl})`)
			root.style.setProperty('--sidebar-primary', `oklch(0.58 0.22 ${hsl})`)
			root.style.setProperty('--sidebar-ring', `oklch(0.58 0.22 ${hsl})`)
		}

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = (e: MediaQueryListEvent) => {
			if (localStorage.getItem('theme') === 'system') {
				root.classList.toggle('dark', e.matches)
			}
		}
		mediaQuery.addEventListener('change', handleChange)

		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [])

	return null
}
