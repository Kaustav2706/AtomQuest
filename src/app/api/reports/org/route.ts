import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Fetch users with their department, manager, and goal sheets/checkins
  const users = await prisma.user.findMany({
    include: {
      department: true,
      manager: true,
      goalSheets: {
        include: {
          goals: {
            include: {
              checkIns: true
            }
          }
        }
      }
    }
  })

  // Build CSV content
  const headers = [
    'Employee Name',
    'Email',
    'Role',
    'Department',
    'Manager',
    'Goal Sheet Status',
    'Goals Count',
    'Avg Q1 Progress (%)'
  ]

  const csvRows = [headers.join(',')]

  for (const user of users) {
    const activeSheet = user.goalSheets[0] // Get latest sheet
    const goalsCount = activeSheet?.goals?.length || 0
    
    let totalProgress = 0
    let totalGoalsWithCheckins = 0
    
    if (activeSheet) {
      for (const goal of activeSheet.goals) {
        const q1Checkin = goal.checkIns.find(c => c.quarter === 1)
        if (q1Checkin) {
          totalProgress += q1Checkin.progress
          totalGoalsWithCheckins++
        }
      }
    }

    const avgProgress = totalGoalsWithCheckins > 0 
      ? (totalProgress / totalGoalsWithCheckins).toFixed(1) 
      : '0.0'

    const row = [
      `"${user.name.replace(/"/g, '""')}"`,
      `"${user.email.replace(/"/g, '""')}"`,
      user.role,
      user.department?.name || 'Unassigned',
      user.manager?.name || 'None',
      activeSheet?.status || 'No Goal Sheet',
      goalsCount,
      `${avgProgress}%`
    ]
    csvRows.push(row.join(','))
  }

  const csvString = csvRows.join('\n')

  return new NextResponse(csvString, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="atomquest_organization_report.csv"'
    }
  })
}
