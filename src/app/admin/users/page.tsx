import { prisma } from '@/lib/prisma'
import UserDirectoryClient from './UserDirectoryClient'

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    include: {
      department: true,
      manager: true
    }
  })

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  })

  const managers = await prisma.user.findMany({
    where: {
      role: 'MANAGER'
    },
    orderBy: { name: 'asc' }
  })

  return (
    <UserDirectoryClient 
      initialUsers={users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        departmentId: u.departmentId,
        teamId: u.teamId,
        managerId: u.managerId,
        department: u.department ? { id: u.department.id, name: u.department.name } : null,
        manager: u.manager ? { id: u.manager.id, name: u.manager.name } : null
      }))}
      departments={departments.map(d => ({ id: d.id, name: d.name }))}
      managers={managers.map(m => ({ id: m.id, name: m.name }))}
    />
  )
}
