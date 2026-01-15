'use client'

import { useState } from 'react'
import {
	Building,
	Laptop,
	HeartPulse,
	Home,
	ShoppingCart,
	UtensilsCrossed,
	Landmark,
	GraduationCap,
	MessageSquare,
	Bot,
	Users,
	Share2,
	Globe,
	Mail,
	Briefcase,
	Filter,
	Check,
	X,
	type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Industry, Service } from '@/lib/types'

const iconMap: Record<string, LucideIcon> = {
	'building': Building,
	'hammer': Building,
	'laptop': Laptop,
	'heart-pulse': HeartPulse,
	'home': Home,
	'shopping-cart': ShoppingCart,
	'utensils': UtensilsCrossed,
	'landmark': Landmark,
	'graduation-cap': GraduationCap,
	'message-square': MessageSquare,
	'bot': Bot,
	'users': Users,
	'share-2': Share2,
	'globe': Globe,
	'mail': Mail,
	'briefcase': Briefcase,
}

interface CategorySelectorProps {
	industries: Industry[]
	services: Service[]
	selectedIndustry: string | null
	selectedService: string | null
	onIndustryChange: (id: string | null) => void
	onServiceChange: (id: string | null) => void
}

export function CategorySelector({
	industries,
	services,
	selectedIndustry,
	selectedService,
	onIndustryChange,
	onServiceChange,
}: CategorySelectorProps) {
	const [open, setOpen] = useState(false)
	const [tempIndustry, setTempIndustry] = useState<string | null>(selectedIndustry)
	const [tempService, setTempService] = useState<string | null>(selectedService)

	const selectedIndustryData = industries.find((i) => i.id === selectedIndustry)
	const selectedServiceData = services.find((s) => s.id === selectedService)

	const activeFilters = (selectedIndustry ? 1 : 0) + (selectedService ? 1 : 0)

	function handleOpen(isOpen: boolean) {
		if (isOpen) {
			setTempIndustry(selectedIndustry)
			setTempService(selectedService)
		}
		setOpen(isOpen)
	}

	function handleApply() {
		onIndustryChange(tempIndustry)
		onServiceChange(tempService)
		setOpen(false)
	}

	function handleClear() {
		setTempIndustry(null)
		setTempService(null)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="lg"
					className={cn(
						'h-12 gap-2 rounded-xl border-2 px-4 touch-target',
						activeFilters > 0 && 'border-primary bg-primary/5'
					)}
				>
					<Filter className="h-5 w-5" />
					<span className="hidden sm:inline">
						{activeFilters === 0
							? 'Filter'
							: activeFilters === 1
								? selectedIndustryData?.name || selectedServiceData?.name
								: `${activeFilters} Filter`}
					</span>
					{activeFilters > 0 && (
						<Badge
							variant="default"
							className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
						>
							{activeFilters}
						</Badge>
					)}
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
				<DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-xl">Filter auswählen</DialogTitle>
						{(tempIndustry || tempService) && (
							<Button
								variant="ghost"
								size="sm"
								className="h-8 text-muted-foreground hover:text-foreground"
								onClick={handleClear}
							>
								<X className="mr-1 h-4 w-4" />
								Zurücksetzen
							</Button>
						)}
					</div>
				</DialogHeader>

				<div className="max-h-[60vh] overflow-y-auto">
					{/* Industry Section */}
					<div className="p-6 border-b">
						<div className="flex items-center gap-2 mb-4">
							<Building className="h-5 w-5 text-primary" />
							<h3 className="font-semibold">Branche</h3>
							{tempIndustry && (
								<Badge variant="secondary" className="ml-auto">
									{industries.find((i) => i.id === tempIndustry)?.name}
								</Badge>
							)}
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
							<button
								type="button"
								onClick={() => setTempIndustry(null)}
								className={cn(
									'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
									'hover:border-primary/50 hover:bg-primary/5',
									!tempIndustry
										? 'border-primary bg-primary/10'
										: 'border-transparent bg-muted/50'
								)}
							>
								<div className={cn(
									'flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-lg shrink-0',
									!tempIndustry ? 'bg-primary text-primary-foreground' : 'bg-muted'
								)}>
									<Building className="h-5 w-5 shrink-0" />
								</div>
								<div className="text-left">
									<p className="font-medium text-sm">Alle</p>
									<p className="text-xs text-muted-foreground">Keine Filter</p>
								</div>
								{!tempIndustry && (
									<Check className="ml-auto h-4 w-4 text-primary" />
								)}
							</button>

							{industries.map((industry) => {
								const Icon = iconMap[industry.icon] || Building
								const isSelected = tempIndustry === industry.id
								return (
									<button
										key={industry.id}
										type="button"
										onClick={() => setTempIndustry(industry.id)}
										className={cn(
											'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
											'hover:border-primary/50 hover:bg-primary/5',
											isSelected
												? 'border-primary bg-primary/10'
												: 'border-transparent bg-muted/50'
										)}
									>
							<div className={cn(
									'flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-lg shrink-0',
									isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
								)}>
									<Icon className="h-5 w-5 shrink-0" />
								</div>
								<span className="font-medium text-sm truncate flex-1">{industry.name}</span>
										{isSelected && (
											<Check className="ml-auto h-4 w-4 text-primary shrink-0" />
										)}
									</button>
								)
							})}
						</div>
					</div>

					{/* Service Section */}
					<div className="p-6">
						<div className="flex items-center gap-2 mb-4">
							<Briefcase className="h-5 w-5 text-primary" />
							<h3 className="font-semibold">Service</h3>
							{tempService && (
								<Badge variant="secondary" className="ml-auto">
									{services.find((s) => s.id === tempService)?.name}
								</Badge>
							)}
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
							<button
								type="button"
								onClick={() => setTempService(null)}
								className={cn(
									'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
									'hover:border-primary/50 hover:bg-primary/5',
									!tempService
										? 'border-primary bg-primary/10'
										: 'border-transparent bg-muted/50'
								)}
							>
								<div className={cn(
									'flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-lg shrink-0',
									!tempService ? 'bg-primary text-primary-foreground' : 'bg-muted'
								)}>
									<Briefcase className="h-5 w-5 shrink-0" />
								</div>
								<div className="text-left">
									<p className="font-medium text-sm">Alle</p>
									<p className="text-xs text-muted-foreground">Keine Filter</p>
								</div>
								{!tempService && (
									<Check className="ml-auto h-4 w-4 text-primary" />
								)}
							</button>

							{services.map((service) => {
								const Icon = iconMap[service.icon] || Briefcase
								const isSelected = tempService === service.id
								return (
									<button
										key={service.id}
										type="button"
										onClick={() => setTempService(service.id)}
										className={cn(
											'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
											'hover:border-primary/50 hover:bg-primary/5',
											isSelected
												? 'border-primary bg-primary/10'
												: 'border-transparent bg-muted/50'
										)}
									>
							<div className={cn(
									'flex h-10 w-10 min-h-10 min-w-10 items-center justify-center rounded-lg shrink-0',
									isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
								)}>
									<Icon className="h-5 w-5 shrink-0" />
								</div>
								<span className="font-medium text-sm truncate flex-1">{service.name}</span>
										{isSelected && (
											<Check className="ml-auto h-4 w-4 text-primary shrink-0" />
										)}
									</button>
								)
							})}
						</div>
					</div>
				</div>

				<DialogFooter className="px-6 py-4 border-t bg-muted/30">
					<div className="flex w-full gap-3">
						<Button
							variant="outline"
							className="flex-1 h-12 rounded-xl"
							onClick={() => setOpen(false)}
						>
							Abbrechen
						</Button>
						<Button
							className="flex-1 h-12 rounded-xl"
							onClick={handleApply}
						>
							<Check className="mr-2 h-4 w-4" />
							Anwenden
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
