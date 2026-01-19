'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { IconPicker, getIcon } from '@/components/icon-picker'
import {
    createFilterCategory,
    updateFilterCategory,
    deleteFilterCategory,
    createFilterOption,
    updateFilterOption,
    deleteFilterOption,
} from '@/app/actions/filters'
import type { FilterCategory } from '@/lib/types'

interface FilterManagerProps {
    categories: FilterCategory[]
}

export function FilterManager({ categories: initialCategories }: FilterManagerProps) {
    const [categories, setCategories] = useState(initialCategories)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
    const [isPending, startTransition] = useTransition()

    // Category creation state
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryIcon, setNewCategoryIcon] = useState('filter')
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

    // Category edit state
    const [editingCategory, setEditingCategory] = useState<FilterCategory | null>(null)
    const [editCategoryName, setEditCategoryName] = useState('')
    const [editCategoryIcon, setEditCategoryIcon] = useState('')

    // Option creation state
    const [newOptionCategoryId, setNewOptionCategoryId] = useState<string | null>(null)
    const [newOptionName, setNewOptionName] = useState('')
    const [newOptionIcon, setNewOptionIcon] = useState('circle')

    // Option edit state
    const [editingOption, setEditingOption] = useState<{ id: string; name: string; icon: string } | null>(null)

    const [error, setError] = useState<string | null>(null)

    function toggleCategory(id: string) {
        setExpandedCategories((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    function handleCreateCategory() {
        if (!newCategoryName.trim()) return

        setError(null)
        startTransition(async () => {
            try {
                const category = await createFilterCategory(newCategoryName.trim(), newCategoryIcon)
                setCategories((prev) => [...prev, category])
                setNewCategoryName('')
                setNewCategoryIcon('filter')
                setCategoryDialogOpen(false)
                setExpandedCategories((prev) => new Set([...prev, category.id]))
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten')
            }
        })
    }

    function handleUpdateCategory() {
        if (!editingCategory || !editCategoryName.trim()) return

        startTransition(async () => {
            try {
                const updated = await updateFilterCategory(editingCategory.id, editCategoryName.trim(), editCategoryIcon)
                setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
                setEditingCategory(null)
            } catch (e) {
                // For dialogs, you might want to show error inside the dialog or use a toast
                // Here we just set global error which might not be visible if dialog is open.
                // But for categories, updates usually don't fail due to duplicates unless we add unique constraint on category name too.
                console.error(e)
            }
        })
    }

    function handleDeleteCategory(id: string) {
        startTransition(async () => {
            try {
                await deleteFilterCategory(id)
                setCategories((prev) => prev.filter((c) => c.id !== id))
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten')
            }
        })
    }

    function handleCreateOption(categoryId: string) {
        if (!newOptionName.trim()) return

        setError(null)
        startTransition(async () => {
            try {
                const option = await createFilterOption(categoryId, newOptionName.trim(), newOptionIcon)
                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === categoryId ? { ...c, options: [...c.options, option] } : c
                    )
                )
                setNewOptionName('')
                setNewOptionIcon('circle')
                setNewOptionCategoryId(null)
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten')
            }
        })
    }

    function handleUpdateOption() {
        if (!editingOption || !editingOption.name.trim()) return

        setError(null)
        startTransition(async () => {
            try {
                const updated = await updateFilterOption(editingOption.id, editingOption.name.trim(), editingOption.icon)
                setCategories((prev) =>
                    prev.map((c) => ({
                        ...c,
                        options: c.options.map((o) => (o.id === updated.id ? updated : o)),
                    }))
                )
                setEditingOption(null)
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten')
            }
        })
    }

    function handleDeleteOption(optionId: string, categoryId: string) {
        startTransition(async () => {
            try {
                await deleteFilterOption(optionId)
                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === categoryId ? { ...c, options: c.options.filter((o) => o.id !== optionId) } : c
                    )
                )
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten')
            }
        })
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}
            {/* Create Category Button */}
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Neue Filterkategorie
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Neue Filterkategorie erstellen</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex gap-3">
                            <IconPicker value={newCategoryIcon} onChange={setNewCategoryIcon} />
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="categoryName">Name</Label>
                                <Input
                                    id="categoryName"
                                    placeholder="z.B. Bereich, Ort, Region..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Abbrechen</Button>
                        </DialogClose>
                        <Button onClick={handleCreateCategory} disabled={isPending || !newCategoryName.trim()}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Erstellen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Categories List */}
            {categories.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            Keine Filterkategorien vorhanden. Erstellen Sie eine neue Kategorie, um zu beginnen.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {categories.map((category) => {
                        const CategoryIcon = getIcon(category.icon)
                        const isExpanded = expandedCategories.has(category.id)

                        return (
                            <Card key={category.id}>
                                <CardHeader className="py-4">
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => toggleCategory(category.id)}
                                            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <CategoryIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <CardTitle className="text-base">{category.name}</CardTitle>
                                                <p className="text-xs text-muted-foreground">
                                                    {category.options.length} {category.options.length === 1 ? 'Option' : 'Optionen'}
                                                </p>
                                            </div>
                                        </button>
                                        <div className="flex items-center gap-2">
                                            {/* Edit Category */}
                                            <Dialog
                                                open={editingCategory?.id === category.id}
                                                onOpenChange={(open) => {
                                                    if (open) {
                                                        setEditingCategory(category)
                                                        setEditCategoryName(category.name)
                                                        setEditCategoryIcon(category.icon)
                                                    } else {
                                                        setEditingCategory(null)
                                                    }
                                                }}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Kategorie bearbeiten</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="flex gap-3">
                                                            <IconPicker value={editCategoryIcon} onChange={setEditCategoryIcon} />
                                                            <div className="flex-1 space-y-2">
                                                                <Label>Name</Label>
                                                                <Input
                                                                    value={editCategoryName}
                                                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">Abbrechen</Button>
                                                        </DialogClose>
                                                        <Button onClick={handleUpdateCategory} disabled={isPending}>
                                                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Speichern
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                            {/* Delete Category */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Kategorie löschen?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Dies löscht die Kategorie &quot;{category.name}&quot; und alle zugehörigen Optionen.
                                                            Leads verlieren ihre Filterzuweisungen für diese Kategorie.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteCategory(category.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Löschen
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="pt-0 pb-4">
                                        <div className="border-t pt-4 space-y-3">
                                            {/* Options List */}
                                            {category.options.map((option) => {
                                                const OptionIcon = getIcon(option.icon)
                                                const isEditing = editingOption?.id === option.id

                                                return (
                                                    <div
                                                        key={option.id}
                                                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                                    >
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <IconPicker
                                                                    value={editingOption.icon}
                                                                    onChange={(icon) => setEditingOption({ ...editingOption, icon })}
                                                                />
                                                                <Input
                                                                    value={editingOption.name}
                                                                    onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
                                                                    className="h-9"
                                                                />
                                                                <Button size="icon" className="h-9 w-9" onClick={handleUpdateOption} disabled={isPending}>
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditingOption(null)}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center gap-3">
                                                                    <OptionIcon className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="text-sm">{option.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() => setEditingOption({ id: option.id, name: option.name, icon: option.icon })}
                                                                    >
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <AlertDialog>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                        <AlertDialogContent>
                                                                            <AlertDialogHeader>
                                                                                <AlertDialogTitle>Option löschen?</AlertDialogTitle>
                                                                                <AlertDialogDescription>
                                                                                    Dies löscht &quot;{option.name}&quot;. Leads mit dieser Option verlieren die Zuweisung.
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    onClick={() => handleDeleteOption(option.id, category.id)}
                                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                >
                                                                                    Löschen
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}

                                            {/* Add Option Form */}
                                            {newOptionCategoryId === category.id ? (
                                                <div className="flex items-center gap-2 pt-2">
                                                    <IconPicker value={newOptionIcon} onChange={setNewOptionIcon} />
                                                    <Input
                                                        placeholder="Neue Option..."
                                                        value={newOptionName}
                                                        onChange={(e) => setNewOptionName(e.target.value)}
                                                        className="flex-1"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleCreateOption(category.id)
                                                            if (e.key === 'Escape') setNewOptionCategoryId(null)
                                                        }}
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="icon"
                                                        onClick={() => handleCreateOption(category.id)}
                                                        disabled={isPending || !newOptionName.trim()}
                                                    >
                                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={() => setNewOptionCategoryId(null)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        setNewOptionCategoryId(category.id)
                                                        setNewOptionName('')
                                                        setNewOptionIcon('circle')
                                                    }}
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Option hinzufügen
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
