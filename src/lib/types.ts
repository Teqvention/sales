export type Role = 'ADMIN' | 'EMPLOYEE'

export type LeadStatus = 'OPEN' | 'NO_ANSWER' | 'NO_INTEREST' | 'BOOKED' | 'CONVERTED' | 'CALLBACK'

export type CallOutcome = 'NO_ANSWER' | 'NO_INTEREST' | 'BOOKED' | 'SCHEDULED'

export type AppointmentStatus = 'BOOKED' | 'CONVERTED' | 'CANCELLED'

// Dynamic Filter System
export interface FilterCategory {
	id: string
	name: string
	icon: string
	sortOrder: number
	options: FilterOption[]
	createdAt: Date
	updatedAt: Date
}

export interface FilterOption {
	id: string
	categoryId: string
	name: string
	icon: string
	sortOrder: number
	createdAt: Date
	category?: FilterCategory
}

export interface LeadFilterValue {
	id: string
	leadId: string
	optionId: string
	option: FilterOption & { category: FilterCategory }
}

export interface Call {
	id: string
	leadId: string
	userId: string
	outcome: string
	createdAt: Date
}

export interface Lead {
	id: string
	companyName: string
	phone: string
	status: LeadStatus
	filterValues: LeadFilterValue[]
	createdAt: Date
	updatedAt: Date
	nextCallAt?: Date | null
	nextCallNotes?: string | null
	assignedUserId?: string | null
}

export interface User {
	id: string
	name: string
	email: string
	role: Role
	createdAt: Date
}

export interface UserWithPassword extends User {
	plainPassword?: string
}

export type Trend = 'up' | 'down' | null

export interface UserStats {
	totalCalls: number
	callsToday: number
	callsThisWeek: number
	appointmentsBooked: number
	conversions: number
	appointmentRate: number
	trends?: {
		callsToday?: Trend
		callsThisWeek?: Trend
		appointmentsBooked?: Trend
		conversions?: Trend
		appointmentRate?: Trend
	}
}

export interface DailyVolume {
	date: string
	calls: number
	conversions: number
	bookings: number
}

export interface MonthlyVolume {
	month: string
	calls: number
	conversions: number
	bookings: number
}

export interface EmployeeRanking {
	id: string
	name: string
	totalCalls: number
	appointments: number
	conversions: number
	appointmentRate: number
}

export interface LeadOverview {
	open: number
	noAnswer: number
	noInterest: number
	booked: number
	converted: number
}
