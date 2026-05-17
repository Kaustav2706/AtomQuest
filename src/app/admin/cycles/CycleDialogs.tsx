"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, Edit2, Power, Trash2, Copy, Clock, Calendar } from 'lucide-react'
import { toggleCycleStatus, updateCycle, deleteCycle, duplicateCycle } from './actions'

interface Cycle {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  submissionDeadline: string | null
  approvalDeadline: string | null
}

export function CycleActionsCell({ cycle }: { cycle: Cycle }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Format dates for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not Set'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }

  // Format dates for HTML input type="date"
  const formatDateInput = (dateStr: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toISOString().split('T')[0]
  }

  const handleToggleStatus = async () => {
    await toggleCycleStatus(cycle.id, cycle.isActive)
    setIsOpen(false)
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${cycle.name}?`)) {
      await deleteCycle(cycle.id)
    }
  }

  const handleDuplicate = async () => {
    await duplicateCycle(cycle.id)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await updateCycle(cycle.id, formData)
    setIsEditing(false)
    setIsOpen(false)
  }

  return (
    <div className="flex justify-end gap-1">
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) setIsEditing(false)
      }}>
        <DialogTrigger render={<Button variant="ghost" size="icon" title="View Details"><Eye className="w-4 h-4" /></Button>} />
        <DialogContent className="max-w-3xl">
          {isEditing ? (
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>Edit {cycle.name}</DialogTitle>
                <DialogDescription>Modify dates and constraints for this cycle.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4 text-left">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Cycle Name</Label>
                  <Input id="name" name="name" defaultValue={cycle.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Cycle Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" defaultValue={formatDateInput(cycle.startDate)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Cycle End Date</Label>
                  <Input id="endDate" name="endDate" type="date" defaultValue={formatDateInput(cycle.endDate)} required />
                </div>
                
                <div className="col-span-2 pt-4 border-t">
                  <h4 className="text-sm font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Window Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="submissionDeadline">Goal Submission Deadline</Label>
                      <Input id="submissionDeadline" name="submissionDeadline" type="date" defaultValue={formatDateInput(cycle.submissionDeadline)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="approvalDeadline">Manager Approval Deadline</Label>
                      <Input id="approvalDeadline" name="approvalDeadline" type="date" defaultValue={formatDateInput(cycle.approvalDeadline)} />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Configuration</Button>
              </DialogFooter>
            </form>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{cycle.name} - Detailed Configuration</DialogTitle>
                <DialogDescription>Full timeline and constraint settings for this performance cycle.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-8 py-6 text-left">
                <div className="space-y-4">
                  <h4 className="font-bold border-b pb-1 text-sm flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-500" /> Cycle Duration</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Start Date:</span> <span className="font-medium text-slate-900">{formatDate(cycle.startDate)}</span></div>
                    <div className="flex justify-between"><span>End Date:</span> <span className="font-medium text-slate-900">{formatDate(cycle.endDate)}</span></div>
                  </div>

                  <h4 className="font-bold border-b pb-1 text-sm flex items-center gap-1.5 pt-2"><Clock className="w-4 h-4 text-slate-500" /> Submission Windows</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Goal Setting Open:</span> <span className="font-medium text-slate-900">{formatDate(cycle.startDate)}</span></div>
                    <div className="flex justify-between"><span>Goal Setting Close:</span> <span className="font-medium text-slate-900">{formatDate(cycle.submissionDeadline)}</span></div>
                    <div className="flex justify-between"><span>Manager Approval By:</span> <span className="font-medium text-slate-900">{formatDate(cycle.approvalDeadline)}</span></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold border-b pb-1 text-sm">Quarterly Check-ins</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between font-medium text-slate-900"><span>Q1 Window:</span> <span>Jul 01 - Jul 15</span></div>
                    <div className="flex justify-between font-medium text-slate-900"><span>Q2 Window:</span> <span>Oct 01 - Oct 15</span></div>
                    <div className="flex justify-between font-medium text-slate-900"><span>Q3 Window:</span> <span>Jan 01 - Jan 15</span></div>
                    <div className="flex justify-between font-medium text-slate-900"><span>Q4 Window:</span> <span>Apr 01 - Apr 15</span></div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4" /> Edit Config
                </Button>
                <Button 
                  onClick={handleToggleStatus}
                  className="gap-2"
                  variant={cycle.isActive ? 'destructive' : 'default'}
                >
                  <Power className="w-4 h-4" /> {cycle.isActive ? 'Deactivate Cycle' : 'Activate Cycle'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Button variant="ghost" size="icon" title="Duplicate" onClick={handleDuplicate}><Copy className="w-4 h-4" /></Button>
      <Button variant="ghost" size="icon" className="text-red-600" title="Delete" onClick={handleDelete}><Trash2 className="w-4 h-4" /></Button>
    </div>
  )
}
