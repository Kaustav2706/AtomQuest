import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Bell, Calendar, Target, Clock, AlertCircle, Share2, CheckCircle2 } from 'lucide-react'

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
    include: { 
      goalSheets: {
        include: { cycle: true, goals: true }
      },
      checkIns: {
        include: { goal: true, comments: true }
      },
      notifications: true
    }
  })

  const currentGoalSheet = user?.goalSheets[0]
  const totalGoals = currentGoalSheet?.goals.length || 0
  const sharedGoals = currentGoalSheet?.goals.filter(g => g.sharedGoalId).length || 0
  const progress = 45 // Dummy calculation
  
  const cycleName = currentGoalSheet?.cycle?.name || 'FY 2026-2027'
  const sheetStatus = currentGoalSheet?.status || 'DRAFT'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">For {cycleName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress}%</div>
            <Progress value={progress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Q2 Check-in due soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Sheet Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{sheetStatus.toLowerCase()}</div>
            <p className="text-xs text-muted-foreground">{sharedGoals} Shared Goals assigned</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alerts & Notifications */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Pending Actions & Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-red-50 text-red-800 rounded-lg border border-red-100">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Goal Sheet Returned for Rework</h4>
                <p className="text-sm opacity-90">Your manager has added comments on your targets. Please review and resubmit.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
              <Clock className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Q2 Check-in due by Oct 31</h4>
                <p className="text-sm opacity-90">The check-in window is currently open. Please update your progress.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
              <Share2 className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Shared Goal Assigned</h4>
                <p className="text-sm opacity-90">&quot;Reduce Bug Rate&quot; has been assigned to you by your manager.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Manager Comments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Comments</CardTitle>
            <CardDescription>From your manager</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-indigo-500 pl-4 py-1">
              <p className="text-sm text-slate-800 italic">&quot;Please increase the weightage of the frontend portal goal to at least 40%.&quot;</p>
              <p className="text-xs text-slate-500 mt-1">- Manager User, 2 days ago</p>
            </div>
            <div className="border-l-4 border-emerald-500 pl-4 py-1">
              <p className="text-sm text-slate-800 italic">&quot;Great progress on Q1 check-in!&quot;</p>
              <p className="text-xs text-slate-500 mt-1">- Manager User, 2 months ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}