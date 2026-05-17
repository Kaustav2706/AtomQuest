# AtomQuest Goal Setting & Tracking Portal

## Architecture Diagram

```mermaid
graph TD

    Client["Next.js Client Components"] --> API["API Routes"]
    API --> Server["Next.js App Router (Server)"]
    Server --> Prisma["Prisma ORM"]
    Prisma --> DB["PostgreSQL Database"]

    Client --> Auth["NextAuth Auth Module"]
    Auth --> Credentials["Credentials Provider"]
    Credentials --> Server

    subgraph Roles
        E["Employee"]
        M["Manager"]
        A["Admin"]
    end

    Roles --> Client
```


## Folder Structure

```
├── prisma/
│   ├── schema.prisma   # Database schema models
│   └── seed.ts         # Seed data script
├── src/
│   ├── app/            # Next.js App Router Pages
│   │   ├── api/        # Next.js API Routes (Auth, Data)
│   │   ├── admin/      # Admin Pages
│   │   ├── employee/   # Employee Pages
│   │   ├── manager/    # Manager Pages
│   │   └── login/      # Authentication Page
│   ├── components/     # UI Components (shadcn/ui)
│   ├── lib/            # Utilities (Prisma, Auth Config)
│   └── types/          # TypeScript Types
├── public/             # Static Assets
└── package.json        # Dependencies
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up the database:
   Update the `.env` file with your PostgreSQL connection URL.
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/atomquest"
   ```
3. Run migrations and generate Prisma client:
   ```bash
   npx prisma db push
   ```
4. Seed the database (creates test accounts, cycle, etc.):
   ```bash
   npm run seed
   ```
   *(Ensure you have a seed script defined in your package.json, e.g., `"seed": "npx tsx prisma/seed.ts"`)*
5. Start the development server:
   ```bash
   npm run dev
   ```
   # AtomQuest

A role-based performance management system built with Next.js, Prisma, NextAuth, and Tailwind CSS.

## 🚀 Live Demo
🔗 https://atom-quest-asv6.vercel.app

## Demo Credentials
- Employee: `employee@atomquest.com` / `password123`
- Manager: `manager@atomquest.com` / `password123`
- Admin: `admin@atomquest.com` / `password123`

## Features Included
- ✅ Complete End-to-End Authentication and Role-based navigation
- ✅ UI built with shadcn/ui and TailwindCSS for a "clean corporate design"
- ✅ Prisma Schema fulfilling 100% of the PRD requirements (Goals, Approvals, Escalations, Check-ins)
- ✅ Dummy seed script creating sample organization, cycle, shared goal, and initial tracking state
- ✅ Scalable Server Actions / API architecture for fast and optimized loading
