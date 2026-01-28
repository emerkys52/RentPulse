# RentalPulse

Property management application built with Next.js 14, Prisma, and Stripe.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite (dev) with Prisma ORM
- **Auth:** NextAuth.js with Credentials provider
- **Payments:** Stripe
- **Styling:** Tailwind CSS + shadcn/ui
- **Email:** Resend

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment file and update with your values:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your credentials:
   - Generate a NextAuth secret: `openssl rand -base64 32`
   - Add your Stripe test keys
   - Add your Resend API key

4. Generate Prisma client and push the schema:

```bash
npm run db:generate
npm run db:push
```

5. Seed the database with sample data:

```bash
npm run db:seed
```

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Default Credentials

After seeding, you can log in with:

**User Account:**
- Email: `test@example.com`
- Password: `password123`

**Admin Panel:**
- URL: `/admin/login`
- Email: `admin@rentpulse.app`
- Password: `admin123`

## Features

### Free Tier
- Up to 2 properties
- Up to 4 tenants
- Basic late fee calculator
- ROI calculator (1 property)
- Payment tracking
- Lease management

### Premium Tier
- Unlimited properties and tenants
- Advanced calculators
- Email reminders for lease expirations
- Maintenance scheduling with alerts
- Document storage
- Priority support

## Project Structure

```
src/
├── app/
│   ├── (public)/           # Landing, pricing, features
│   ├── (auth)/             # Auth pages
│   ├── (dashboard)/        # Protected user area
│   ├── admin/              # Admin panel
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── forms/              # Form components
│   └── dashboard/          # Dashboard components
├── lib/
│   ├── db.ts               # Prisma client
│   ├── auth.ts             # NextAuth config
│   ├── stripe.ts           # Stripe helpers
│   ├── email.ts            # Email helpers
│   └── utils.ts            # Utility functions
└── types/                  # TypeScript types
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Stripe Webhook Setup

For local development, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret to your `.env.local` file.

## Cron Jobs

The application includes an endpoint for sending email reminders. Set up a cron job to call:

```
POST /api/cron/send-reminders
Authorization: Bearer YOUR_CRON_SECRET
```

## License

MIT
