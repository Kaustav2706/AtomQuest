import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'EMPLOYEE') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar role="EMPLOYEE" userEmail={session.user.email || ""} />
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employee Workspace</h1>
          <div className="flex items-center gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Employee</span>
              <span className="text-sm font-bold text-slate-800">{session.user.name || 'Employee User'}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border flex items-center justify-center font-bold text-slate-700 text-xs">
              EP
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}