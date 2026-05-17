'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Loader2 } from 'lucide-react'
import { submitGoalSheetAction } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SubmitButtonProps {
  isValidWeightage: boolean
}

export function SubmitButton({ isValidWeightage }: SubmitButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await submitGoalSheetAction()
      toast.success('Goal sheet submitted for approval!')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to submit goal sheet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant={isValidWeightage ? 'default' : 'secondary'} 
      disabled={!isValidWeightage || loading} 
      onClick={handleSubmit}
      className="gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
        </>
      ) : (
        <>
          <Send className="w-4 h-4" /> Submit for Approval
        </>
      )}
    </Button>
  )
}
