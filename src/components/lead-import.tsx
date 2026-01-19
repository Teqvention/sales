'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
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
import { DynamicFilterSelector } from '@/components/category-selector'
import { importLeads } from '@/app/actions/leads'
import type { FilterCategory } from '@/lib/types'
import * as XLSX from 'xlsx'

interface LeadImportProps {
	categories: FilterCategory[]
}

interface ParsedLead {
	companyName: string
	phone: string
}

export function LeadImport({ categories: initialCategories }: LeadImportProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [categories, setCategories] = useState(initialCategories)
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
	const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([])
	const [filename, setFilename] = useState<string>('')
	const [error, setError] = useState<string>('')
	const [successOpen, setSuccessOpen] = useState(false)
	const [importedCount, setImportedCount] = useState(0)

	const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		setError('')
		setFilename(file.name)

		const reader = new FileReader()
		reader.onload = (evt) => {
			try {
				const data = evt.target?.result
				const workbook = XLSX.read(data, { type: 'binary' })
				const sheetName = workbook.SheetNames[0]
				const sheet = workbook.Sheets[sheetName]
				const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

				// Try to find company name and phone columns
				const leads: ParsedLead[] = json
					.map((row) => {
						const companyName =
							(row['Firma'] as string) ||
							(row['Company'] as string) ||
							(row['Unternehmen'] as string) ||
							(row['Name'] as string) ||
							(Object.values(row)[0] as string)

						const phone =
							(row['Telefon'] as string) ||
							(row['Phone'] as string) ||
							(row['Tel'] as string) ||
							(row['Nummer'] as string) ||
							(Object.values(row)[1] as string)

						return {
							companyName: String(companyName || '').trim(),
							phone: String(phone || '').trim(),
						}
					})
					.filter((lead) => lead.companyName && lead.phone)

				if (leads.length === 0) {
					setError('Keine gültigen Leads gefunden. Spalten: Firma/Company, Telefon/Phone')
					return
				}

				setParsedLeads(leads)
			} catch {
				setError('Fehler beim Lesen der Datei')
			}
		}

		reader.readAsBinaryString(file)
	}, [])

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

	function handleImport() {
		if (parsedLeads.length === 0) return

		const optionIds = Object.values(selectedOptions).filter(Boolean)

		startTransition(async () => {
			try {
				const result = await importLeads(
					parsedLeads,
					optionIds,
					filename
				)
				setImportedCount(result.count)
				setSuccessOpen(true)
				setParsedLeads([])
				setFilename('')
				setSelectedOptions({})
				router.refresh()
			} catch {
				setError('Fehler beim Import')
			}
		})
	}

	return (
		<div className="space-y-6">
			{/* Success dialog */}
			<Dialog open={successOpen} onOpenChange={setSuccessOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Check className="h-5 w-5 text-success" />
							Import erfolgreich
						</DialogTitle>
					</DialogHeader>
					<p className="py-4">
						{importedCount} Leads wurden erfolgreich importiert.
					</p>
					<DialogFooter>
						<Button onClick={() => setSuccessOpen(false)}>Schließen</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Upload area */}
			<Card className="border shadow-none">
				<CardHeader>
					<CardTitle className="text-base">Datei hochladen</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-center">
						<label
							htmlFor="file-upload"
							className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/25 transition-colors hover:border-primary/50 hover:bg-muted/50"
						>
							<Upload className="mb-2 h-8 w-8 text-muted-foreground" />
							<p className="text-sm font-medium">CSV oder Excel Datei auswählen</p>
							<p className="text-xs text-muted-foreground">
								Erwartete Spalten: Firma, Telefon
							</p>
							<input
								id="file-upload"
								type="file"
								accept=".csv,.xlsx,.xls"
								className="hidden"
								onChange={handleFileChange}
							/>
						</label>
					</div>

					{error && (
						<div className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
							<AlertCircle className="h-4 w-4" />
							{error}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Preview */}
			{parsedLeads.length > 0 && (
				<Card className="border shadow-none">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-base">
							<FileSpreadsheet className="h-5 w-5" />
							Vorschau ({parsedLeads.length} Leads)
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Filter selection */}
						<div className="space-y-2">
							<Label>Filter zuweisen (optional)</Label>
							<DynamicFilterSelector
								categories={categories}
								selectedOptions={selectedOptions}
								onSelectionChange={handleSelectionChange}
								allowCreate={true}
								onCategoriesUpdate={setCategories}
							/>
						</div>

						{/* Preview table */}
						<div className="rounded-xl border overflow-hidden">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Firma</TableHead>
										<TableHead>Telefon</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{parsedLeads.slice(0, 10).map((lead, i) => (
										<TableRow key={i}>
											<TableCell className="font-medium">{lead.companyName}</TableCell>
											<TableCell className="text-muted-foreground">{lead.phone}</TableCell>
										</TableRow>
									))}
									{parsedLeads.length > 10 && (
										<TableRow>
											<TableCell
												colSpan={2}
												className="text-center text-muted-foreground"
											>
												... und {parsedLeads.length - 10} weitere
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>

						<Button
							className="w-full touch-target"
							onClick={handleImport}
							disabled={isPending}
						>
							{isPending
								? 'Wird importiert...'
								: `${parsedLeads.length} Leads importieren`}
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
