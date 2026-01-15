export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
			{children}
		</div>
	)
}
