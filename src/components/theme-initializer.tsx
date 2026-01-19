'use client'

import { useEffect } from 'react'

const colorMap: Record<string, string> = {
	blue: 'oklch(0.623 0.214 259.1)',
	violet: 'oklch(0.606 0.25 292.7)',
	pink: 'oklch(0.656 0.241 354.3)',
	red: 'oklch(0.637 0.237 25.3)',
	orange: 'oklch(0.705 0.191 47.6)',
	yellow: 'oklch(0.795 0.184 86.0)',
	green: 'oklch(0.723 0.219 149.6)',
	teal: 'oklch(0.704 0.14 182.5)',
	cyan: 'oklch(0.715 0.143 215.2)',
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
			const oklch = colorMap[savedColor]
			root.style.setProperty('--primary', oklch)
			root.style.setProperty('--ring', oklch)
			root.style.setProperty('--sidebar-primary', oklch)
			root.style.setProperty('--sidebar-ring', oklch)
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
