# 🛣️ Ambala Road Management System

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-14+-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Prisma-6.6.0-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
</div>

<p align="center">
  <strong>A comprehensive web-based management system for tracking and managing road construction projects, contractors, and municipal operations in Ambala.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🌟 Features

### 🏗️ **Project Management Module**
- **Complete Project Lifecycle**: From planning to completion with status tracking
- **Project Types**: New construction, repair, widening, resurfacing, reconstruction
- **Budget Management**: Real-time budget tracking and expenditure monitoring
- **Milestone System**: Interactive checklists with progress tracking
- **Geographic Integration**: PostGIS-powered location tracking and visualization
- **Document Management**: Photo, video, and document uploads with categorization
- **Timeline Management**: Start dates, deadlines, and completion tracking

### 👥 **User Management System**
- **Role-Based Access Control**: Admin, Project Manager, Engineer, Inspector, Contractor, Councilor
- **Department Organization**: Engineering, Administration, Quality Control, Finance, External
- **Secure Authentication**: NextAuth.js with bcrypt password hashing
- **Activity Tracking**: Comprehensive audit trail for all user actions
- **Profile Management**: User preferences and notification settings

### 🚧 **Contractor Management**
- **Contractor Database**: Complete contractor profiles with contact information
- **Assignment System**: Link contractors to specific road segments
- **Conflict Detection**: Prevent overlapping assignments with spatial analysis
- **Performance Tracking**: Monitor contractor efficiency across projects
- **Timeline Management**: Track assignment durations and deadlines

### 🗺️ **Geographic Information System**
- **Interactive Maps**: Google Maps integration for project visualization
- **Spatial Analysis**: PostGIS-powered geometric queries and operations
- **Road Segment Management**: Detailed road geometry with length calculations
- **Assignment Visualization**: Visual representation of contractor territories
- **Ward-Based Organization**: Municipal ward integration for better governance

### 📊 **Analytics & Reporting**
- **Real-time Dashboards**: Role-specific dashboard views with KPIs
- **Progress Analytics**: Project completion rates and budget utilization
- **Ward Performance**: Comparative analysis across municipal wards
- **Export Capabilities**: PDF, Excel, and CSV report generation
- **Automated Reporting**: Scheduled report delivery via email

### 🔔 **Notification & Communication**
- **Multi-Channel Notifications**: Email, SMS, and in-app notifications
- **Event-Driven Alerts**: Milestone completion, deadline reminders, budget alerts
- **Feedback System**: Public feedback collection with priority management
- **Approval Workflows**: Multi-level approval system for critical operations

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

```bash
# Check Node.js version (required: 18.x or higher)
node --version

# Check PostgreSQL (required: 14.x or higher)
psql --version

# Install pnpm globally if not installed
npm install -g pnpm@10.8.0
```

### 1. 📥 Clone & Install

```bash
# Clone the repository
git clone https://github.com/Pavankumar07s/CMCDOCS.git
cd CMCDOCS

# Install dependencies
pnpm install
```

### 2. 🗄️ Database Setup

#### Install PostgreSQL with PostGIS

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib postgis postgresql-14-postgis-3
```

**macOS (Homebrew):**
```bash
brew install postgresql postgis
brew services start postgresql
```

**Windows:**
```bash
# Download and install from: https://www.postgresql.org/download/windows/
# Ensure PostGIS extension is included
```

#### Create Database

```bash
# Access PostgreSQL as superuser
sudo -u postgres psql

# Or on macOS/Windows
psql -U postgres

# Create database and user
CREATE DATABASE ambala_roads;
CREATE USER ambala_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ambala_roads TO ambala_admin;

# Connect to the database
\c ambala_roads

# Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

# Exit PostgreSQL
\q
```

### 3. ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://ambala_admin:your_secure_password@localhost:5432/ambala_roads?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-key-min-32-chars"

# Google Maps API (Get from: https://developers.google.com/maps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# AWS S3 Configuration (Optional - for file uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET_NAME="ambala-road-management"

# Email Configuration (Optional - for notifications)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@ambala.gov.in"

# Environment
NODE_ENV="development"
```

### 4. 🔧 Database Migration & Seeding

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev --name init

# Seed database with initial data
pnpm prisma db seed
```

### 5. 🏃‍♂️ Start Development Server

```bash
# Start the development server
pnpm dev
```

🎉 **Success!** Your application is now running at `http://localhost:3000`

### 6. 👤 Default Login Credentials

After seeding, use these credentials to login:

```
Admin User:
Email: admin@ambala.gov.in
Password: admin123

Project Manager:
Email: manager@ambala.gov.in
Password: manager123

Engineer:
Email: engineer@ambala.gov.in
Password: engineer123

Inspector:
Email: inspector@ambala.gov.in
Password: inspector123

Contractor:
Email: contractor@ambala.gov.in
Password: contractor123

Councilor:
Email: councilor@ambala.gov.in
Password: councilor123
```

---

## 🏗️ Project Structure

```
CMCAMBALA-pavanDev/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 admin/                    # Admin dashboard pages
│   ├── 📁 api/                      # API routes
│   │   ├── 📁 auth/                 # Authentication endpoints
│   │   ├── 📁 projects/             # Project management APIs
│   │   ├── 📁 assignments/          # Contractor assignment APIs
│   │   └── 📁 admin/                # Admin-only APIs
│   ├── 📁 projects/                 # Project pages
│   └── 📁 dashboard/                # Dashboard pages
├── 📁 components/                   # Reusable UI components
│   ├── 📁 ui/                       # Base UI components (shadcn/ui)
│   ├── 📄 map-interface.tsx         # Interactive map component
│   ├── 📄 user-management-table.tsx # User management interface
│   └── 📄 project-*                 # Project-related components
├── 📁 lib/                          # Utility libraries
│   ├── 📄 prisma.ts                 # Database client
│   ├── 📄 navigation.ts             # Route navigation helpers
│   └── 📄 auth.ts                   # Authentication utilities
├── 📁 types/                        # TypeScript type definitions
│   └── 📄 prisma.ts                 # Database model types
├── 📁 prisma/                       # Database schema and migrations
│   ├── 📄 schema.prisma             # Database schema
│   └── 📁 migrations/               # Database migrations
├── 📄 package.json                  # Project dependencies
├── 📄 tailwind.config.js            # Tailwind CSS configuration
├── 📄 next.config.js                # Next.js configuration
└── 📄 README.md                     # This file
```

---

## 🛠️ Technology Stack

<table>
<tr>
<td>

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4.17
- **UI Library**: Radix UI + shadcn/ui
- **Maps**: Google Maps API
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

</td>
<td>

### Backend
- **Runtime**: Node.js 18+
- **API**: Next.js API Routes
- **Database**: PostgreSQL 14+ with PostGIS
- **ORM**: Prisma 6.6.0
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 (optional)

</td>
</tr>
</table>

---

## 📡 API Documentation

### 🔐 Authentication

**POST `/api/auth/signin`**
```json
{
  "email": "user@ambala.gov.in",
  "password": "password123"
}
```

### 👥 User Management (Admin Only)

**GET `/api/admin/users`** - Fetch all users
**POST `/api/admin/users`** - Create new user
**PUT `/api/admin/users/[id]`** - Update user
**DELETE `/api/admin/users/[id]`** - Delete user

### 🏗️ Projects

**GET `/api/projects`** - Fetch projects with role-based filtering
**POST `/api/projects`** - Create new project (Admin/Manager)
**GET `/api/projects/[id]`** - Get project details
**PUT `/api/projects/[id]`** - Update project

### 🚧 Assignments

**GET `/api/assignments`** - Fetch contractor assignments
**POST `/api/assignments`** - Create assignment with conflict detection

---

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Variables for Production

```env
# Update these for production
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret-key"
DATABASE_URL="postgresql://user:pass@prod-db:5432/ambala_roads"
```

### Recommended Hosting

- **Vercel** (Recommended for Next.js applications)
- **AWS** (EC2 + RDS + S3)
- **DigitalOcean** App Platform
- **Railway** or **Render** for full-stack deployment

---

## 🔧 Development Commands

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
pnpm type-check            # Run TypeScript checks

# Database
pnpm prisma studio         # Open Prisma Studio
pnpm prisma migrate dev    # Run migrations in development
pnpm prisma migrate deploy # Deploy migrations to production
pnpm prisma db seed        # Seed database with initial data
pnpm prisma generate       # Generate Prisma client

# Dependencies
pnpm install               # Install all dependencies
pnpm update                # Update dependencies
pnpm audit                 # Audit for security vulnerabilities
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📋 Troubleshooting

<details>
<summary><strong>Common Issues</strong></summary>

### Database Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL if needed
sudo systemctl restart postgresql
```

### PostGIS Extension Error
```sql
-- Connect to your database and run:
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
pnpm dev -p 3001
```

### Dependencies Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

</details>

---

## 📄 License

This project is proprietary software developed for **Ambala Municipal Corporation**. All rights reserved.

---

## 👥 Support & Contact

- **Development Team**: [GitHub Issues](https://github.com/Pavankumar07s/CMCDOCS/issues)
- **Documentation**: [Project Wiki](https://github.com/Pavankumar07s/CMCDOCS/wiki)
- **Email**: support@ambala.gov.in

---

<div align="center">
  <p><strong>Built with ❤️ for Ambala Municipal Corporation</strong></p>
  <p>© 2024 Ambala Road Management System. All rights reserved.</p>
</div>
