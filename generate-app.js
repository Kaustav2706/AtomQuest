const fs = require('fs')
const path = require('path')

const files = {
  'src/app/layout.tsx': `import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AtomQuest | Goal Setting & Tracking',
  description: 'In-House Goal Setting & Tracking Portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}`,

  'src/components/AuthProvider.tsx': `'use client'
import { SessionProvider } from 'next-auth/react'
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}`,

  'src/app/login/page.tsx': `'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      toast.error('Invalid credentials')
    } else {
      toast.success('Logged in successfully')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">AtomQuest</CardTitle>
          <CardDescription>Enter your email and password to login</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="employee@atomquest.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">Log in</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}`,

  'src/app/dashboard/page.tsx': `import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  if (session.user.role === 'ADMIN') {
    redirect('/admin')
  } else if (session.user.role === 'MANAGER') {
    redirect('/manager')
  } else {
    redirect('/employee')
  }
}`,

  'src/app/employee/layout.tsx': `import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-4">
        <div className="text-xl font-bold mb-8">AtomQuest</div>
        <nav className="space-y-2">
          <Link href="/employee" className="block py-2 px-4 hover:bg-slate-800 rounded">Dashboard</Link>
          <Link href="/employee/goals" className="block py-2 px-4 hover:bg-slate-800 rounded">My Goals</Link>
          <Link href="/employee/check-ins" className="block py-2 px-4 hover:bg-slate-800 rounded">Check-ins</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-slate-50">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Employee Portal</h1>
          <div className="flex items-center gap-4">
            <span>{session.user.email}</span>
            <Link href="/api/auth/signout"><Button variant="outline">Sign out</Button></Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}`,

  'src/app/employee/page.tsx': `import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
    include: { goalSheets: true }
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">4</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">45%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pending Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">1</p>
          <p className="text-sm text-slate-500">Q2 Check-in due</p>
        </CardContent>
      </Card>
    </div>
  )
}`,

  'src/app/manager/layout.tsx': `import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-4">
        <div className="text-xl font-bold mb-8">AtomQuest</div>
        <nav className="space-y-2">
          <Link href="/manager" className="block py-2 px-4 hover:bg-slate-800 rounded">Team Dashboard</Link>
          <Link href="/manager/approvals" className="block py-2 px-4 hover:bg-slate-800 rounded">Approvals</Link>
          <Link href="/manager/check-ins" className="block py-2 px-4 hover:bg-slate-800 rounded">Check-ins Review</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-slate-50">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Manager Portal</h1>
          <div className="flex items-center gap-4">
            <span>{session.user.email}</span>
            <Link href="/api/auth/signout"><Button variant="outline">Sign out</Button></Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}`,

  'src/app/manager/page.tsx': `import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions)
  const teamUsers = await prisma.user.findMany({
    where: { managerId: session?.user.id }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Team Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{teamUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}`,

  'src/app/admin/layout.tsx': `import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white p-4">
        <div className="text-xl font-bold mb-8">AtomQuest</div>
        <nav className="space-y-2">
          <Link href="/admin" className="block py-2 px-4 hover:bg-slate-800 rounded">Dashboard</Link>
          <Link href="/admin/cycles" className="block py-2 px-4 hover:bg-slate-800 rounded">Cycle Mgmt</Link>
          <Link href="/admin/shared-goals" className="block py-2 px-4 hover:bg-slate-800 rounded">Shared Goals</Link>
          <Link href="/admin/audit" className="block py-2 px-4 hover:bg-slate-800 rounded">Audit Logs</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-slate-50">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <span>{session.user.email}</span>
            <Link href="/api/auth/signout"><Button variant="outline">Sign out</Button></Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}`,

  'src/app/admin/page.tsx': `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">150</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Cycle</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">FY 2024-2025</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Goal Completion %</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">78%</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Audit Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">1,240</p>
        </CardContent>
      </Card>
    </div>
  )
}`,

  'src/app/page.tsx': `import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/login')
}`
}

Object.entries(files).forEach(([filepath, content]) => {
  const dir = path.dirname(filepath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filepath, content)
})
console.log('App files generated successfully.')
