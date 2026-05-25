# Team Task Manager

Team Task Manager is a full-stack web application designed to help teams collaborate efficiently by managing projects and tasks in one centralized platform. The application allows users to create projects, assign tasks, track progress, and manage team workflows with role-based access control for admins and members. It provides a modern and responsive interface along with secure authentication, real-time task management features, analytics dashboards, and productivity tracking tools. Built using the MERN stack with TypeScript, the project focuses on scalability, clean architecture, and a seamless user experience across devices.

---

## Demo
🚀 You can view the live demo of the project here: [Click me](https://task-manager-frontend-qb06.onrender.com)

---

## Features

- Secure signup, login, logout, and `/me` session checks
- JWT support with Bearer token and HTTP-only cookie compatibility
- Admin and member roles enforced on the backend
- Project creation, project lists, project detail views, members, and progress
- Task creation, assignment, filtering, search, Kanban status updates, and delete API
- Dashboard cards and Recharts analytics for status, priority, productivity, and recent activity
- Responsive sidebar shell for desktop, tablet, and mobile
- Zod validation on frontend and backend
- Helmet, CORS, rate limiting, global API errors, and Mongoose data modeling

---

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Axios, React Hook Form, Zod, Zustand, Recharts, lucide-react
- Backend: Node.js, Express.js, TypeScript, Mongoose
- Database: MongoDB
- Deployment: Render for backend, database and frontend

---

## Project Structure

```bash
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    validators/
frontend/
  src/
    api/
    components/
    layouts/
    pages/
    routes/
    store/
    styles/
    types/
    utils/
```

---

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create backend environment:

```bash
cp backend/.env.example backend/.env
```

3. Set `MONGO_URI` and `JWT_SECRET` in `backend/.env`.

Optional local MongoDB with Docker:

```bash
docker compose up -d
```

4. Create frontend environment:

```bash
cp frontend/.env.example frontend/.env
```

5. Seed the MongoDB database:

```bash
npm run seed
```

6. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

Seed users:

- `admin@teamtask.dev` / `password123`
- `member@teamtask.dev` / `password123`

---

## Environment Variables

Backend:

```env
PORT=5000
MONGO_URI="mongodb://127.0.0.1:27017/team_task_manager"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
```

Frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

- Login page
- Dashboard analytics
- Project details
- Kanban task board
- Team directory

---

## Licence
This project is licenced under the MIT Licence.
