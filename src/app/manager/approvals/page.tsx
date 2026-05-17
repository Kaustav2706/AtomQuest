import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Eye, Search, Filter } from 'lucide-react'

export default async function ManagerApprovals({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>
}) {
  const { search, status } = await searchParams;
  const session = await getServerSession(authOptions)
  
  const searchFilter = search?.toLowerCase()
  const statusFilter = status && status !== 'all' ? status : undefined

  // Find employees that report to this manager
  const teamMembers = await prisma.user.findMany({
    where: { managerId: session?.user.id },
    include: {
      goalSheets: {
        where: {
          status: { in: ['SUBMITTED', 'APPROVED', 'RETURNED'] },
          ...(statusFilter ? { status: statusFilter } : {})
        },
        include: { cycle: true, goals: true }
      }
    }
  })

  let allGoalSheets = teamMembers.flatMap(user => 
    user.goalSheets.map(sheet => ({ ...sheet, user }))
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  if (searchFilter) {
    allGoalSheets = allGoalSheets.filter(sheet => 
      sheet.user.name.toLowerCase().includes(searchFilter) || 
      sheet.user.email.toLowerCase().includes(searchFilter)
    )
  }

  const pendingCount = allGoalSheets.filter(s => s.status === 'SUBMITTED').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Approval Queue</h2>
          <p className="text-muted-foreground">Review and approve your team&apos;s goal sheets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="flex flex-wrap gap-4 items-end" method="GET">
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label htmlFor="search" className="text-sm font-medium">Search Employee</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="text" name="search" id="search" placeholder="Search by name or email" defaultValue={search || ''} className="pl-8" />
              </div>
            </div>
            <div className="space-y-1.5 w-[200px]">
              <label htmlFor="status" className="text-sm font-medium">Status Filter</label>
              <select name="status" id="status" defaultValue={status || 'all'} className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <option value="all">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="APPROVED">Approved</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>
            <Button type="submit" variant="outline" className="gap-2"><Filter className="w-4 h-4" /> Filter</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Goal Sheets</CardTitle>
          <CardDescription>Submitted goal sheets awaiting your review</CardDescription>
        </CardHeader>
        <CardContent>
          {allGoalSheets.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No goal sheets match your filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Total Goals</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allGoalSheets.map((sheet) => (
                  <TableRow key={sheet.id}>
                    <TableCell className="font-medium">
                      <div>{sheet.user.name}</div>
                      <div className="text-xs text-muted-foreground">{sheet.user.email}</div>
                    </TableCell>
                    <TableCell>{sheet.cycle.name}</TableCell>
                    <TableCell>{sheet.goals.length} Goals</TableCell>
                    <TableCell>
                      <Badge variant={sheet.status === 'APPROVED' ? 'default' : sheet.status === 'SUBMITTED' ? 'secondary' : 'destructive'}>
                        {sheet.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(sheet.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/manager/approvals/${sheet.id}`}>
                        <Button variant="outline" size="sm" className="gap-2 text-blue-600">
                          <Eye className="w-4 h-4" /> Review
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

