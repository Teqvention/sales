'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// ============ FILTER CATEGORIES ============

export async function getFilterCategories() {
    const categories = await db.filterCategory.findMany({
        include: {
            options: {
                orderBy: { sortOrder: 'asc' },
            },
        },
        orderBy: { sortOrder: 'asc' },
    })
    return categories
}

export async function createFilterCategory(name: string, icon: string = 'filter') {
    const maxOrder = await db.filterCategory.aggregate({
        _max: { sortOrder: true },
    })

    const category = await db.filterCategory.create({
        data: {
            name,
            icon,
            sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        },
        include: { options: true },
    })

    revalidatePath('/admin/filters')
    revalidatePath('/admin/import')
    revalidatePath('/admin/leads')
    revalidatePath('/calling')

    return category
}

export async function updateFilterCategory(id: string, name: string, icon: string) {
    const category = await db.filterCategory.update({
        where: { id },
        data: { name, icon },
        include: { options: true },
    })

    revalidatePath('/admin/filters')
    revalidatePath('/admin/import')
    revalidatePath('/admin/leads')
    revalidatePath('/calling')

    return category
}

export async function deleteFilterCategory(id: string) {
    await db.filterCategory.delete({
        where: { id },
    })

    revalidatePath('/admin/filters')
    revalidatePath('/admin/import')
    revalidatePath('/admin/leads')
    revalidatePath('/calling')
}

// ============ FILTER OPTIONS ============

export async function createFilterOption(
    categoryId: string,
    name: string,
    icon: string = 'circle'
) {
    // Check if option with same name already exists in this category
    const existing = await db.filterOption.findFirst({
        where: { categoryId, name },
    })

    if (existing) {
        throw new Error(`Option "${name}" existiert bereits in dieser Kategorie`)
    }

    const maxOrder = await db.filterOption.aggregate({
        where: { categoryId },
        _max: { sortOrder: true },
    })

    const option = await db.filterOption.create({
        data: {
            categoryId,
            name,
            icon,
            sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        },
        include: { category: true },
    })

    revalidatePath('/admin/filters')
    revalidatePath('/admin/import')
    revalidatePath('/admin/leads')
    revalidatePath('/calling')

    return option
}

export async function updateFilterOption(id: string, name: string, icon: string) {
    const option = await db.filterOption.update({
        where: { id },
        data: { name, icon },
        include: { category: true },
    })

    revalidatePath('/admin/filters')
    revalidatePath('/admin/import')
    revalidatePath('/admin/leads')
    revalidatePath('/calling')

    return option
}

export async function deleteFilterOption(id: string) {
    await db.filterOption.delete({
        where: { id },
    })

    revalidatePath('/admin/filters')
    revalidatePath('/admin/import')
    revalidatePath('/admin/leads')
    revalidatePath('/calling')
}

// ============ LEAD FILTER VALUES ============

export async function setLeadFilters(leadId: string, optionIds: string[]) {
    // Delete existing filter values for this lead
    await db.leadFilterValue.deleteMany({
        where: { leadId },
    })

    // Create new filter values
    if (optionIds.length > 0) {
        await db.leadFilterValue.createMany({
            data: optionIds.map((optionId) => ({
                leadId,
                optionId,
            })),
        })
    }

    revalidatePath('/admin/leads')
    revalidatePath('/calling')
}

export async function getLeadFilters(leadId: string) {
    const filterValues = await db.leadFilterValue.findMany({
        where: { leadId },
        include: {
            option: {
                include: { category: true },
            },
        },
    })
    return filterValues
}
