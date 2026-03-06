# Market Watchdog

Market Watchdog is a competitive intelligence and company monitoring platform built as a backend university project. It focuses on tracking company metrics, monitoring promotions, comparing competitors, and generating market alerts.

## Tech Stack
- **Node.js & Express.js**: Backend framework
- **Prisma ORM & SQLite**: Database (local, no external setup required)
- **EJS**: Server-side templating engine
- **Bootstrap 5**: UI framework
- **JWT**: Authentication

## Features
1. **Dashboard**: Overview of total companies, alerts, promotions, comparisons, and recent alerts.
2. **Companies**: View, search, and filter a list of 100 seeded companies.
3. **Company Detail**: View specific metrics, promotions, alerts, and historical snapshots for a company.
4. **Compare**: Select two companies to compare their metrics (revenue, traffic, growth score, etc.). Results are saved to history.
5. **Alerts**: View all market alerts generated for tracked companies.
6. **Admin Panel**: Manage users (block/unblock), view comparison history, and monitor user activity logs.
7. **Authentication**: Register, login, and role-based access control (USER / ADMIN).

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Run Database Migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the Database**
   ```bash
   npm run seed
   ```
   *(This generates 100 companies, along with users, promotions, alerts, snapshots, and activity logs.)*

5. **Start the Server**
   ```bash
   npm run dev
   ```
   *(or `npm start`)*

## Accessing the Application

- **URL**: [http://localhost:3000](http://localhost:3000)

### Default Credentials

**Admin Accounts:**
- `admin1@marketwatchdog.com` / `123456`
- `admin2@marketwatchdog.com` / `123456`

**Sample User Account:**
- `alice@example.com` / `password123`
*(Or you can register a new user from the landing page).*
