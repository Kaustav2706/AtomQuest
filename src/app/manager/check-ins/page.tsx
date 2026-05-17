import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { MessageSquarePlus, Filter, CalendarCheck, MessageCircle } from 'lucide-react'
import { revalidatePath } from 'next/cache'

export default async function ManagerCheckIns({
  searchParams,
}: {
  searchParams: Promise<{ quarter?: string; status?: string; employeeId?: string }>
}) {
  const { quarter, status, employeeId } = await searchParams;
  const session = await getServerSession(authOptions)
  
  const quarterFilter = quarter && quarter !== 'all' ? parseInt(quarter) : undefined
  const statusFilter = status && status !== 'all' ? status : undefined
  const employeeFilter = employeeId && employeeId !== 'all' ? employeeId : undefined

  // Fetch all team members for the employee filter
  const teamMembers = await prisma.user.findMany({
    where: { managerId: session?.user.id },
    select: { id: true, name: true }
  })

  const teamCheckIns = await prisma.checkIn.findMany({
    where: { 
      user: { managerId: session?.user.id },
      ...(quarterFilter ? { quarter: quarterFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(employeeFilter ? { userId: employeeFilter } : {})
    },
    include: {
      user: true,
      goal: true,
      comments: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const employees = Array.from(new Set(teamCheckIns.map(c => c.user.id))).map(id => {
    const checkIns = teamCheckIns.filter(c => c.user.id === id)
    return { user: checkIns[0].user, checkIns }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Check-ins</h2>
          <p className="text-muted-foreground">Monitor quarterly progress and provide feedback</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="flex flex-wrap gap-4 items-end" method="GET">
            <div className="space-y-1.5 w-[200px]">
              <label htmlFor="employeeId" className="text-sm font-medium">Employee</label>
              <select name="employeeId" id="employeeId" defaultValue={employeeId || 'all'} className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option value="all">All Employees</option>
                {teamMembers.map(tm => (
                  <option key={tm.id} value={tm.id}>{tm.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 w-[150px]">
              <label htmlFor="quarter" className="text-sm font-medium">Quarter</label>
              <select name="quarter" id="quarter" defaultValue={quarter || 'all'} className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option value="all">All Quarters</option>
                <option value="1">Q1</option>
                <option value="2">Q2</option>
                <option value="3">Q3</option>
                <option value="4">Q4</option>
              </select>
            </div>
            <div className="space-y-1.5 w-[150px]">
              <label htmlFor="status" className="text-sm font-medium">Status</label>
              <select name="status" id="status" defaultValue={status || 'all'} className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option value="all">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_TRACK">On Track</option>
                <option value="NOT_STARTED">Not Started</option>
              </select>
            </div>
            <Button type="submit" variant="outline" className="gap-2"><Filter className="w-4 h-4" /> Filter</Button>
          </form>
        </CardContent>
      </Card>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No check-ins have been submitted by your team matching the filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {employees.map((emp) => (
            <Card key={emp.user.id}>
              <CardHeader>
                <CardTitle className="text-lg">{emp.user.name}</CardTitle>
                <CardDescription>{emp.user.email} • {emp.checkIns.length} Updates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Q</TableHead>
                      <TableHead>Goal Title</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[150px]">Progress</TableHead>
                      <TableHead>Completion Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emp.checkIns.map((c) => {
                      const latestComment = c.comments.length > 0 ? c.comments[c.comments.length - 1] : null;
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-semibold">Q{c.quarter}</TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate" title={c.goal.title}>
                            {c.goal.title}
                            {latestComment && (
                              <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-1">
                                <MessageCircle className="w-3 h-3" /> {latestComment.comment.substring(0, 30)}...
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{c.goal.targetValue ?? 'N/A'}</TableCell>
                          <TableCell>{c.actualAchieved ?? '0'}</TableCell>
                          <TableCell>
                            <Badge variant={c.status === 'COMPLETED' ? 'default' : c.status === 'ON_TRACK' ? 'secondary' : 'destructive'} className="text-[10px]">
                              {c.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={c.progress} className="h-2 w-full" />
                              <span className="text-xs font-medium">{c.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {c.completionDate ? (
                              <div className="flex items-center gap-1 text-slate-600">
                                <CalendarCheck className="w-3 h-3" /> {new Date(c.completionDate).toLocaleDateString()}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-slate-100 h-8 px-3 text-blue-600">
                                <MessageSquarePlus className="w-4 h-4" /> Feedback
                              </DialogTrigger>
                              <DialogContent>
                                <form action={async (formData) => {
                                  'use server'
                                  const comment = formData.get('comment') as string
                                  if (!comment) return
                                  
                                  await prisma.checkInComment.create({
                                    data: {
                                      checkInId: c.id,
                                      userId: session?.user.id as string,
                                      comment: comment
                                    }
                                  })
                                  revalidatePath('/manager/check-ins')
                                }}>
                                  <DialogHeader>
                                    <DialogTitle>Manager Feedback</DialogTitle>
                                    <DialogDescription>
                                      Add comments for <strong>{emp.user.name}</strong> on their Q{c.quarter} check-in for <em>&quot;{c.goal.title}&quot;</em>.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="p-4 bg-slate-50 rounded-lg text-sm mb-4 border border-slate-100">
                                    <span className="font-semibold text-slate-700">Employee Notes:</span><br/>
                                    {c.notes || "No notes provided."}
                                  </div>
                                  <Textarea name="comment" placeholder="Great progress, keep it up..." className="h-32 mb-4" required />
                                  <DialogFooter>
                                    <Button type="submit">Save Feedback</Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
