'use client'

import { useState, useTransition } from 'react'
import { Filter, Check, X, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { IconPicker, getIcon } from '@/components/icon-picker'
import { createFilterOption } from '@/app/actions/filters'
import { cn } from '@/lib/utils'
import type { FilterCategory, FilterOption } from '@/lib/types'

interface DynamicFilterSelectorProps {
	categories: FilterCategory[]
	selectedOptions: Record<string, string> // categoryId -> optionId
	onSelectionChange: (categoryId: string, optionId: string | null) => void
	allowCreate?: boolean
	onCategoriesUpdate?: (categories: FilterCategory[]) => void
}

export function DynamicFilterSelector({
	categories,
	selectedOptions,
	onSelectionChange,
	allowCreate = false,
	onCategoriesUpdate,
}: DynamicFilterSelectorProps) {
	const [open, setOpen] = useState(false)
	const [tempSelections, setTempSelections] = useState<Record<string, string>>(selectedOptions)
	const [creatingForCategory, setCreatingForCategory] = useState<string | null>(null)
	const [newOptionName, setNewOptionName] = useState('')
	const [newOptionIcon, setNewOptionIcon] = useState('circle')
	const [isPending, startTransition] = useTransition()

	const activeFilters = Object.values(selectedOptions).filter(Boolean).length

	function handleOpen(isOpen: boolean) {
		if (isOpen) {
			setTempSelections(selectedOptions)
		}
		setOpen(isOpen)
	}

	function handleApply() {
		Object.entries(tempSelections).forEach(([categoryId, optionId]) => {
			if (selectedOptions[categoryId] !== optionId) {
				onSelectionChange(categoryId, optionId || null)
			}
		})
		// Handle removed selections
		Object.keys(selectedOptions).forEach((categoryId) => {
			if (!(categoryId in tempSelections) || !tempSelections[categoryId]) {
				onSelectionChange(categoryId, null)
			}
		})
		setOpen(false)
	}

	function handleReset() {
		setTempSelections({})
	}

	function selectOption(categoryId: string, optionId: string) {
		setTempSelections((prev) => {
			if (prev[categoryId] === optionId) {
				const next = { ...prev }
				delete next[categoryId]
				return next
			}
			return { ...prev, [categoryId]: optionId }
		})
	}

	function handleCreateOption(categoryId: string) {
		if (!newOptionName.trim()) return

		startTransition(async () => {
			const option = await createFilterOption(categoryId, newOptionName.trim(), newOptionIcon)
			// Update local state
			if (onCategoriesUpdate) {
				const updatedCategories = categories.map((c) =>
					c.id === categoryId ? { ...c, options: [...c.options, option as FilterOption] } : c
				)
				onCategoriesUpdate(updatedCategories)
			}
			// Select the new option
			setTempSelections((prev) => ({ ...prev, [categoryId]: option.id }))
			setNewOptionName('')
			setNewOptionIcon('circle')
			setCreatingForCategory(null)
		})
	}

	// Get display text for selected filters
	const getSelectedText = () => {
		const selected = categories
			.filter((c) => selectedOptions[c.id])
			.map((c) => {
				const option = c.options.find((o) => o.id === selectedOptions[c.id])
				return option?.name
			})
			.filter(Boolean)

		if (selected.length === 0) return 'Filter'
		if (selected.length === 1) return selected[0]
		return `${selected.length} Filter`
	}

	return (
		<Dialog open={open} onOpenChange={handleOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						'touch-target justify-start gap-2 h-12 px-4 rounded-xl border-2 transition-all',
						activeFilters > 0 && 'border-primary bg-primary/5'
					)}
				>
					<Filter className="h-5 w-5" />
					<span className="font-medium">
						{getSelectedText()}
					</span>
					{activeFilters > 0 && (
						<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1.5 text-xs font-medium text-primary-foreground">
							{activeFilters}
						</span>
					)}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle className="text-xl">Filter auswählen</DialogTitle>
						{Object.values(tempSelections).some(Boolean) && (
							<Button variant="ghost" size="sm" onClick={handleReset}>
								Zurücksetzen
							</Button>
						)}
					</div>
				</DialogHeader>

				{categories.length === 0 ? (
					<div className="py-8 text-center text-muted-foreground">
						<p>Keine Filterkategorien vorhanden.</p>
						<p className="text-sm mt-1">Erstellen Sie Kategorien unter Admin → Filter.</p>
					</div>
				) : (
					<div className="space-y-6 py-4">
						{categories.map((category) => {
							const CategoryIcon = getIcon(category.icon)
							const selectedOptionId = tempSelections[category.id]

							return (
								<div key={category.id} className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<CategoryIcon className="h-4 w-4 text-muted-foreground" />
											<h3 className="font-semibold">{category.name}</h3>
										</div>
										{selectedOptionId && (
											<span className="text-xs text-primary font-medium">
												{category.options.find((o) => o.id === selectedOptionId)?.name}
											</span>
										)}
									</div>

									<div className="flex flex-wrap gap-2">
										{/* "Alle" option */}
										<button
											type="button"
											onClick={() => {
												setTempSelections((prev) => {
													const next = { ...prev }
													delete next[category.id]
													return next
												})
											}}
											className={cn(
												'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
												!selectedOptionId ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
											)}
										>
											Alle
										</button>

										{/* Existing options */}
										{category.options.map((option) => {
											const OptionIcon = getIcon(option.icon)
											const isSelected = selectedOptionId === option.id

											return (
												<button
													key={option.id}
													type="button"
													onClick={() => selectOption(category.id, option.id)}
													className={cn(
														'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
														isSelected
															? 'bg-primary text-primary-foreground'
															: 'bg-muted hover:bg-muted/80'
													)}
												>
													<OptionIcon className="h-3.5 w-3.5" />
													{option.name}
												</button>
											)
										})}

										{/* Create new option */}
										{allowCreate && creatingForCategory !== category.id && (
											<button
												type="button"
												onClick={() => {
													setCreatingForCategory(category.id)
													setNewOptionName('')
													setNewOptionIcon('circle')
												}}
												className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-dashed"
											>
												<Plus className="h-3.5 w-3.5" />
												Neu
											</button>
										)}
									</div>

									{/* Create new option form */}
									{allowCreate && creatingForCategory === category.id && (
										<div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
											<IconPicker value={newOptionIcon} onChange={setNewOptionIcon} />
											<Input
												placeholder="Neue Option..."
												value={newOptionName}
												onChange={(e) => setNewOptionName(e.target.value)}
												className="flex-1 h-9"
												onKeyDown={(e) => {
													if (e.key === 'Enter') handleCreateOption(category.id)
													if (e.key === 'Escape') setCreatingForCategory(null)
												}}
												autoFocus
											/>
											<Button
												size="icon"
												className="h-9 w-9"
												onClick={() => handleCreateOption(category.id)}
												disabled={isPending || !newOptionName.trim()}
											>
												{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
											</Button>
											<Button
												size="icon"
												variant="ghost"
												className="h-9 w-9"
												onClick={() => setCreatingForCategory(null)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									)}

									{category.options.length === 0 && creatingForCategory !== category.id && !allowCreate && (
										<p className="text-xs text-muted-foreground">Keine Optionen vorhanden</p>
									)}
								</div>
							)
						})}
					</div>
				)}

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Abbrechen</Button>
					</DialogClose>
					<Button onClick={handleApply}>
						Filter anwenden
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
