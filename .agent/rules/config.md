---
trigger: always_on
---

Rufhammer Project

Project Overview
Name: Rufhammer
Description: Lead management and booking system for a digital agency. Current Version: 0.1.0

Technology Stack
Framework: Next.js 16.1.2 (App Router)
Language: TypeScript 5
Styling: Tailwind CSS 4, PostCSS
UI Library: shadcn/ui (Radix UI primitives + Tailwind)
Icons: Lucide React
Database: Prisma ORM (v6.19.2)
Auth: Better Auth (v1.4.13), BcryptJS
Data Handling: XLSX (SheetJS), Recharts
Environment: Node.js 20+

Directory Structure
src/app: Next.js App Router pages and layouts.
src/components: UI components.
src/components/ui: shadcn/ui primitives (Button, Card, Dialog, etc.).
src/components: Feature-specific components (LeadManagement, BookingFlow, etc.).
src/lib: Utility functions, types, and database clients.
src/hooks: Custom React hooks.
prisma: Database schema and seed scripts.
public: Static assets.

Component Standards
Strict shadcn/ui Usage: All UI elements MUST be built using the shadcn/ui components located in src/components/ui.
Custom Components: If a specific UI pattern is needed that doesn't exist in the current set, create a new lookalike component adhering to shadcn/ui design principles (using cva for variants, cn for class merging, and consistent design tokens).
Styling: Use Tailwind CSS utility classes. Avoid custom CSS module files unless absolutely necessary for complex animations or global overrides.
Icons: Use lucide-react icons.

Key Components & Features
Lead Management: src/components/lead-management.tsx - Table view for managing leads with filtering, editing, and status updates.
Booking Flow: src/components/booking-flow.tsx - Interface for booking appointments.
Dashboard: src/components/dashboard-content.tsx - Main dashboard view.
Category Selector: src/components/category-selector.tsx - Component for selecting industries and services.
Authentication: Implemented using Better Auth (configuration likely in src/lib/auth.ts or similar).

Development Workflow
Dev Server: npm run dev
Database Push: npm run db:push
Database Studio: npm run db:studio
Linting: npm run lint

Design System
Theme: "New York" style (from shadcn).
Base Color: Neutral.
CSS Variables: Enabled for theme customization (see src/app/globals.css).
Dark Mode: Supported via standard shadcn/ui patterns.