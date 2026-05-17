'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'
import { updateGoalAction } from '../../actions'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

interface EditGoalFormProps {
  goal: {
    id: string
    thrustArea: string
    title: string
    uomType: string
    targetValue: number | null
    weightage: number
    deadline: string
  }
}

export function EditGoalForm({ goal }: EditGoalFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [thrustArea, setThrustArea] = useState(goal.thrustArea)
  const [title, setTitle] = useState(goal.title)
  const [uomType, setUomType] = useState(goal.uomType)
  const [targetValue, setTargetValue] = useState(goal.targetValue !== null ? String(goal.targetValue) : '')
  const [weightage, setWeightage] = useState(String(goal.weightage))
  const [deadline, setDeadline] = useState(goal.deadline)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!thrustArea || !title || !uomType || !weightage) {
      toast.error('Please fill in all required fields.')
      return
    }

    const weight = parseFloat(weightage)
    if (isNaN(weight) || weight <= 0 || weight > 100) {
      toast.error('Weightage must be a number between 1 and 100.')
      return
    }

    setLoading(true)
    try {
      await updateGoalAction(goal.id, {
        thrustArea,
        title,
        uomType,
        targetValue: targetValue ? parseFloat(targetValue) : null,
        weightage: weight,
        deadline: deadline || null
      })

      toast.success('Goal updated successfully!')
      router.push('/employee/goals')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to update goal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Edit Goal</h2>
          <p className="text-sm text-muted-foreground">Modify the target objectives for this cycle.</p>
        </div>
        <Link href="/employee/goals">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Cancel
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Specifications</CardTitle>
          <CardDescription>Adjust targeted parameters, weights, and deadlines.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="thrustArea">Thrust Area <span className="text-red-500">*</span></Label>
              <Input 
                id="thrustArea"
                placeholder="e.g. Engineering Excellence, Customer Success" 
                value={thrustArea}
                onChange={(e) => setThrustArea(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title"
                placeholder="e.g. Reduce critical bug rate in production" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="uomType">Unit of Measure (UoM) <span className="text-red-500">*</span></Label>
                <Select value={uomType} onValueChange={setUomType}>
                  <SelectTrigger id="uomType">
                    <SelectValue placeholder="Select measurement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUMERIC_MIN">Numeric (Min)</SelectItem>
                    <SelectItem value="NUMERIC_MAX">Numeric (Max)</SelectItem>
                    <SelectItem value="PERCENTAGE_MAX">Percentage (Max)</SelectItem>
                    <SelectItem value="TIMELINE">Timeline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetValue">Target Value</Label>
                <Input 
                  id="targetValue"
                  type="number" 
                  step="any"
                  placeholder="e.g. 20" 
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weightage">Weightage (%) <span className="text-red-500">*</span></Label>
                <Input 
                  id="weightage"
                  type="number" 
                  min="1"
                  max="100"
                  placeholder="e.g. 25" 
                  value={weightage}
                  onChange={(e) => setWeightage(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Target Deadline</Label>
                <Input 
                  id="deadline"
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button className="w-full gap-2 h-11" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
