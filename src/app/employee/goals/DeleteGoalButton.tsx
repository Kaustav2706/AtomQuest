'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteGoalAction } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteGoalButtonProps {
  goalId: string
}

export function DeleteGoalButton({ goalId }: DeleteGoalButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return
    }

    setLoading(true)
    try {
      await deleteGoalAction(goalId)
      toast.success('Goal deleted successfully.')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to delete goal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50/50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  )
}
