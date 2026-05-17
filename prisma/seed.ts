import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // Clean up dependent records first
  await prisma.checkInComment.deleteMany()
  await prisma.checkIn.deleteMany()
  await prisma.goalAssignment.deleteMany()
  await prisma.goal.deleteMany()
  await prisma.approval.deleteMany()
  await prisma.goalSheet.deleteMany()
  await prisma.sharedGoal.deleteMany()
  await prisma.cycle.deleteMany()
  
  // Create/Ensure Departments and Teams
  let department = await prisma.department.findFirst({
    where: { name: 'Engineering' },
    include: { teams: true }
  })

  if (!department) {
    department = await prisma.department.create({
      data: {
        name: 'Engineering',
        teams: {
          create: [{ name: 'Frontend' }, { name: 'Backend' }]
        }
      },
      include: { teams: true }
    })
  }

  // Create Admin with upsert
  const admin = await prisma.user.upsert({
    where: { email: 'admin@atomquest.com' },
    update: {
      name: 'Admin User',
      password: passwordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'Admin User',
      email: 'admin@atomquest.com',
      password: passwordHash,
      role: 'ADMIN',
    }
  })

  // Create Manager (L1) with upsert
  const manager = await prisma.user.upsert({
    where: { email: 'manager@atomquest.com' },
    update: {
      name: 'Manager User',
      password: passwordHash,
      role: 'MANAGER',
      departmentId: department.id,
      teamId: department.teams[0].id
    },
    create: {
      name: 'Manager User',
      email: 'manager@atomquest.com',
      password: passwordHash,
      role: 'MANAGER',
      departmentId: department.id,
      teamId: department.teams[0].id
    }
  })

  // Create Employee with upsert
  const employee = await prisma.user.upsert({
    where: { email: 'employee@atomquest.com' },
    update: {
      name: 'Employee User',
      password: passwordHash,
      role: 'EMPLOYEE',
      departmentId: department.id,
      teamId: department.teams[0].id,
      managerId: manager.id
    },
    create: {
      name: 'Employee User',
      email: 'employee@atomquest.com',
      password: passwordHash,
      role: 'EMPLOYEE',
      departmentId: department.id,
      teamId: department.teams[0].id,
      managerId: manager.id
    }
  })

  // Create Cycle
  const currentYear = new Date().getFullYear()
  const cycle = await prisma.cycle.create({
    data: {
      name: `FY ${currentYear}-${currentYear + 1}`,
      startDate: new Date(`${currentYear}-04-01`),
      endDate: new Date(`${currentYear + 1}-03-31`),
      isActive: true
    }
  })

  // Create a Shared Goal
  const sharedGoal = await prisma.sharedGoal.create({
    data: {
      cycleId: cycle.id,
      thrustArea: 'Engineering Excellence',
      title: 'Reduce Bug Rate',
      description: 'Decrease critical bugs in production by 20%',
      uomType: 'PERCENTAGE_MAX',
      targetValue: 20,
      deadline: new Date(`${currentYear}-12-31`)
    }
  })

  // Create a Goal Sheet for Employee
  const goalSheet = await prisma.goalSheet.create({
    data: {
      userId: employee.id,
      cycleId: cycle.id,
      status: 'APPROVED',
    }
  })

  // Add Goals
  const goal1 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet.id,
      thrustArea: 'Delivery',
      title: 'Complete Portal Frontend',
      description: 'Build and deploy the Next.js frontend',
      uomType: 'TIMELINE',
      weightage: 50,
      deadline: new Date(`${currentYear}-10-31`)
    }
  })

  const goal2 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet.id,
      thrustArea: 'Engineering Excellence',
      title: 'Reduce Bug Rate',
      description: 'Decrease critical bugs in production by 20%',
      uomType: 'PERCENTAGE_MAX',
      targetValue: 20,
      weightage: 50,
      deadline: new Date(`${currentYear}-12-31`),
      sharedGoalId: sharedGoal.id
    }
  })

  // Create CheckIn
  await prisma.checkIn.create({
    data: {
      goalId: goal1.id,
      userId: employee.id,
      quarter: 1,
      actualAchieved: null,
      status: 'ON_TRACK',
      progress: 50,
      notes: 'Frontend skeleton completed.'
    }
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
