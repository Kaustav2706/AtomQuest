import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, FileCheck, Clock, AlertTriangle, TrendingUp, CheckCircle, Activity, BellRing } from 'lucide-react'
import Link from 'next/link'

import { ManagerActions } from './ManagerActions'

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions)
  
  const teamMembers = await prisma.user.findMany({
    where: { managerId: session?.user.id },
    include: {
      goalSheets: { include: { goals: true } },
      checkIns: true
    }
  })

  const teamSize = teamMembers.length
  const teamProgressData = teamMembers.map(member => {
    const sheet = member.goalSheets[0]
    const progress = 45 // Dummy progress logic
    
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      sheetStatus: sheet?.status || 'DRAFT',
      progress,
      pendingAction: sheet?.status === 'SUBMITTED' ? 'Review Goal Sheet' : 'None'
    }
  })

  const pendingApprovals = teamProgressData.filter(emp => emp.sheetStatus === 'SUBMITTED').length
  const totalProgress = teamProgressData.reduce((acc, emp) => acc + emp.progress, 0)
  const averageProgress = teamSize > 0 ? Math.round(totalProgress / teamSize) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Team Dashboard</h2>
        <ManagerActions />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{teamSize}</div></CardContent>
        </Card>
        
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Pending Approvals</CardTitle>
            <FileCheck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-700">{pendingApprovals}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Check-ins</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">3</div></CardContent>
        </Card>

        <Card className="bg-red-50 border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Overdue Check-ins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-700">1</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{averageProgress}%</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">12%</div></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Progress Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Progress</CardTitle>
            <CardDescription>Overview of your direct reports&apos; performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Sheet Status</TableHead>
                  <TableHead className="w-[150px]">Overall Progress</TableHead>
                  <TableHead>Pending Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamProgressData.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      {emp.name}
                      <div className="text-xs text-muted-foreground">{emp.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={emp.sheetStatus === 'APPROVED' ? 'default' : emp.sheetStatus === 'SUBMITTED' ? 'secondary' : 'outline'}>
                        {emp.sheetStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={emp.progress} className="h-2 w-full" />
                        <span className="text-xs font-medium">{emp.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {emp.pendingAction === 'Review Goal Sheet' ? (
                        <Link href="/manager/approvals" className="text-sm text-amber-600 font-semibold hover:underline">
                          {emp.pendingAction}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">{emp.pendingAction}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Activity & Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg"><BellRing className="w-5 h-5 text-red-500" /> Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Employee User has not submitted Q1 Check-in (Overdue by 5 days).</span>
              </div>
              {pendingApprovals > 0 && (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100 flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{pendingApprovals} Goal Sheet{pendingApprovals > 1 ? 's' : ''} await your approval.</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg"><Activity className="w-5 h-5 text-blue-500" /> Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-slate-200 ml-3 space-y-6">
                <div className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1 border-2 border-white"></div>
                  <p className="text-sm font-medium">Employee User submitted Check-in</p>
                  <p className="text-xs text-slate-500">Q1 - Complete Portal Frontend (2 hours ago)</p>
                </div>
                <div className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[6.5px] top-1 border-2 border-white"></div>
                  <p className="text-sm font-medium">Employee User submitted Goal Sheet</p>
                  <p className="text-xs text-slate-500">FY 2026-2027 (1 day ago)</p>
                </div>
                <div className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[6.5px] top-1 border-2 border-white"></div>
                  <p className="text-sm font-medium">You approved Goal Sheet</p>
                  <p className="text-xs text-slate-500">John Doe (3 days ago)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}