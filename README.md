# Task Management System

A full-stack Task Management System built with:

- **Backend**: Node.js · TypeScript · Express · Prisma ORM · SQLite · JWT Auth
- **Frontend**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · React Query

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/) (LTS recommended)
- npm 9+ (comes with Node.js)

---

## Project Structure

```
Internshala_Assignment/
├── backend/          # Express REST API
└── frontend/         # Next.js web app
```

---

## Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client and run migrations (creates dev.db)
npm run prisma:generate
npm run prisma:migrate   # enter a migration name e.g. "init"

# Start development server (port 4000)
npm run dev
```

The API will be running at **http://localhost:4000**

### API Endpoints

| Method | Path                | Auth | Description                                |
| ------ | ------------------- | ---- | ------------------------------------------ |
| POST   | `/auth/register`    | ❌   | Register new user                          |
| POST   | `/auth/login`       | ❌   | Login                                      |
| POST   | `/auth/refresh`     | ❌   | Refresh access token                       |
| POST   | `/auth/logout`      | ❌   | Logout                                     |
| GET    | `/auth/me`          | ✅   | Get current user                           |
| GET    | `/tasks`            | ✅   | List tasks (paginated, filtered, searched) |
| POST   | `/tasks`            | ✅   | Create task                                |
| GET    | `/tasks/:id`        | ✅   | Get single task                            |
| PATCH  | `/tasks/:id`        | ✅   | Update task                                |
| DELETE | `/tasks/:id`        | ✅   | Delete task                                |
| PATCH  | `/tasks/:id/toggle` | ✅   | Cycle task status                          |

**GET /tasks** query parameters:

- `page` (default: 1), `limit` (default: 10)
- `status`: `PENDING` | `IN_PROGRESS` | `COMPLETED`
- `priority`: `LOW` | `MEDIUM` | `HIGH`
- `search`: search by title/description
- `sortBy`: `createdAt` | `updatedAt` | `dueDate` | `title` | `priority`
- `order`: `asc` | `desc`

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev
```

The app will be running at **http://localhost:3000**

---

## Environment Variables

### Backend (`.env`)

```
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET="change-this-in-production"
JWT_REFRESH_SECRET="change-this-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
```

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Features

### Authentication

- Register and Login with email + password
- Passwords hashed with **bcrypt** (12 rounds)
- **JWT Access Tokens** (15 min) + **Refresh Tokens** (7 days)
- Automatic token refresh on 401 responses
- Secure logout (invalidates refresh token)

### Task Management

- Create, Read, Update, Delete tasks
- Toggle task status: `PENDING → IN_PROGRESS → COMPLETED → PENDING`
- Task fields: title, description, status, priority, due date
- Pagination, status/priority filtering, full-text search in dashboard
- Overdue task highlighting

### Frontend

- Responsive design (mobile + desktop)
- Toast notifications for all operations
- Loading states and error handling
- React Query for server-state caching
