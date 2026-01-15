import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const db = new PrismaClient()

const ALGORITHM = 'aes-256-gcm'

function encryptPassword(password: string): string {
	const key = process.env.ENCRYPTION_KEY || '32-char-secret-key-change-prod!!'
	const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32))
	const iv = crypto.randomBytes(16)
	const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv)

	let encrypted = cipher.update(password, 'utf8', 'hex')
	encrypted += cipher.final('hex')
	const authTag = cipher.getAuthTag()

	return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

async function main() {
	// Create admin user (10 rounds for faster serverless auth)
	const adminPassword = 'admin123'
	const adminHash = await bcrypt.hash(adminPassword, 10)

	await db.user.upsert({
		where: { username: 'admin' },
		update: { passwordHash: adminHash }, // Update hash if user exists
		create: {
			username: 'admin',
			passwordHash: adminHash,
			encryptedPw: encryptPassword(adminPassword),
			role: 'ADMIN',
		},
	})

	// Create demo employee
	const empPassword = 'demo123'
	const empHash = await bcrypt.hash(empPassword, 10)

	await db.user.upsert({
		where: { username: 'demo' },
		update: { passwordHash: empHash }, // Update hash if user exists
		create: {
			username: 'demo',
			passwordHash: empHash,
			encryptedPw: encryptPassword(empPassword),
			role: 'EMPLOYEE',
		},
	})

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

	// Create sample leads
	const industryRecords = await db.industry.findMany()
	const serviceRecords = await db.service.findMany()

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

	console.log('Seed completed!')
	console.log('Admin login: admin / admin123')
	console.log('Demo login: demo / demo123')
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await db.$disconnect()
	})
