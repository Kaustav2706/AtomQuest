import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { Check, X, ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function ApprovalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const goalSheet = await prisma.goalSheet.findUnique({
    where: { id: id },
    include: {
      user: true,
      cycle: true,
      goals: true
    }
  })

  if (!goalSheet) {
    redirect('/manager/approvals')
  }

  const totalWeightage = goalSheet.goals.reduce((acc, g) => acc + g.weightage, 0)
  const isValidWeightage = totalWeightage === 100

  async function handleAction(formData: FormData) {
    'use server'
    const actionType = formData.get('actionType') as string
    // const managerComments = formData.get('managerComments') as string

    if (actionType === 'APPROVE') {
      await prisma.goalSheet.update({
        where: { id: id },
        data: { status: 'APPROVED' }
      })
    } else if (actionType === 'RETURN') {
      await prisma.goalSheet.update({
        where: { id: id },
        data: { status: 'RETURNED' }
      })
      // Save comment as an alert/notification for the employee (mock implementation)
    }

    revalidatePath(`/manager/approvals/${id}`)
    revalidatePath('/manager')
    redirect('/manager/approvals')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/manager/approvals">
            <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Review Goal Sheet</h2>
            <p className="text-muted-foreground">{goalSheet.user.name} ({goalSheet.user.email})</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Status</CardTitle></CardHeader>
          <CardContent><Badge variant={goalSheet.status === 'SUBMITTED' ? 'secondary' : 'default'}>{goalSheet.status}</Badge></CardContent>
        </Card>
        <Card className={!isValidWeightage ? "border-red-500 bg-red-50" : ""}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Weightage</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-xl font-bold ${isValidWeightage ? 'text-green-600' : 'text-red-600'}`}>{totalWeightage}%</div>
            {!isValidWeightage && <p className="text-xs text-red-500 font-semibold mt-1">Must equal 100%</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Goal Review & Inline Editing</CardTitle>
              <CardDescription>Adjust targets and weightages before approval. Shared goals only allow weightage edits.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[150px]">Target</TableHead>
                <TableHead className="w-[120px]">Weight (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goalSheet.goals.map(g => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">
                    {g.title}
                    {g.sharedGoalId && <Badge variant="outline" className="ml-2 text-[10px] bg-blue-50">Shared</Badge>}
                  </TableCell>
                  <TableCell>{g.uomType.replace('_', ' ')}</TableCell>
                  <TableCell>
                    {goalSheet.status === 'SUBMITTED' && !g.sharedGoalId ? (
                      <Input defaultValue={g.targetValue || ''} className="h-8" />
                    ) : (
                      g.targetValue || '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {goalSheet.status === 'SUBMITTED' ? (
                      <Input type="number" defaultValue={g.weightage} className="h-8" />
                    ) : (
                      `${g.weightage}%`
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {goalSheet.status === 'SUBMITTED' && (
        <form action={handleAction}>
          <Card>
            <CardHeader>
              <CardTitle>Manager Action</CardTitle>
              <CardDescription>Leave feedback if returning for rework, or general notes on approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea name="managerComments" placeholder="Please adjust the weightage of the frontend portal goal..." className="h-32" />
              <div className="flex gap-4">
                <Button type="submit" name="actionType" value="APPROVE" className="gap-2 bg-green-600 hover:bg-green-700" disabled={!isValidWeightage}>
                  <Check className="w-4 h-4" /> Approve & Lock
                </Button>
                <Button type="submit" name="actionType" value="RETURN" variant="destructive" className="gap-2">
                  <X className="w-4 h-4" /> Return for Rework
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}
