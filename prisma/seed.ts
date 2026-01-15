import { PrismaClient } from '@prisma/client'
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

const db = new PrismaClient()
const scryptAsync = promisify(scrypt)

const ALGORITHM = 'aes-256-gcm'

function encryptPassword(password: string): string {
	const key = process.env.ENCRYPTION_KEY || '32-char-secret-key-change-prod!!'
	const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32))
	const iv = randomBytes(16)
	const cipher = require('crypto').createCipheriv(ALGORITHM, keyBuffer, iv)

	let encrypted = cipher.update(password, 'utf8', 'hex')
	encrypted += cipher.final('hex')
	const authTag = cipher.getAuthTag()

	return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

// Hash password using better-auth's default method (scrypt)
async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString('hex')
	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
	return `${salt}:${derivedKey.toString('hex')}`
}

function generateId(): string {
	return randomBytes(16).toString('hex')
}

async function createUser(
	email: string,
	password: string,
	name: string,
	role: string
) {
	const userId = generateId()
	const accountId = generateId()
	const hashedPassword = await hashPassword(password)
	const encryptedPw = encryptPassword(password)

	// Check if user exists
	const existing = await db.user.findUnique({ where: { email } })
	if (existing) {
		console.log(`User ${email} already exists, updating...`)
		// Update existing user
		await db.user.update({
			where: { email },
			data: { name, role, encryptedPw },
		})
		// Update password in account
		const account = await db.account.findFirst({
			where: { userId: existing.id, providerId: 'credential' },
		})
		if (account) {
			await db.account.update({
				where: { id: account.id },
				data: { password: hashedPassword },
			})
		}
		return existing
	}

	// Create user
	const user = await db.user.create({
		data: {
			id: userId,
			email,
			name,
			emailVerified: true,
			role,
			encryptedPw,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	})

	// Create credential account
	await db.account.create({
		data: {
			id: accountId,
			userId,
			accountId: userId,
			providerId: 'credential',
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	})

	return user
}

async function main() {
	console.log('Seeding database...')

	// Create admin user
	await createUser('admin@rufhammer.de', 'admin123', 'Admin', 'ADMIN')
	console.log('Created admin user')

	// Create demo employee
	await createUser('demo@rufhammer.de', 'demo123', 'Demo User', 'EMPLOYEE')
	console.log('Created demo user')

	// Create industries
	const industries = [
		{ name: 'Handwerk', icon: 'hammer' },
		{ name: 'IT & Software', icon: 'laptop' },
		{ name: 'Gesundheit', icon: 'heart-pulse' },
		{ name: 'Immobilien', icon: 'home' },
		{ name: 'Einzelhandel', icon: 'shopping-cart' },
		{ name: 'Gastronomie', icon: 'utensils' },
		{ name: 'Finanzen', icon: 'landmark' },
		{ name: 'Bildung', icon: 'graduation-cap' },
	]

	for (const industry of industries) {
		await db.industry.upsert({
			where: { name: industry.name },
			update: { icon: industry.icon },
			create: industry,
		})
	}
	console.log('Created industries')

	// Create services
	const services = [
		{ name: 'Chatbot', icon: 'message-square' },
		{ name: 'Automatisierung', icon: 'bot' },
		{ name: 'Leadgenerierung', icon: 'users' },
		{ name: 'Social Media', icon: 'share-2' },
		{ name: 'Website', icon: 'globe' },
		{ name: 'E-Mail Marketing', icon: 'mail' },
	]

	for (const service of services) {
		await db.service.upsert({
			where: { name: service.name },
			update: { icon: service.icon },
			create: service,
		})
	}
	console.log('Created services')

	// Create sample leads
	const industryRecords = await db.industry.findMany()
	const serviceRecords = await db.service.findMany()

	// Only create leads if none exist
	const leadCount = await db.lead.count()
	if (leadCount === 0) {
		const sampleLeads = [
			{ companyName: 'Müller Sanitär GmbH', phone: '+49 171 1234567' },
			{ companyName: 'Schmidt Elektro', phone: '+49 172 2345678' },
			{ companyName: 'Weber IT Solutions', phone: '+49 173 3456789' },
			{ companyName: 'Fischer Immobilien', phone: '+49 174 4567890' },
			{ companyName: 'Meyer Gastronomie', phone: '+49 175 5678901' },
			{ companyName: 'Becker Autohaus', phone: '+49 176 6789012' },
			{ companyName: 'Hoffmann Consulting', phone: '+49 177 7890123' },
			{ companyName: 'Koch Architekten', phone: '+49 178 8901234' },
			{ companyName: 'Richter Rechtsanwälte', phone: '+49 179 9012345' },
			{ companyName: 'Klein Steuerberatung', phone: '+49 151 0123456' },
		]

		for (const lead of sampleLeads) {
			const industry = industryRecords[Math.floor(Math.random() * industryRecords.length)]
			const service = serviceRecords[Math.floor(Math.random() * serviceRecords.length)]

			await db.lead.create({
				data: {
					...lead,
					industryId: industry.id,
					serviceId: service.id,
				},
			})
		}
		console.log('Created sample leads')
	}

	console.log('')
	console.log('Seed completed!')
	console.log('Admin login: admin@rufhammer.de / admin123')
	console.log('Demo login: demo@rufhammer.de / demo123')
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await db.$disconnect()
	})
