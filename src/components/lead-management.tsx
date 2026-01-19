'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
	Phone,
	Check,
	X,
	PhoneOff,
	Calendar,
	Award,
	MoreVertical,
	Edit,
	Trash2,
	RotateCcw,
	ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DynamicFilterSelector } from '@/components/category-selector'
import { getIcon } from '@/components/icon-picker'
import { markAsConverted, unconvertLead, updateLead, deleteLead } from '@/app/actions/leads'
import type { Lead, FilterCategory, LeadStatus } from '@/lib/types'

interface LeadManagementProps {
	initialLeads: Lead[]
	categories: FilterCategory[]
}

const statusConfig: Record<LeadStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Phone }> = {
	OPEN: { label: 'Offen', variant: 'secondary', icon: Phone },
	NO_ANSWER: { label: 'Nicht erreicht', variant: 'outline', icon: PhoneOff },
	NO_INTEREST: { label: 'Kein Interesse', variant: 'destructive', icon: X },
	BOOKED: { label: 'Gebucht', variant: 'default', icon: Calendar },
	CONVERTED: { label: 'Converted', variant: 'default', icon: Award },
}

export function LeadManagement({
	initialLeads,
	categories,
}: LeadManagementProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
	const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null)
	const [editingLead, setEditingLead] = useState<Lead | null>(null)
	const [editingOptions, setEditingOptions] = useState<Record<string, string>>({})
	const [deleteLeadId, setDeleteLeadId] = useState<string | null>(null)

	// Status priority for sorting: CONVERTED > BOOKED > OPEN > NO_ANSWER > NO_INTEREST
	const statusOrder: Record<string, number> = {
		CONVERTED: 0,
		BOOKED: 1,
		OPEN: 2,
		NO_ANSWER: 3,
		NO_INTEREST: 4,
	}

	const filteredLeads = initialLeads
		.filter((lead) => {
			// Status filter
			if (selectedStatus && lead.status !== selectedStatus) return false

			// Dynamic filter options
			for (const [categoryId, optionId] of Object.entries(selectedOptions)) {
				if (!optionId) continue
				const hasOption = lead.filterValues.some(
					(fv) => fv.option.categoryId === categoryId && fv.optionId === optionId
				)
				if (!hasOption) return false
			}
			return true
		})
		.sort((a, b) => (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5))

	function handleSelectionChange(categoryId: string, optionId: string | null) {
		setSelectedOptions((prev) => {
			if (optionId === null) {
				const next = { ...prev }
				delete next[categoryId]
				return next
			}
			return { ...prev, [categoryId]: optionId }
		})
	}

	function handleMarkConverted(leadId: string) {
		startTransition(async () => {
			await markAsConverted(leadId)
			router.refresh()
		})
	}

	function handleUnconvert(leadId: string) {
		startTransition(async () => {
			await unconvertLead(leadId)
			router.refresh()
		})
	}

	function handleDelete(leadId: string) {
		startTransition(async () => {
			await deleteLead(leadId)
			setDeleteLeadId(null)
			router.refresh()
		})
	}

	function handleEdit(lead: Lead) {
		setEditingLead(lead)
		// Build initial options from lead filter values
		const options: Record<string, string> = {}
		lead.filterValues.forEach((fv) => {
			options[fv.option.category.id] = fv.optionId
		})
		setEditingOptions(options)
	}

	function handleEditOptionChange(categoryId: string, optionId: string | null) {
		setEditingOptions((prev) => {
			if (optionId === null) {
				const next = { ...prev }
				delete next[categoryId]
				return next
			}
			return { ...prev, [categoryId]: optionId }
		})
	}

	function handleSaveEdit() {
		if (!editingLead) return

		const optionIds = Object.values(editingOptions).filter(Boolean)

		startTransition(async () => {
			await updateLead(
				editingLead.id,
				{
					companyName: editingLead.companyName,
					phone: editingLead.phone,
					status: editingLead.status as LeadStatus,
				},
				optionIds
			)
			setEditingLead(null)
			router.refresh()
		})
	}

	// Get filter badges for a lead
	function getLeadFilterBadges(lead: Lead) {
		return lead.filterValues.map((fv) => {
			const Icon = getIcon(fv.option.icon)
			return (
				<Badge key={fv.id} variant="outline" className="gap-1 text-xs">
					<Icon className="h-3 w-3" />
					{fv.option.name}
				</Badge>
			)
		})
	}

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<DynamicFilterSelector
					categories={categories}
					selectedOptions={selectedOptions}
					onSelectionChange={handleSelectionChange}
				/>

				<div className="flex gap-2">
					{(Object.entries(statusConfig) as [LeadStatus, typeof statusConfig.OPEN][]).map(
						([status, config]) => (
							<Button
								key={status}
								variant={selectedStatus === status ? 'default' : 'outline'}
								size="sm"
								className="h-10 rounded-xl"
								onClick={() =>
									setSelectedStatus(selectedStatus === status ? null : status)
								}
							>
								{config.label}
							</Button>
						)
					)}
				</div>
			</div>

			{/* Edit Dialog */}
			<Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Lead bearbeiten</DialogTitle>
					</DialogHeader>
					{editingLead && (
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="companyName">Firmenname</Label>
								<Input
									id="companyName"
									value={editingLead.companyName}
									onChange={(e) =>
										setEditingLead({ ...editingLead, companyName: e.target.value })
									}
									className="h-12"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phone">Telefon</Label>
								<Input
									id="phone"
									value={editingLead.phone}
									onChange={(e) =>
										setEditingLead({ ...editingLead, phone: e.target.value })
									}
									className="h-12"
								/>
							</div>
							<div className="space-y-2">
								<Label>Filter</Label>
								<DynamicFilterSelector
									categories={categories}
									selectedOptions={editingOptions}
									onSelectionChange={handleEditOptionChange}
								/>
							</div>
							<div className="space-y-2">
								<Label>Status</Label>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="h-12 w-full justify-between"
										>
											<span>
												{statusConfig[editingLead.status as LeadStatus]?.label || editingLead.status}
											</span>
											<ChevronDown className="h-4 w-4 opacity-50" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
										<DropdownMenuRadioGroup
											value={editingLead.status}
											onValueChange={(value) =>
												setEditingLead({
													...editingLead,
													status: value as LeadStatus,
												})
											}
										>
											{(Object.entries(statusConfig) as [LeadStatus, typeof statusConfig.OPEN][]).map(
												([status, config]) => (
													<DropdownMenuRadioItem key={status} value={status}>
														{config.label}
													</DropdownMenuRadioItem>
												)
											)}
										</DropdownMenuRadioGroup>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setEditingLead(null)}
							disabled={isPending}
						>
							Abbrechen
						</Button>
						<Button onClick={handleSaveEdit} disabled={isPending}>
							{isPending ? 'Wird gespeichert...' : 'Speichern'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deleteLeadId} onOpenChange={(open) => !open && setDeleteLeadId(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Lead löschen</DialogTitle>
					</DialogHeader>
					<p className="py-4 text-sm text-muted-foreground">
						Möchten Sie diesen Lead wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
					</p>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteLeadId(null)}
							disabled={isPending}
						>
							Abbrechen
						</Button>
						<Button
							variant="destructive"
							onClick={() => deleteLeadId && handleDelete(deleteLeadId)}
							disabled={isPending}
						>
							{isPending ? 'Wird gelöscht...' : 'Löschen'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Lead table */}
			<Card className="border shadow-none">
				<CardHeader>
					<CardTitle className="text-base">
						Leads ({filteredLeads.length})
					</CardTitle>
				</CardHeader>
				<CardContent className="p-0">
					{filteredLeads.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground">
							Keine Leads gefunden
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Firma</TableHead>
									<TableHead>Telefon</TableHead>
									<TableHead>Filter</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="w-12"></TableHead>
									<TableHead className="w-12"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredLeads.map((lead) => {
									const config = statusConfig[lead.status as LeadStatus]
									const StatusIcon = config.icon
									return (
										<TableRow key={lead.id}>
											<TableCell className="font-medium">{lead.companyName}</TableCell>
											<TableCell className="text-muted-foreground">{lead.phone}</TableCell>
											<TableCell>
												<div className="flex flex-wrap gap-1">
													{getLeadFilterBadges(lead)}
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={config.variant} className="gap-1">
													<StatusIcon className="h-3 w-3" />
													{config.label}
												</Badge>
											</TableCell>
											<TableCell>
												{lead.status === 'BOOKED' && (
													<Button
														size="sm"
														variant="outline"
														className="gap-1 h-8"
														onClick={() => handleMarkConverted(lead.id)}
														disabled={isPending}
													>
														<Check className="h-3 w-3" />
														Convert
													</Button>
												)}
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="h-8 w-8">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => handleEdit(lead)}>
															<Edit className="mr-2 h-4 w-4" />
															Bearbeiten
														</DropdownMenuItem>
														{lead.status === 'CONVERTED' && (
															<DropdownMenuItem onClick={() => handleUnconvert(lead.id)}>
																<RotateCcw className="mr-2 h-4 w-4" />
																Unconvert
															</DropdownMenuItem>
														)}
														<DropdownMenuItem
															onClick={() => setDeleteLeadId(lead.id)}
															className="text-destructive focus:text-destructive focus:bg-destructive/10"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Löschen
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
