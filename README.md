# 📋 Student Task Manager

A modern, production-quality full-stack web application for students to manage their tasks. Built as a capstone project for WD401 – Full Stack Web Application with Node.js & Express.js.

---

## 📖 Project Description

Student Task Manager is a secure, session-authenticated productivity application where users can create an account, log in, and manage their personal tasks through a clean and professional dashboard. All data is persisted in MongoDB — no dummy data or hardcoded values.

---

## ✨ Features

- **User Authentication** – Signup, Login, and Logout with secure sessions
- **Password Security** – bcrypt hashing (12 salt rounds), never plain-text
- **Duplicate Email Prevention** – Unique email enforcement at both DB and application level
- **Personal Dashboard** – Greeting, real-time task stats, and task list
- **Task Creation** – Add tasks with title and creation timestamp
- **Task Completion** – Toggle tasks between pending and completed
- **Task Deletion** – Delete tasks with confirmation
- **User-Scoped Data** – Users can only see and modify their own tasks
- **Responsive Design** – Works on desktop, tablet, and mobile
- **Professional UI** – Clean white + green design system, no gradients

---

## 🛠️ Tech Stack

| Layer          | Technology                      |
|----------------|----------------------------------|
| Runtime        | Node.js                          |
| Framework      | Express.js                       |
| Database       | MongoDB + Mongoose               |
| Templating     | EJS                              |
| Authentication | express-session + bcrypt         |
| Session Store  | connect-mongo (MongoDB sessions) |
| Config         | dotenv                           |
| Styling        | Vanilla CSS (Google Fonts: Inter)|

---

## 📁 Project Structure

```
student-task-manager/
│
├── models/
│   ├── User.js          # User schema with bcrypt pre-save hook
│   └── Task.js          # Task schema with userId reference
│
├── routes/
│   ├── auth.js          # Login, Signup, Logout routes
│   └── tasks.js         # Dashboard + Task CRUD routes
│
├── middleware/
│   └── auth.js          # requireLogin middleware
│
├── views/
│   ├── login.ejs        # Login page
│   ├── signup.ejs       # Signup page
│   ├── dashboard.ejs    # Main dashboard
│   └── 404.ejs          # 404 error page
│
├── public/
│   ├── css/
│   │   └── style.css    # Complete stylesheet
│   └── js/
│       ├── auth.js      # Password toggle JS
│       └── dashboard.js # Task form validation JS
│
├── .env                 # Environment variables (NOT committed)
├── .env.example         # Environment variables template
├── .gitignore           # Ignores node_modules and .env
├── server.js            # Express app entry point
├── package.json         # Project metadata and scripts
└── README.md            # This file
```

---

## ⚙️ Installation

### Prerequisites

- Node.js (v18 or later recommended)
- MongoDB (local install or MongoDB Atlas)
- npm

### Steps

1. **Clone the repository**

```bash
git clone <your-repository-url>
cd student-task-manager
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```
MONGO_URI=mongodb://localhost:27017/student_task_manager
SESSION_SECRET=your_super_secret_session_key_change_this_in_production
PORT=3000
```

---

## 🍃 MongoDB Setup

### Option A – Local MongoDB

Make sure MongoDB is installed and running:

```bash
mongod
```

Use the default URI:
```
MONGO_URI=mongodb://localhost:27017/student_task_manager
```

### Option B – MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get your connection string
3. Replace the MONGO_URI in `.env`:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/student_task_manager
```

---

## 🚀 How to Run

```bash
npm start
```

Or equivalently:

```bash
node server.js
```

The application will be available at:

```
http://localhost:3000
```

---

## 🔐 Authentication Flow

1. **Signup** – User fills name, email, password, confirm password → `POST /signup`
   - Validates all fields
   - Checks for duplicate email in MongoDB
   - Hashes password with bcrypt (12 rounds)
   - Creates user in MongoDB
   - Creates session and redirects to dashboard

2. **Login** – User enters email and password → `POST /login`
   - Finds user by email in MongoDB
   - Compares entered password with bcrypt hash
   - Creates session (`req.session.userId`)
   - Redirects to dashboard

3. **Session Protection** – `requireLogin` middleware checks `req.session.userId`
   - Applied to `/dashboard`, task creation, toggle, and deletion routes
   - Unauthenticated requests redirect to `/login`

4. **Logout** – `POST /logout`
   - Destroys the session
   - Redirects to login page

---

## 📡 API Routes

### Authentication

| Method | Route     | Description                        | Auth Required |
|--------|-----------|------------------------------------|---------------|
| GET    | /         | Redirect to login or dashboard     | No            |
| GET    | /login    | Render login page                  | No            |
| POST   | /login    | Process login credentials          | No            |
| GET    | /signup   | Render signup page                 | No            |
| POST   | /signup   | Process signup form                | No            |
| POST   | /logout   | Destroy session and logout         | Yes           |

### Dashboard & Tasks

| Method | Route                  | Description                        | Auth Required |
|--------|------------------------|------------------------------------|---------------|
| GET    | /dashboard             | Render dashboard with tasks/stats  | Yes           |
| POST   | /tasks                 | Create a new task                  | Yes           |
| POST   | /tasks/:id/toggle      | Toggle task completion status      | Yes           |
| POST   | /tasks/:id/delete      | Delete a task                      | Yes           |

---

## 🔒 Security Measures

- ✅ Passwords hashed with bcrypt (12 salt rounds) — never stored plain-text
- ✅ Session-based authentication using express-session
- ✅ Session stored in MongoDB via connect-mongo
- ✅ All sensitive routes protected by `requireLogin` middleware
- ✅ All task operations scoped to `req.session.userId` — users cannot access others' tasks
- ✅ Environment variables via dotenv — secrets never hardcoded
- ✅ `.env` listed in `.gitignore` — never committed
- ✅ Duplicate email prevention with both Mongoose unique index and application-level check
- ✅ Input validation on both client and server

---

## 📸 Screenshots

> _Add screenshots of the login, signup, and dashboard pages here after running the application._

---

## 🔮 Future Improvements

- [ ] Task due dates and reminders
- [ ] Task categories / labels
- [ ] Priority levels (High / Medium / Low)
- [ ] Drag-and-drop task reordering
- [ ] Email notifications
- [ ] Dark mode
- [ ] REST API with JWT for mobile clients
- [ ] Pagination for large task lists
- [ ] Search and filter tasks
- [ ] User profile editing / password change

---

## 📝 Environment Variables

| Variable        | Description                                   | Example                          |
|-----------------|-----------------------------------------------|----------------------------------|
| MONGO_URI       | MongoDB connection string                     | mongodb://localhost:27017/stm    |
| SESSION_SECRET  | Secret key for session encryption             | a_long_random_secret_string      |
| PORT            | Port the server runs on                       | 3000                             |

---

*Built with ❤️ for WD401 – Full Stack Web Application with Node.js & Express.js*
