import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, PlusCircle, Power, Trash2, Edit2, Copy, Eye, Clock, Users } from 'lucide-react'

import { createCycle } from './actions'
import { CycleActionsCell } from './CycleDialogs'

export default async function AdminCycles() {
  const cycles = await prisma.cycle.findMany({
    orderBy: { startDate: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Cycles</h2>
          <p className="text-muted-foreground">Manage organizational goal periods and submission windows</p>
        </div>
        
        <Dialog>
          <DialogTrigger render={
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="w-4 h-4" /> Create Cycle
            </Button>
          } />
          <DialogContent className="max-w-2xl">
            <form action={createCycle}>
              <DialogHeader>
                <DialogTitle>New Performance Cycle</DialogTitle>
                <DialogDescription>Define a new period and its associated milestones.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-4 col-span-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Cycle Name</Label>
                    <Input id="name" name="name" placeholder="FY 2026-2027" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Cycle Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Cycle End Date</Label>
                  <Input id="endDate" name="endDate" type="date" required />
                </div>
                
                <div className="col-span-2 pt-4 border-t">
                  <h4 className="text-sm font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Window Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="submissionDeadline">Goal Submission Deadline</Label>
                      <Input id="submissionDeadline" name="submissionDeadline" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="approvalDeadline">Manager Approval Deadline</Label>
                      <Input id="approvalDeadline" name="approvalDeadline" type="date" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">Initialize & Save Configuration</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cycle Configuration Registry</CardTitle>
          <CardDescription>Historical and active performance cycles with their respective windows</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cycle Details</TableHead>
                <TableHead>Goal Window</TableHead>
                <TableHead>Check-in Windows (Q1-Q4)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.startDate).toLocaleDateString()} - {new Date(c.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] font-medium text-blue-600 mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> 150 Employees Assigned
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-slate-700">
                      <div className="text-[10px] flex justify-between gap-4"><span>Submission:</span> <span className="font-semibold">{c.submissionDeadline ? new Date(c.submissionDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not Set'}</span></div>
                      <div className="text-[10px] flex justify-between gap-4"><span>Approval:</span> <span className="font-semibold">{c.approvalDeadline ? new Date(c.approvalDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not Set'}</span></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                        <div key={q} className="flex flex-col items-center p-1 bg-slate-50 rounded border text-[9px] min-w-[35px]">
                          <span className="font-bold">{q}</span>
                          <span className="text-slate-400">Open</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? 'default' : 'secondary'} className="text-[10px] px-2 py-0">
                      {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CycleActionsCell cycle={{
                      id: c.id,
                      name: c.name,
                      startDate: c.startDate.toISOString(),
                      endDate: c.endDate.toISOString(),
                      isActive: c.isActive,
                      submissionDeadline: c.submissionDeadline ? c.submissionDeadline.toISOString() : null,
                      approvalDeadline: c.approvalDeadline ? c.approvalDeadline.toISOString() : null
                    }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
