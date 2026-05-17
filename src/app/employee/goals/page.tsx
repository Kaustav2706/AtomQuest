import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Edit2, Trash2, PlusCircle, Send } from 'lucide-react'
import { SubmitButton } from './SubmitButton'
import { DeleteGoalButton } from './DeleteGoalButton'

export default async function EmployeeGoals() {
  const session = await getServerSession(authOptions)
  const goalSheet = await prisma.goalSheet.findFirst({
    where: { userId: session?.user.id },
    include: { goals: { include: { checkIns: true } }, cycle: true }
  })

  const isEditable = !goalSheet || goalSheet.status === 'DRAFT' || goalSheet.status === 'RETURNED'
  const totalWeightage = goalSheet?.goals.reduce((acc, g) => acc + g.weightage, 0) || 0
  const isValidWeightage = totalWeightage === 100

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Goals</h2>
          <p className="text-muted-foreground">{goalSheet?.cycle?.name || 'Performance Cycle'}</p>
        </div>
        
        {isEditable && (
          <div className="flex gap-2">
            <Link href="/employee/goals/create">
              <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Goal</Button>
            </Link>
            <SubmitButton isValidWeightage={isValidWeightage} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={goalSheet?.status === 'APPROVED' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
              {goalSheet?.status || 'DRAFT'}
            </Badge>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Weightage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isValidWeightage ? 'text-green-600' : 'text-red-500'}`}>
              {totalWeightage}%
            </div>
            {!isValidWeightage && <p className="text-xs text-red-500 mt-1">Must equal exactly 100%</p>}
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">{goalSheet?.updatedAt ? new Date(goalSheet.updatedAt).toLocaleDateString() : 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Sheet Table</CardTitle>
          <CardDescription>Your defined objectives for the cycle.</CardDescription>
        </CardHeader>
        <CardContent>
          {(!goalSheet || goalSheet.goals.length === 0) ? (
            <div className="py-12 text-center text-slate-500">No goals found. Click &apos;Add Goal&apos; to start.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title & Thrust Area</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="w-[150px]">Progress</TableHead>
                  {isEditable && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {goalSheet.goals.map((g) => {
                  const progress = g.checkIns.length > 0 ? g.checkIns[g.checkIns.length - 1].progress : 0
                  
                  return (
                    <TableRow key={g.id}>
                      <TableCell>
                        <div className="font-medium flex items-center gap-2">
                          {g.title}
                          {g.sharedGoalId && <Badge variant="outline" className="text-[10px] bg-blue-50">Shared</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">{g.thrustArea}</div>
                      </TableCell>
                      <TableCell className="text-xs">{g.uomType.replace('_', ' ')}</TableCell>
                      <TableCell>{g.targetValue || '-'}</TableCell>
                      <TableCell className="font-semibold">{g.weightage}%</TableCell>
                      <TableCell>{g.deadline ? new Date(g.deadline).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-2 w-full" />
                          <span className="text-xs font-medium">{progress}%</span>
                        </div>
                      </TableCell>
                      {isEditable && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {g.sharedGoalId ? (
                              <Button variant="ghost" size="icon" title="Cannot edit shared goal fully. Weightage only."><Edit2 className="w-4 h-4 text-slate-400" /></Button>
                            ) : (
                              <>
                                <Link href={`/employee/goals/edit/${g.id}`}>
                                  <Button variant="ghost" size="icon" className="text-blue-600">
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <DeleteGoalButton goalId={g.id} />
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
