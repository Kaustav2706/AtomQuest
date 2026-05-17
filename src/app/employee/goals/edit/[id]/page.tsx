import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import { EditGoalForm } from './EditGoalForm'

interface EditGoalPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditGoalPage({ params }: EditGoalPageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }

  const goal = await prisma.goal.findUnique({
    where: { id: resolvedParams.id },
    include: { goalSheet: true }
  })

  if (!goal || goal.goalSheet.userId !== session.user.id) {
    notFound()
  }

  if (goal.goalSheet.status !== 'DRAFT' && goal.goalSheet.status !== 'RETURNED') {
    redirect('/employee/goals')
  }

  // Serialize goal to safely pass to client component
  const serializedGoal = {
    id: goal.id,
    thrustArea: goal.thrustArea,
    title: goal.title,
    uomType: goal.uomType,
    targetValue: goal.targetValue,
    weightage: goal.weightage,
    deadline: goal.deadline ? goal.deadline.toISOString().split('T')[0] : ''
  }

  return <EditGoalForm goal={serializedGoal} />
}
