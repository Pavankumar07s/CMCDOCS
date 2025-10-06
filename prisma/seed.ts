import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.ward.deleteMany({})

  // Create wards
  const wards = await Promise.all([
    prisma.ward.create({
      data: {
        id: '1',
        name: 'Ward 1 - Central',
        number: 1,
        description: 'Central ward of Ambala'
      }
    }),
    prisma.ward.create({
      data: {
        id: '5',
        name: 'Ward 5 - Cantt',
        number: 5,
        description: 'Cantonment area'
      }
    }),
    prisma.ward.create({
      data: {
        id: '8',
        name: 'Ward 8 - Mahesh Nagar',
        number: 8,
        description: 'Mahesh Nagar residential area'
      }
    }),
    prisma.ward.create({
      data: {
        id: '12',
        name: 'Ward 12 - Sector 7',
        number: 12,
        description: 'Sector 7 residential and commercial area'
      }
    })
  ])

  console.log('Seeded wards:', wards)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })