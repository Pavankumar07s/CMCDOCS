import { prisma } from "@/lib/db"
import { hash } from 'bcryptjs'


async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log('🗑️ Clearing existing data...')
  await prisma.projectUser.deleteMany({})
  await prisma.assignment.deleteMany({})
  await prisma.roadSegment.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.ward.deleteMany({})

  // Create wards
  console.log('🏘️ Creating wards...')
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
        id: '3',
        name: 'Ward 3 - Sector 10',
        number: 3,
        description: 'Sector 10 residential area'
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

  // Create default users
  console.log('👥 Creating default users...')
  const users = await Promise.all([
    // Admin User
    prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@ambala.gov.in',
        password: await hash('admin123', 12),
        role: 'admin',
        department: 'administration',
        status: 'active',
        phone: '+91-9876543210'
      }
    }),
    // Project Manager
    prisma.user.create({
      data: {
        name: 'Rajesh Kumar',
        email: 'manager@ambala.gov.in',
        password: await hash('manager123', 12),
        role: 'project_manager',
        department: 'engineering',
        status: 'active',
        phone: '+91-9876543211'
      }
    }),
    // Engineer
    prisma.user.create({
      data: {
        name: 'Priya Sharma',
        email: 'engineer@ambala.gov.in',
        password: await hash('engineer123', 12),
        role: 'engineer',
        department: 'engineering',
        status: 'active',
        phone: '+91-9876543212'
      }
    }),
    // Inspector
    prisma.user.create({
      data: {
        name: 'Suresh Patel',
        email: 'inspector@ambala.gov.in',
        password: await hash('inspector123', 12),
        role: 'inspector',
        department: 'quality_control',
        status: 'active',
        phone: '+91-9876543213'
      }
    }),
    // Contractor
    prisma.user.create({
      data: {
        name: 'Vikram Singh',
        email: 'contractor@ambala.gov.in',
        password: await hash('contractor123', 12),
        role: 'contractor',
        department: 'external',
        status: 'active',
        phone: '+91-9876543214'
      }
    }),
    // Councilor
    prisma.user.create({
      data: {
        name: 'Anita Verma',
        email: 'councilor@ambala.gov.in',
        password: await hash('councilor123', 12),
        role: 'councilor',
        department: 'administration',
        status: 'active',
        phone: '+91-9876543215'
      }
    })
  ])

  // Create sample projects
  console.log('🏗️ Creating sample projects...')
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Sector 7 Main Road Reconstruction',
        tenderId: 'AMB-2024-1234',
        description: 'Complete reconstruction of the main road in Sector 7 including drainage systems, road widening, and street lighting installation.',
        status: 'in_progress',
        type: 'reconstruction',
        budget: 18500000, // 1.85 Cr
        spent: 12025000, // 1.20 Cr
        completion: 65,
        wardId: '12',
        startDate: new Date('2024-03-15'),
        expectedCompletion: new Date('2024-06-30'),
        users: {
          create: [
            { userId: users[1].id, role: 'project_manager' }, // Rajesh Kumar
            { userId: users[2].id, role: 'engineer' }, // Priya Sharma
            { userId: users[4].id, role: 'contractor' }, // Vikram Singh
          ]
        },
        location: {
          create: {
            lat: 30.3753,
            lng: 76.7821
          }
        }
      }
    }),
    prisma.project.create({
      data: {
        name: 'Ambala Cantt Bypass Extension',
        tenderId: 'AMB-2024-1235',
        description: 'Extension of the existing bypass road in Cantonment area to reduce traffic congestion.',
        status: 'planning',
        type: 'new',
        budget: 32000000, // 3.20 Cr
        spent: 0,
        completion: 0,
        wardId: '5',
        users: {
          create: [
            { userId: users[1].id, role: 'project_manager' },
            { userId: users[2].id, role: 'engineer' },
          ]
        },
        location: {
          create: {
            lat: 30.3596,
            lng: 76.8378
          }
        }
      }
    }),
    prisma.project.create({
      data: {
        name: 'Sector 10 Internal Roads',
        tenderId: 'AMB-2024-1237',
        description: 'Comprehensive road improvement project for internal roads in Sector 10.',
        status: 'completed',
        type: 'repair',
        budget: 12000000, // 1.20 Cr
        spent: 11800000, // 1.18 Cr
        completion: 100,
        wardId: '3',
        startDate: new Date('2024-01-10'),
        expectedCompletion: new Date('2024-03-15'),
        actualCompletion: new Date('2024-03-12'),
        users: {
          create: [
            { userId: users[1].id, role: 'project_manager' },
            { userId: users[2].id, role: 'engineer' },
            { userId: users[4].id, role: 'contractor' },
          ]
        },
        location: {
          create: {
            lat: 30.3845,
            lng: 76.7654
          }
        }
      }
    })
  ])

  console.log('✅ Database seeding completed successfully!')
  console.log(`📊 Created:`)
  console.log(`   - ${wards.length} wards`)
  console.log(`   - ${users.length} users`)
  console.log(`   - ${projects.length} projects`)
  
  console.log('\n🔑 Default login credentials:')
  console.log('Admin: admin@ambala.gov.in / admin123')
  console.log('Project Manager: manager@ambala.gov.in / manager123')
  console.log('Engineer: engineer@ambala.gov.in / engineer123')
  console.log('Inspector: inspector@ambala.gov.in / inspector123')
  console.log('Contractor: contractor@ambala.gov.in / contractor123')
  console.log('Councilor: councilor@ambala.gov.in / councilor123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })