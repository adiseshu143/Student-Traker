require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for secure cookies on platforms like Vercel / Render
app.set('trust proxy', 1);

// ─── View Engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
let isConnected = false;
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('⚠️  MONGO_URI is missing from environment variables!');
    return;
  }
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅  Connected to MongoDB');
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
  }
};

// Connect on initial load if MONGO_URI is present
if (process.env.MONGO_URI) {
  connectDB();
}

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  if (process.env.MONGO_URI && mongoose.connection.readyState !== 1) {
    await connectDB();
  }
  next();
});

// ─── Session Middleware ───────────────────────────────────────────────────────
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'student_task_manager_fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
};

if (process.env.MONGO_URI) {
  try {
    sessionConfig.store = MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60, // 1 day
    });
  } catch (err) {
    console.error('⚠️  Failed to create MongoStore, fallback to memory store:', err.message);
  }
}

app.use(session(sessionConfig));

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/', authRoutes);
app.use('/', taskRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', {});
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).send('Something went wrong. Please try again later.');
});

// ─── Start Server (Local) ─────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀  Student Task Manager running at http://localhost:${PORT}`);
  });
}

module.exports = app;

