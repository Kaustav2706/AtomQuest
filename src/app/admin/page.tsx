import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Users, Calendar, TrendingUp, ShieldCheck, 
  UserCheck, Lock, FileCheck, Target,
  Activity, BellRing, Zap, ArrowUpRight, 
  Building2, BarChart3, Download, PlusCircle, Unlock
} from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Command Center</h2>
          <p className="text-muted-foreground">Organization-wide performance and system oversight</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/reports/org" download>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export Analytics
            </Button>
          </a>
          <Link href="/admin/cycles">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Zap className="w-4 h-4" /> Quick Actions
            </Button>
          </Link>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground">+4 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Managers</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">100% login rate</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Active Cycle</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-700">FY 2026-2027</div>
            <p className="text-xs text-blue-600/80">Q1 Check-in Window Open</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Windows</CardTitle>
            <Lock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Q1 Check-in</div>
            <p className="text-xs text-muted-foreground">Closes in 12 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Goal Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.4%</div>
            <Progress value={78.4} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <FileCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-red-600 font-medium">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <ShieldCheck className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,240</div>
            <p className="text-xs text-muted-foreground">System secure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shared Goals</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Assigned to all staff</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts & Trends Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Performance Analytics</CardTitle>
            <CardDescription>Department-wise progress and completion trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">Engineering</span>
                </div>
                <span className="text-sm font-bold">85%</span>
              </div>
              <Progress value={85} className="h-2 bg-blue-100" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">Product & Design</span>
                </div>
                <span className="text-sm font-bold">72%</span>
              </div>
              <Progress value={72} className="h-2 bg-indigo-100" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">Sales & Marketing</span>
                </div>
                <span className="text-sm font-bold">60%</span>
              </div>
              <Progress value={60} className="h-2 bg-amber-100" />
            </div>

            <div className="pt-6 border-t">
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-500">Goal Completion Trend</h4>
              <div className="flex items-end justify-between h-32 gap-2">
                {[40, 55, 48, 65, 80, 78, 85].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-blue-500 rounded-t-sm group-hover:bg-blue-600 transition-all cursor-pointer relative" 
                      style={{ height: `${val}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-slate-800 text-white px-1 rounded">
                        {val}%
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">M{i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg"><BellRing className="w-5 h-5 text-red-500" /> Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <span>12 manager approvals are overdue. System escalation triggered.</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100 flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Q1 Check-in window closing for all departments in 48 hours.</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg"><Zap className="w-5 h-5 text-amber-500" /> Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Link 
                href="/admin/cycles" 
                className={cn(buttonVariants({ variant: 'outline' }), "justify-start gap-2 h-9 text-xs")}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Create New Cycle
              </Link>
              <Button variant="outline" className="justify-start gap-2 h-9 text-xs">
                <Lock className="w-3.5 h-3.5" /> Open Check-in Window
              </Button>
              <Link 
                href="/admin/shared-goals" 
                className={cn(buttonVariants({ variant: 'outline' }), "justify-start gap-2 h-9 text-xs")}
              >
                <Target className="w-3.5 h-3.5" /> Assign Shared Goal
              </Link>
              <Button variant="outline" className="justify-start gap-2 h-9 text-xs">
                <Unlock className="w-3.5 h-3.5" /> Unlock Goal Sheet
              </Button>
              <a href="/api/reports/org" download className="w-full flex">
                <Button variant="outline" className="justify-start gap-2 h-9 text-xs text-blue-600 w-full">
                  <Download className="w-3.5 h-3.5" /> Generate Org Report
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg"><Activity className="w-5 h-5 text-blue-500" /> System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-slate-200 ml-3 space-y-6">
                <div className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1 border-2 border-white"></div>
                  <p className="text-sm font-medium">New Shared Goal Created</p>
                  <p className="text-xs text-slate-500">Security Compliance 2026 (1 hour ago)</p>
                </div>
                <div className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[6.5px] top-1 border-2 border-white"></div>
                  <p className="text-sm font-medium">Goal Sheet Unlocked</p>
                  <p className="text-xs text-slate-500">Employee User requested edit (3 hours ago)</p>
                </div>
                <div className="pl-6 relative">
                  <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[6.5px] top-1 border-2 border-white"></div>
                  <p className="text-sm font-medium">Cycle FY 2026-2027 Initialized</p>
                  <p className="text-xs text-slate-500">By Admin User (1 day ago)</p>
                </div>
              </div>
              <Link href="/admin/audit" className="w-full block mt-4">
                <Button variant="ghost" className="w-full text-xs text-blue-600 gap-2">
                  View Full Audit Trail <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}