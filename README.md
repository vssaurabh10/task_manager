# Team Task Manager

A full-stack ERP-style team task management portal built with React, TypeScript, Express, MongoDB, Mongoose, JWT authentication, role-based access control, dashboard analytics, and a responsive operations UI.

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
