'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function provisionUser(formData: FormData) {
  const session = await getServerSession(authOptions)
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const departmentId = formData.get('departmentId') as string || null
  const managerId = formData.get('managerId') as string || null

  // Check email
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error('Email already in use')
  }

  const passwordHash = await bcrypt.hash('password123', 10)

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role,
      departmentId,
      managerId
    }
  })

  await prisma.auditLog.create({
    data: {
      userId: session?.user?.id,
      action: 'CREATE',
      entity: 'User',
      entityId: newUser.id,
      reason: `Provisioned new user identity: ${name} (${email}) as ${role}`,
    }
  })

  revalidatePath('/admin/users')
}

export async function updateUser(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const departmentId = formData.get('departmentId') as string || null
  const managerId = formData.get('managerId') as string || null

  const user = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      role,
      departmentId,
      managerId
    }
  })

  await prisma.auditLog.create({
    data: {
      userId: session?.user?.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      reason: `Updated user identity configuration: ${name} (${email})`,
    }
  })

  revalidatePath('/admin/users')
}

export async function revokeAccess(id: string) {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({ where: { id } })

  if (user) {
    try {
      // 1. Dissociate direct reports
      await prisma.user.updateMany({
        where: { managerId: id },
        data: { managerId: null }
      })

      // 2. Dissociate Audit Logs instead of deleting, to maintain history
      await prisma.auditLog.updateMany({
        where: { userId: id },
        data: { userId: null }
      })

      // 3. Delete comments
      await prisma.checkInComment.deleteMany({
        where: { userId: id }
      })

      // 4. Delete check-ins
      await prisma.checkIn.deleteMany({
        where: { userId: id }
      })

      // 5. Delete goals inside their goal sheets
      const sheets = await prisma.goalSheet.findMany({
        where: { userId: id }
      })
      const sheetIds = sheets.map(s => s.id)
      
      await prisma.goal.deleteMany({
        where: { goalSheetId: { in: sheetIds } }
      })

      // 6. Delete goal sheets
      await prisma.goalSheet.deleteMany({
        where: { userId: id }
      })

      // 7. Delete approvals given by this manager
      await prisma.approval.deleteMany({
        where: { managerId: id }
      })

      // 8. Delete notifications
      await prisma.notification.deleteMany({
        where: { userId: id }
      })

      // 9. Delete escalation logs
      await prisma.escalationLog.deleteMany({
        where: { userId: id }
      })

      // 10. Delete the user
      await prisma.user.delete({
        where: { id }
      })

      // Create audit log of deletion
      await prisma.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: 'DELETE',
          entity: 'User',
          entityId: id,
          reason: `Revoked access / deleted user identity: ${user.name} (${user.email})`,
        }
      })

    } catch (error: any) {
      console.error("Failed to revoke access:", error)
      throw new Error(`Failed to revoke access: ${error.message}`)
    }

    revalidatePath('/admin/users')
  }
}

export async function resetPassword(id: string) {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({ where: { id } })
  if (user) {
    const passwordHash = await bcrypt.hash('password123', 10)
    await prisma.user.update({
      where: { id },
      data: { password: passwordHash }
    })

    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: 'UPDATE',
        entity: 'User',
        entityId: id,
        reason: `Reset password for user identity: ${user.name} (${user.email})`,
      }
    })
  }
}
