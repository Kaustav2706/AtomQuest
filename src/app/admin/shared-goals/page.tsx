import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PlusCircle, Target, Users, Trash2, Edit2, Building2, TrendingUp, Filter } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DepartmentSelector from './DepartmentSelector'

export default async function AdminSharedGoals() {
  const sharedGoals = await prisma.sharedGoal.findMany({
    include: { cycle: true }
  })
  const cycles = await prisma.cycle.findMany({ where: { isActive: true } })

  async function createSharedGoal(formData: FormData) {
    'use server'
    const session = await getServerSession(authOptions)
    const title = formData.get('title') as string
    const thrustArea = formData.get('thrustArea') as string
    const cycleId = formData.get('cycleId') as string
    const uomType = formData.get('uomType') as string
    const targetValue = parseFloat(formData.get('targetValue') as string)
    const departments = formData.get('departments') as string

    const goal = await prisma.sharedGoal.create({
      data: { title, thrustArea, cycleId, uomType, targetValue, departments }
    })

    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: 'CREATE',
        entity: 'SharedGoal',
        entityId: goal.id,
        reason: `Created organizational goal: ${title}`,
      }
    })

    revalidatePath('/admin/shared-goals')
  }

  async function deleteSharedGoal(formData: FormData) {
    'use server'
    const session = await getServerSession(authOptions)
    const id = formData.get('id') as string
    if (id) {
      const goal = await prisma.sharedGoal.findUnique({ where: { id } })
      await prisma.sharedGoal.delete({ where: { id } })

      await prisma.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: 'DELETE',
          entity: 'SharedGoal',
          entityId: id,
          reason: `Deleted organizational goal: ${goal?.title || 'Unknown'}`,
        }
      })

      revalidatePath('/admin/shared-goals')
    }
  }

  async function updateSharedGoal(formData: FormData) {
    'use server'
    const session = await getServerSession(authOptions)
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const thrustArea = formData.get('thrustArea') as string
    const cycleId = formData.get('cycleId') as string
    const uomType = formData.get('uomType') as string
    const targetValue = parseFloat(formData.get('targetValue') as string)
    const departments = formData.get('departments') as string

    if (id) {
      await prisma.sharedGoal.update({
        where: { id },
        data: { title, thrustArea, cycleId, uomType, targetValue, departments }
      })

      await prisma.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: 'UPDATE',
          entity: 'SharedGoal',
          entityId: id,
          reason: `Updated organizational goal: ${title}`,
        }
      })

      revalidatePath('/admin/shared-goals')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Shared Goals</h2>
          <p className="text-muted-foreground">Define and manage goals applied organization-wide or to specific departments</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Filter className="w-4 h-4" /> Filter</Button>
          <Dialog>
            <DialogTrigger render={
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="w-4 h-4" /> New Shared Goal
              </Button>
            } />
            <DialogContent className="max-w-2xl">
              <form action={createSharedGoal}>
                <DialogHeader>
                  <DialogTitle>Create Organizational Goal</DialogTitle>
                  <DialogDescription>Shared goals are automatically pushed to relevant employee goal sheets.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Active Performance Cycle</Label>
                      <select name="cycleId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" required>
                        {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Thrust Area</Label>
                      <Input name="thrustArea" placeholder="e.g., Engineering Excellence" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Goal Title</Label>
                    <Input name="title" placeholder="e.g., Q1 Technical Training Completion" required />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>UoM Type</Label>
                      <select name="uomType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" required>
                        <option value="PERCENTAGE_MAX">Percentage (Max)</option>
                        <option value="NUMERIC_MIN">Numeric (Min)</option>
                        <option value="TIMELINE">Timeline</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Value</Label>
                      <Input name="targetValue" type="number" placeholder="100" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Fixed Weightage (%)</Label>
                      <Input name="weightage" type="number" placeholder="10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Departments (Optional)</Label>
                    <DepartmentSelector />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">Publish to Organization</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organizational Goal Repository</CardTitle>
          <CardDescription>View impact and assignment status of shared objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shared Goal & Cycle</TableHead>
                <TableHead>Departments</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sharedGoals.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{g.title}</div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{g.thrustArea} • {g.cycle.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {g.departments ? (
                        g.departments.split(',').map(d => (
                          <Badge key={d} variant="outline" className="text-[10px] bg-slate-50 border-slate-200">{d}</Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200">All</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />)}
                      </div>
                      <span className="text-[10px] font-bold text-blue-600">150 Employees</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="font-bold">10%</span></TableCell>
                  <TableCell>
                    <Badge className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">PUBLISHED</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Dialog>
                        <DialogTrigger render={<Button variant="ghost" size="icon" title="View Impact"><TrendingUp className="w-4 h-4 text-blue-600" /></Button>} />
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Impact Report</DialogTitle>
                            <DialogDescription>Overview for {g.title}</DialogDescription>
                          </DialogHeader>
                          <div className="py-6">
                            <div className="text-center space-y-2">
                              <h3 className="text-3xl font-bold text-blue-600">150</h3>
                              <p className="text-sm text-slate-500">Employees currently working on this objective.</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger render={<Button variant="ghost" size="icon" title="Edit"><Edit2 className="w-4 h-4" /></Button>} />
                        <DialogContent className="max-w-2xl">
                          <form action={updateSharedGoal}>
                            <input type="hidden" name="id" value={g.id} />
                            <DialogHeader>
                              <DialogTitle>Edit Organizational Goal</DialogTitle>
                              <DialogDescription>Updates will be applied immediately.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4 text-left">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Active Performance Cycle</Label>
                                  <select name="cycleId" defaultValue={g.cycleId} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" required>
                                    {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Thrust Area</Label>
                                  <Input name="thrustArea" defaultValue={g.thrustArea} placeholder="e.g., Engineering Excellence" required />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Goal Title</Label>
                                <Input name="title" defaultValue={g.title} placeholder="e.g., Q1 Technical Training Completion" required />
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label>UoM Type</Label>
                                  <select name="uomType" defaultValue={g.uomType} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring" required>
                                    <option value="PERCENTAGE_MAX">Percentage (Max)</option>
                                    <option value="NUMERIC_MIN">Numeric (Min)</option>
                                    <option value="TIMELINE">Timeline</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Target Value</Label>
                                  <Input name="targetValue" defaultValue={g.targetValue?.toString() || ''} type="number" placeholder="100" required />
                                </div>
                                <div className="space-y-2">
                                  <Label>Fixed Weightage (%)</Label>
                                  <Input name="weightage" type="number" defaultValue="10" placeholder="10" required />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Target Departments (Optional)</Label>
                                <DepartmentSelector defaultSelected={g.departments ? g.departments.split(',') : []} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" className="w-full">Save Changes</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <form action={deleteSharedGoal}>
                        <input type="hidden" name="id" value={g.id} />
                        <Button type="submit" variant="ghost" size="icon" className="text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></Button>
                      </form>
                    </div>
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
