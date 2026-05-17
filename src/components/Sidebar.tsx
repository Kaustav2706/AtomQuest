"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, Users, Calendar, Target, 
  FileSpreadsheet, FileCheck, ClipboardCheck, 
  Menu, ChevronLeft, ChevronRight, LogOut, ShieldCheck, UserCheck, ShieldAlert
} from 'lucide-react'

interface SidebarProps {
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
  userEmail: string
}

export default function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Hydrate collapsed state from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved) {
      setIsCollapsed(saved === 'true')
    }
  }, [])

  const toggleSidebar = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    localStorage.setItem('sidebar-collapsed', String(nextState))
  }

  // Get links based on role
  const links = {
    ADMIN: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/cycles', label: 'Cycle Mgmt', icon: Calendar },
      { href: '/admin/shared-goals', label: 'Shared Goals', icon: Target },
      { href: '/admin/audit', label: 'Audit Logs', icon: FileSpreadsheet }
    ],
    MANAGER: [
      { href: '/manager', label: 'Team Dashboard', icon: LayoutDashboard },
      { href: '/manager/approvals', label: 'Approvals', icon: FileCheck },
      { href: '/manager/check-ins', label: 'Check-ins Review', icon: ClipboardCheck }
    ],
    EMPLOYEE: [
      { href: '/employee', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/employee/goals', label: 'My Goals', icon: Target },
      { href: '/employee/check-ins', label: 'Check-ins', icon: ClipboardCheck }
    ]
  }[role]

  // Role details for bottom badge
  const roleMeta = {
    ADMIN: { label: 'Administrator', icon: ShieldAlert, color: 'text-amber-400 bg-amber-500/10' },
    MANAGER: { label: 'Manager', icon: UserCheck, color: 'text-emerald-400 bg-emerald-500/10' },
    EMPLOYEE: { label: 'Employee', icon: ShieldCheck, color: 'text-blue-400 bg-blue-500/10' }
  }[role]

  return (
    <aside 
      className={cn(
        "bg-slate-950 border-r border-slate-800 text-slate-100 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 h-screen sticky top-0 z-40 select-none",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* Header container */}
        <div className="flex items-center justify-end p-4 h-14 relative">
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-slate-900 text-slate-400 hover:text-white transition-colors absolute right-[-14px] top-4 bg-slate-950 border border-slate-800 shadow z-50"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1.5 mt-4">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== role.toLowerCase() && pathname.startsWith(link.href))
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all relative group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
                
                {!isCollapsed && (
                  <span className="transition-opacity duration-300">{link.label}</span>
                )}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-slate-100 text-xs font-bold rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-800">
                    {link.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User profile / session status footer */}
      <div className="p-3 border-t border-slate-900 bg-slate-950">
        <div className={cn(
          "flex items-center gap-2.5 rounded-lg p-2 transition-all justify-between",
          !isCollapsed && "bg-slate-900/30 border border-slate-900"
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar sphere */}
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 uppercase">
              {userEmail.split('@')[0].slice(0, 2)}
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{userEmail}</p>
                <div className={cn(
                  "inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 uppercase tracking-wide",
                  roleMeta.color
                )}>
                  <roleMeta.icon className="w-2.5 h-2.5" />
                  {roleMeta.label}
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <Link href="/api/auth/signout" className="p-1 rounded hover:bg-slate-900 text-slate-400 hover:text-red-400 transition-all shrink-0" title="Sign Out Session">
              <LogOut className="w-4 h-4" />
            </Link>
          )}

          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2 py-1.5 bg-slate-900 text-slate-100 text-xs font-bold rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-800 flex flex-col gap-1">
              <span className="text-slate-300 font-bold">{userEmail}</span>
              <span className="text-[10px] text-blue-400">{roleMeta.label}</span>
            </div>
          )}
        </div>

        {isCollapsed && (
          <Link href="/api/auth/signout" className="mt-2 flex justify-center">
            <button className="p-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-red-400 transition-colors" title="Sign Out Session">
              <LogOut className="w-4 h-4" />
            </button>
          </Link>
        )}
      </div>
    </aside>
  )
}
