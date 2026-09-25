const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { requireLogin } = require('../middleware/auth');

// Protect all routes in this file
router.use(requireLogin);

// ─── Helper: build daily progress data for last 7 days ───────────────────────
function getDailyProgress(tasks) {
  // Build an array of the last 7 days (most recent last)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      dateStr: d.toISOString().slice(0, 10), // YYYY-MM-DD
      count: 0,
    });
  }

  // Count how many tasks were completed on each of those days
  tasks.forEach((task) => {
    if (!task.completed || !task.completedAt) return;
    const completedDate = new Date(task.completedAt).toISOString().slice(0, 10);
    const day = days.find((d) => d.dateStr === completedDate);
    if (day) day.count++;
  });

  return days;
}

// ─── GET /dashboard ───────────────────────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }

    const tasks = await Task.find({ userId: req.session.userId }).sort({ createdAt: -1 });

    // Core stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Daily progress for line chart (last 7 days, based on completedAt)
    const dailyProgress = getDailyProgress(tasks);

    // Calendar: build a map of dueDate -> tasks for the current month view
    // We pass all tasks to the frontend and let JS handle calendar rendering
    const taskDataForCalendar = tasks.map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      completed: t.completed,
      dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
    }));

    // Time-based greeting
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    res.render('dashboard', {
      user,
      tasks,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      dailyProgress,
      taskDataForCalendar: JSON.stringify(taskDataForCalendar),
      greeting,
      error: null,
      success: null,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('dashboard', {
      user: { name: req.session.userName || 'User', email: '' },
      tasks: [],
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      completionRate: 0,
      dailyProgress: [],
      taskDataForCalendar: '[]',
      greeting: 'Hello',
      error: 'Something went wrong loading your tasks.',
      success: null,
    });
  }
});

// ─── POST /tasks ──────────────────────────────────────────────────────────────
router.post('/tasks', async (req, res) => {
  const { title, dueDate } = req.body;

  if (!title || !title.trim()) {
    return res.redirect('/dashboard?error=empty');
  }

  try {
    const taskData = {
      title: title.trim(),
      userId: req.session.userId,
      completed: false,
    };

    // Only set dueDate if a valid date string was provided
    if (dueDate && dueDate.trim()) {
      const parsed = new Date(dueDate);
      if (!isNaN(parsed.getTime())) {
        taskData.dueDate = parsed;
      }
    }

    const task = new Task(taskData);
    await task.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Create task error:', err);
    res.redirect('/dashboard?error=create');
  }
});

// ─── POST /tasks/:id/toggle ───────────────────────────────────────────────────
router.post('/tasks/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!task) return res.redirect('/dashboard');

    task.completed = !task.completed;
    // Set or clear completedAt based on the new state
    task.completedAt = task.completed ? new Date() : null;
    await task.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Toggle task error:', err);
    res.redirect('/dashboard');
  }
});

// ─── POST /tasks/:id/delete ───────────────────────────────────────────────────
router.post('/tasks/:id/delete', async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.session.userId });
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Delete task error:', err);
    res.redirect('/dashboard');
  }
});

// ─── GET /api/tasks/calendar ──────────────────────────────────────────────────
// Returns tasks for a given month so the calendar can fetch data via JS
router.get('/api/tasks/calendar', async (req, res) => {
  try {
    const { year, month } = req.query; // month is 0-indexed (same as JS Date)
    const y = parseInt(year);
    const m = parseInt(month);

    if (isNaN(y) || isNaN(m)) {
      return res.json([]);
    }

    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);

    const tasks = await Task.find({
      userId: req.session.userId,
      dueDate: { $gte: start, $lte: end },
    }).select('title completed dueDate completedAt');

    const result = tasks.map((t) => ({
      _id: t._id.toString(),
      title: t.title,
      completed: t.completed,
      dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
    }));

    res.json(result);
  } catch (err) {
    console.error('Calendar API error:', err);
    res.json([]);
  }
});

module.exports = router;
