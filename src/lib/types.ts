export type Role = 'ADMIN' | 'EMPLOYEE'

export type LeadStatus = 'OPEN' | 'NO_ANSWER' | 'NO_INTEREST' | 'BOOKED' | 'CONVERTED'

export type CallOutcome = 'NO_ANSWER' | 'NO_INTEREST' | 'BOOKED'

export type AppointmentStatus = 'BOOKED' | 'CONVERTED' | 'CANCELLED'

export interface Industry {
	id: string
	name: string
	icon: string
}

export interface Service {
	id: string
	name: string
	icon: string
}

export interface Lead {
	id: string
	companyName: string
	phone: string
	industryId: string | null
	serviceId: string | null
	status: LeadStatus
	industry?: Industry | null
	service?: Service | null
	createdAt: Date
	updatedAt: Date
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

export interface UserStats {
	totalCalls: number
	callsToday: number
	callsThisWeek: number
	appointmentsBooked: number
	conversions: number
	appointmentRate: number
}

export interface DailyVolume {
	date: string
	calls: number
}

export interface MonthlyVolume {
	month: string
	calls: number
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
