import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { MessageSquare, PlusCircle } from 'lucide-react'

export default async function EmployeeCheckIns() {
  const session = await getServerSession(authOptions)
  
  const checkIns = await prisma.checkIn.findMany({
    where: { userId: session?.user.id },
    include: { goal: true, comments: true },
    orderBy: { quarter: 'asc' }
  })

  // Determine if check-in window is open (dummy logic based on month for demo)
  const currentMonth = new Date().getMonth() + 1
  const isWindowOpen = [7, 10, 1, 3, 4].includes(currentMonth) // July, Oct, Jan, March, April

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quarterly Check-ins</h2>
          <p className="text-muted-foreground">Update your progress and track achievements</p>
        </div>
        <Link href="/employee/check-ins/create">
          <Button disabled={!isWindowOpen} className="gap-2">
            <PlusCircle className="w-4 h-4" /> New Check-in
          </Button>
        </Link>
      </div>

      {!isWindowOpen && (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
          <strong>Notice:</strong> The Check-in window is currently closed. You can only view your past check-ins.
        </div>
      )}

      {checkIns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            You don't have any check-in records yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Check-in History</CardTitle>
            <CardDescription>All your submitted updates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Q</TableHead>
                  <TableHead>Goal Title</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Actual Achieved</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Progress</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Mgr Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checkIns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold">Q{c.quarter}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={c.goal.title}>{c.goal.title}</TableCell>
                    <TableCell>{c.goal.targetValue || '-'}</TableCell>
                    <TableCell>{c.actualAchieved !== null ? c.actualAchieved : '-'}</TableCell>
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
                    <TableCell className="text-xs">{c.completionDate ? new Date(c.completionDate).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>
                      {c.comments.length > 0 ? (
                        <div className="flex items-center gap-1 text-blue-600 text-xs font-medium cursor-help" title={c.comments[0].comment}>
                          <MessageSquare className="w-3 h-3" /> {c.comments.length}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
