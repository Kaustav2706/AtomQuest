'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createGoalAction(data: {
  thrustArea: string
  title: string
  uomType: string
  targetValue: number | null
  weightage: number
  deadline: string | null
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const userId = session.user.id

  // Find active cycle
  const activeCycle = await prisma.cycle.findFirst({
    where: { isActive: true }
  })

  if (!activeCycle) {
    throw new Error('No active performance cycle found.')
  }

  // Find or create active draft goal sheet
  let goalSheet = await prisma.goalSheet.findFirst({
    where: { userId, cycleId: activeCycle.id }
  })

  if (!goalSheet) {
    goalSheet = await prisma.goalSheet.create({
      data: {
        userId,
        cycleId: activeCycle.id,
        status: 'DRAFT'
      }
    })
  } else if (goalSheet.status !== 'DRAFT' && goalSheet.status !== 'RETURNED') {
    throw new Error('Goal sheet is locked and cannot be edited.')
  }

  // Create Goal
  await prisma.goal.create({
    data: {
      goalSheetId: goalSheet.id,
      thrustArea: data.thrustArea,
      title: data.title,
      uomType: data.uomType,
      targetValue: data.targetValue,
      weightage: data.weightage,
      deadline: data.deadline ? new Date(data.deadline) : null
    }
  })

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CREATE',
      entity: 'Goal',
      entityId: goalSheet.id,
      reason: `Added new goal "${data.title}" under ${data.thrustArea} with weightage ${data.weightage}%`
    }
  })

  revalidatePath('/employee/goals')
}

export async function submitGoalSheetAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const userId = session.user.id

  // Find active cycle
  const activeCycle = await prisma.cycle.findFirst({
    where: { isActive: true }
  })

  if (!activeCycle) {
    throw new Error('No active performance cycle found.')
  }

  // Find active draft goal sheet
  const goalSheet = await prisma.goalSheet.findFirst({
    where: { userId, cycleId: activeCycle.id },
    include: { goals: true }
  })

  if (!goalSheet) {
    throw new Error('No goal sheet found to submit.')
  }

  if (goalSheet.status !== 'DRAFT' && goalSheet.status !== 'RETURNED') {
    throw new Error('Goal sheet is already submitted or approved.')
  }

  // Verify total weightage is exactly 100
  const totalWeightage = goalSheet.goals.reduce((sum, g) => sum + g.weightage, 0)
  if (totalWeightage !== 100) {
    throw new Error(`Total goal weightage must be exactly 100%. Currently it is ${totalWeightage}%.`)
  }

  // Update status to SUBMITTED
  await prisma.goalSheet.update({
    where: { id: goalSheet.id },
    data: { status: 'SUBMITTED' }
  })

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'UPDATE',
      entity: 'GoalSheet',
      entityId: goalSheet.id,
      reason: `Submitted goal sheet for approval with ${goalSheet.goals.length} goals (Total Weight: 100%)`
    }
  })

  revalidatePath('/employee/goals')
}

export async function deleteGoalAction(goalId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const userId = session.user.id

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { goalSheet: true }
  })

  if (!goal) {
    throw new Error('Goal not found')
  }

  if (goal.goalSheet.userId !== userId) {
    throw new Error('Unauthorized')
  }

  if (goal.goalSheet.status !== 'DRAFT' && goal.goalSheet.status !== 'RETURNED') {
    throw new Error('Goal sheet is locked and cannot be edited.')
  }

  // Fallback explicit deletions to guarantee 100% SQLite cascade safety
  await prisma.checkIn.deleteMany({
    where: { goalId }
  })

  await prisma.goalAssignment.deleteMany({
    where: { goalId }
  })

  await prisma.goal.delete({
    where: { id: goalId }
  })

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'DELETE',
      entity: 'Goal',
      entityId: goal.goalSheetId,
      reason: `Deleted goal "${goal.title}" from goal sheet`
    }
  })

  revalidatePath('/employee/goals')
}

export async function updateGoalAction(
  goalId: string,
  data: {
    thrustArea: string
    title: string
    uomType: string
    targetValue: number | null
    weightage: number
    deadline: string | null
  }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const userId = session.user.id

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { goalSheet: true }
  })

  if (!goal) {
    throw new Error('Goal not found')
  }

  if (goal.goalSheet.userId !== userId) {
    throw new Error('Unauthorized')
  }

  if (goal.goalSheet.status !== 'DRAFT' && goal.goalSheet.status !== 'RETURNED') {
    throw new Error('Goal sheet is locked and cannot be edited.')
  }

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      thrustArea: data.thrustArea,
      title: data.title,
      uomType: data.uomType,
      targetValue: data.targetValue,
      weightage: data.weightage,
      deadline: data.deadline ? new Date(data.deadline) : null
    }
  })

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'UPDATE',
      entity: 'Goal',
      entityId: goal.goalSheetId,
      reason: `Updated goal "${data.title}" under ${data.thrustArea}`
    }
  })

  revalidatePath('/employee/goals')
}

