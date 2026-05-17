import { prisma } from '@/lib/prisma'
import AuditTrailClient from './AuditTrailClient'

export default async function AdminAudit() {
  const dbLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    include: { user: true }
  })

  // Sample logs to show if DB is empty for demo purposes
  const sampleLogs = [
    {
      id: 'sample-1',
      action: 'CREATE',
      entity: 'Cycle',
      user: { name: 'Admin User' },
      reason: 'Admin created FY 2026-2027 cycle',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 'sample-2',
      action: 'ASSIGN',
      entity: 'SharedGoal',
      user: { name: 'Admin User' },
      reason: 'Shared goal assigned to Engineering',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: 'sample-3',
      action: 'UNLOCK',
      entity: 'GoalSheet',
      user: { name: 'Admin User' },
      reason: 'Goal sheet unlocked for employee John Doe',
      timestamp: new Date(Date.now() - 14400000)
    },
    {
      id: 'sample-4',
      action: 'APPROVE',
      entity: 'GoalSheet',
      user: { name: 'Manager User' },
      reason: 'Manager approved goal sheet for Jane Smith',
      timestamp: new Date(Date.now() - 86400000)
    }
  ]

  const rawLogs = dbLogs.length > 0 ? dbLogs : sampleLogs

  // Serialize the logs for the Client Component (Dates to Strings)
  const serializedLogs = rawLogs.map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    user: log.user ? { name: log.user.name } : null,
    reason: log.reason,
    timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : new Date(log.timestamp).toISOString()
  }))

  return <AuditTrailClient initialLogs={serializedLogs} />
}
