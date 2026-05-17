'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createCycle(formData: FormData) {
  const session = await getServerSession(authOptions)
  const name = formData.get('name') as string
  const startDate = new Date(formData.get('startDate') as string)
  const endDate = new Date(formData.get('endDate') as string)
  const submissionDeadline = formData.get('submissionDeadline') ? new Date(formData.get('submissionDeadline') as string) : null
  const approvalDeadline = formData.get('approvalDeadline') ? new Date(formData.get('approvalDeadline') as string) : null

  const cycle = await prisma.cycle.create({
    data: { name, startDate, endDate, submissionDeadline, approvalDeadline, isActive: false }
  })

  await prisma.auditLog.create({
    data: {
      userId: session?.user?.id,
      action: 'CREATE',
      entity: 'Cycle',
      entityId: cycle.id,
      reason: `Created performance cycle: ${name}`,
    }
  })

  revalidatePath('/admin/cycles')
}

export async function toggleCycleStatus(id: string, currentStatus: boolean) {
  const session = await getServerSession(authOptions)
  const newStatus = !currentStatus

  if (newStatus) {
    // If activating, deactivate all other cycles
    await prisma.cycle.updateMany({
      where: { id: { not: id } },
      data: { isActive: false }
    })
  }

  const cycle = await prisma.cycle.update({
    where: { id },
    data: { isActive: newStatus }
  })

  await prisma.auditLog.create({
    data: {
      userId: session?.user?.id,
      action: newStatus ? 'ACTIVATE' : 'DEACTIVATE',
      entity: 'Cycle',
      entityId: id,
      reason: `${newStatus ? 'Activated' : 'Deactivated'} performance cycle: ${cycle.name}`,
    }
  })

  revalidatePath('/admin/cycles')
}

export async function updateCycle(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  const name = formData.get('name') as string
  const startDate = new Date(formData.get('startDate') as string)
  const endDate = new Date(formData.get('endDate') as string)
  const submissionDeadline = formData.get('submissionDeadline') ? new Date(formData.get('submissionDeadline') as string) : null
  const approvalDeadline = formData.get('approvalDeadline') ? new Date(formData.get('approvalDeadline') as string) : null

  const cycle = await prisma.cycle.update({
    where: { id },
    data: { name, startDate, endDate, submissionDeadline, approvalDeadline }
  })

  await prisma.auditLog.create({
    data: {
      userId: session?.user?.id,
      action: 'UPDATE',
      entity: 'Cycle',
      entityId: id,
      reason: `Updated performance cycle configuration: ${name}`,
    }
  })

  revalidatePath('/admin/cycles')
}

export async function deleteCycle(id: string) {
  const session = await getServerSession(authOptions)
  const cycle = await prisma.cycle.findUnique({ where: { id } })
  
  if (cycle) {
    await prisma.cycle.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: 'DELETE',
        entity: 'Cycle',
        entityId: id,
        reason: `Deleted performance cycle: ${cycle.name}`,
      }
    })

    revalidatePath('/admin/cycles')
  }
}

export async function duplicateCycle(id: string) {
  const session = await getServerSession(authOptions)
  const original = await prisma.cycle.findUnique({ where: { id } })
  if (original) {
    const copy = await prisma.cycle.create({
      data: {
        name: `${original.name} (Copy)`,
        startDate: original.startDate,
        endDate: original.endDate,
        submissionDeadline: original.submissionDeadline,
        approvalDeadline: original.approvalDeadline,
        isActive: false
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: 'CREATE',
        entity: 'Cycle',
        entityId: copy.id,
        reason: `Duplicated performance cycle: ${original.name}`,
      }
    })

    revalidatePath('/admin/cycles')
  }
}
