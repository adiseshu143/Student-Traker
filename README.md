# 📋 Student Task & Progress Manager

A modern, production-grade, full-stack web application designed for students to organize academic tasks, monitor daily productivity, and track study milestones through interactive analytics and a schedule calendar.

> Built as the Capstone Project for **WD401 – Full Stack Web Application with Node.js & Express.js**.

---

## 🚀 Live Demo & Repository

- **GitHub Repository**: [https://github.com/adiseshu143/Student-Traker.git](https://github.com/adiseshu143/Student-Traker.git)
- **Deployment Platform**: Vercel (Serverless Node.js) / Local Node.js

---

## 🛠️ Complete Technology Stack

### **Backend & Core Engine**
- **Node.js**: Asynchronous JavaScript runtime environment.
- **Express.js (v4.21.2)**: RESTful web application framework handling middleware, routing, and HTTP requests.
- **MongoDB**: NoSQL document database storing users, tasks, and session records.
- **Mongoose (v8.9.5)**: Object Data Modeling (ODM) library for schema validation, hooks, and relationships.

### **Authentication & Security**
- **bcryptjs (v3.0.3)**: Multi-round (12 salt rounds) cryptographic password hashing.
- **express-session (v1.18.1)**: Secure, HTTP-only cookie-based session management.
- **connect-mongo (v5.1.0)**: Persistent session store in MongoDB with automatic TTL expiry.
- **dotenv (v16.4.7)**: Environment variable isolation to safeguard production secrets.

### **Frontend & User Interface**
- **EJS (Embedded JavaScript v3.1.10)**: Server-side templating engine for dynamic page rendering.
- **Vanilla CSS3**: Custom responsive design system featuring a clean aesthetic, CSS custom properties (variables), cards, and solid modern palettes.
- **Vanilla JavaScript (ES6+)**: Client-side form validation, date manipulation, interactive calendar controls, and asynchronous API calls.
- **Chart.js (v4.4.x)**: Interactive data visualization library powering daily completion trends and status doughnut charts.
- **Google Fonts (Inter)**: Clean typography.

### **DevOps & Deployment**
- **Vercel Serverless Functions**: Configured with `@vercel/node`, `vercel.json` rewrites, and database connection reuse.
- **Git & GitHub**: Distributed version control with strict `.gitignore` for secrets.

---

## ✨ Features & Implementations

### 1. 🔐 Secure Authentication & Session System
- **Registration & Validation**: Name, email, and password registration with client-side and server-side validation.
- **Duplicate Prevention**: Multi-layer email uniqueness enforcement (Mongoose unique schema index + application query check).
- **Password Security**: Passwords hashed before database persistence via Mongoose `pre('save')` hook with `bcryptjs`.
- **Session Isolation**: Authentication state stored in MongoDB. Authenticated sessions access only their own data.
- **Route Guard Middleware**: `requireLogin` middleware intercepts unauthorized requests and safely redirects to `/login`.

### 2. 📝 Full Task Lifecycle (CRUD)
- **Task Creation**: Create tasks with titles, descriptions, and optional due dates.
- **Due Date Intelligence**: Tasks dynamically categorized as **Overdue**, **Due Today**, or **Upcoming** with visual badges.
- **Status Toggle**: Instant toggle between pending and completed states. Automatically updates `completedAt` timestamp for analytics.
- **Safe Task Deletion**: Delete confirmation dialogs to prevent accidental removals.
- **Data Scoping**: Every task query strictly filtered by `userId: req.session.userId`.

### 3. 📊 Student Progress Analytics
- **Summary Metrics Grid (4 Key Cards)**:
  - **Total Tasks**: Total count of assigned tasks.
  - **Completed Tasks**: Successfully finished tasks.
  - **Pending Tasks**: Work in progress.
  - **Completion Rate (%)**: Dynamic percentage with an integrated visual progress bar.
- **7-Day Productivity Trend Chart**:
  - Chart.js line chart plotting actual daily tasks completed over the last 7 days.
  - Dynamically computed using MongoDB date aggregation.
- **Task Distribution Doughnut Chart**:
  - Proportional breakdown between completed and pending tasks with real-time percentage indicators.

### 4. 📅 Interactive Task Calendar
- **Monthly Grid View**: Full calendar view with seamless month-to-month navigation (Previous, Next, Today).
- **Due Date Indicators**: Visual indicator dots on calendar dates representing scheduled tasks.
- **Selected Day Inspector**: Click any calendar date to view all tasks scheduled for that specific day in a sidebar panel.
- **Quick-Add from Calendar**: Add a task directly to the selected calendar date with pre-filled due dates.
- **Dynamic API Endpoint (`GET /api/calendar-tasks`)**: Fetches month-scoped tasks asynchronously without full page reloads.

### 5. 🎨 Design & Accessibility
- **Zero-Gradient Solid Aesthetic**: Professional UI adhering to clean contrast guidelines.
- **Fully Responsive**: Mobile-first grid layouts for smartphones, tablets, and desktop displays.
- **Friendly Error Handling**: Custom 404 error page, input validation alerts, and clear error banners.

---

## 📁 Project Architecture

```
Student-Traker/
├── api/
│   └── index.js             # Vercel serverless entrypoint
├── models/
│   ├── User.js              # User Mongoose schema & password hashing hooks
│   └── Task.js              # Task schema (title, status, dueDate, completedAt)
├── routes/
│   ├── auth.js              # Authentication routes (login, signup, logout)
│   └── tasks.js             # Dashboard, CRUD, analytics & calendar API routes
├── middleware/
│   └── auth.js              # Session verification route guard (requireLogin)
├── views/
│   ├── login.ejs            # Secure login interface
│   ├── signup.ejs           # Registration interface
│   ├── dashboard.ejs        # Main student hub (Stats, Charts, Calendar, Tasks)
│   └── 404.ejs              # Not Found error page
├── public/
│   ├── css/
│   │   └── style.css        # Responsive stylesheet with CSS variables
│   └── js/
│       ├── auth.js          # Password visibility toggle & validation
│       └── dashboard.js     # Chart.js renderers & interactive calendar engine
├── .env.example             # Template for required environment variables
├── .gitignore               # Excludes .env, node_modules, and cache files
├── package.json             # NPM dependencies, scripts, and metadata
├── server.js                # Express app setup, MongoDB connection & routes
├── vercel.json              # Vercel deployment configuration
└── README.md                # Project documentation
```

---

## 📡 API & Route Specifications

### **Authentication Routes**
| Method | Route | Description | Protection |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root router — redirects to `/dashboard` or `/login` | Public |
| `GET` | `/login` | Renders user login form | Public |
| `POST` | `/login` | Validates credentials & creates session | Public |
| `GET` | `/signup` | Renders registration form | Public |
| `POST` | `/signup` | Hashes password & creates new user account | Public |
| `POST` | `/logout` | Destroys session & clears cookie | Authenticated |

### **Dashboard & Task Routes**
| Method | Route | Description | Protection |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard` | Renders analytics, calendar data, and task lists | `requireLogin` |
| `POST` | `/tasks` | Creates a new task (with optional `dueDate`) | `requireLogin` |
| `POST` | `/tasks/:id/toggle` | Toggles completion status & sets `completedAt` | `requireLogin` |
| `POST` | `/tasks/:id/delete` | Permanently removes task | `requireLogin` |
| `GET` | `/api/calendar-tasks` | Asynchronously returns tasks for year/month | `requireLogin` |

---

## ⚙️ Local Setup & Installation

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or free MongoDB Atlas cluster)
- [Git](https://git-scm.com/)

### **1. Clone Repository**
```bash
git clone https://github.com/adiseshu143/Student-Traker.git
cd Student-Traker
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment Variables**
Create a `.env` file in the project root by copying the example:

```bash
cp .env.example .env
```

Open `.env` and configure your credentials:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/student_task_manager?retryWrites=true&w=majority
SESSION_SECRET=your_custom_long_random_session_secret_key
```

### **4. Start the Application**
```bash
npm start
```
or for development:
```bash
npm run dev
```

Visit the application in your browser:
👉 **`http://localhost:3000`**

---

## ☁️ Deployment on Vercel

1. **Import Project**: Connect your GitHub repository (`Student-Traker`) on [Vercel](https://vercel.com).
2. **Environment Variables**: In the Vercel project settings, add:
   - `MONGO_URI`: Your MongoDB Atlas connection URI.
   - `SESSION_SECRET`: A strong random string.
   - `NODE_ENV`: `production`
3. **MongoDB Atlas Whitelist**: Under **Network Access** in MongoDB Atlas, ensure `0.0.0.0/0` (Allow access from anywhere) is enabled.
4. **Deploy**: Vercel will automatically build and deploy using `vercel.json` and `api/index.js`.

---

## 🛡️ Security Best Practices

- 🔒 **No Plain-Text Passwords**: Passwords salted and hashed with `bcryptjs`.
- 🔒 **Cookie Protection**: Session cookies use `httpOnly: true`, `sameSite: 'lax'`, and dynamic `secure` flags.
- 🔒 **Reverse Proxy Trust**: `app.set('trust proxy', 1)` configured for secure cookie headers on cloud hosts.
- 🔒 **SQL/NoSQL Isolation**: Mongoose strictly validates object models, preventing injection.
- 🔒 **Credential Isolation**: All keys, passwords, and connection strings managed exclusively via environment variables.

---

## 👨‍💻 Author & Acknowledgements

- **Developer**: Adiseshu
- **Course**: WD401 – Full Stack Web Application with Node.js & Express.js
- **License**: ISC License
