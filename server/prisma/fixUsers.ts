import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fix() {
  const passwordHash = await bcrypt.hash('Demo@1234', 10)

  const usersData = [
    {
      email: 'admin@elios.in',
      firstName: 'Arjun',
      lastName: 'Mehta',
      role: Role.ADMIN,
    },
    {
      email: 'staff1@elios.in',
      firstName: 'Priya',
      lastName: 'Sharma',
      role: Role.STAFF,
    },
    {
      email: 'client1@elios.in',
      firstName: 'Client',
      lastName: 'One',
      role: Role.CLIENT,
      companyName: 'Client One Company',
    },
    {
      email: 'client2@elios.in',
      firstName: 'Client',
      lastName: 'Two',
      role: Role.CLIENT,
      companyName: 'Client Two Company',
    },
  ]

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        isEmailVerified: true,
        isApproved: true,
        role: u.role,
      },
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isEmailVerified: true,
        isApproved: true,
      },
    })

    if (u.role === Role.CLIENT && u.companyName) {
      await prisma.client.upsert({
        where: { userId: user.id },
        update: {
          companyName: u.companyName,
        },
        create: {
          userId: user.id,
          companyName: u.companyName,
        },
      })
    }

    console.log('Upserted & fixed:', u.email)
  }

  await prisma.$disconnect()
  console.log('All users fixed!')
}

fix().catch(console.error)

