import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function CreateCheckIn() {
  const session = await getServerSession(authOptions)
  
  // Fetch user's current goals to populate the dropdown
  const goals = await prisma.goal.findMany({
    where: { 
      goalSheet: {
        userId: session?.user.id,
        status: 'APPROVED'
      }
    }
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">New Quarterly Check-in</h2>
        <Link href="/employee/check-ins"><Button variant="outline">Cancel</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check-in Details</CardTitle>
          <CardDescription>Update your progress on an active goal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Goal</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a goal to update" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quarter</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1</SelectItem>
                  <SelectItem value="2">Q2</SelectItem>
                  <SelectItem value="3">Q3</SelectItem>
                  <SelectItem value="4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Current Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  <SelectItem value="ON_TRACK">On Track</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Actual Achieved</Label>
              <Input type="number" placeholder="Enter value" />
            </div>
            
            <div className="space-y-2">
              <Label>Calculated Progress (%)</Label>
              <Input type="number" placeholder="0-100" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes / Comments</Label>
            <Textarea placeholder="Explain your progress, blockers, or any context..." className="h-24" />
          </div>

          <div className="pt-4">
            <Button className="w-full">Submit Check-in</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
