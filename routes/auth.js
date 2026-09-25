const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ─── GET /login ──────────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

// ─── GET /signup ─────────────────────────────────────────────────────────────
router.get('/signup', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('signup', { error: null });
});

// ─── POST /login ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.render('login', { error: 'Please fill in all fields.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    // Create authenticated session
    req.session.userId = user._id;
    req.session.userName = user.name;

    const returnTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Something went wrong. Please try again.' });
  }
});

// ─── POST /signup ─────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // --- Validation ---
  if (!name || !email || !password || !confirmPassword) {
    return res.render('signup', { error: 'Please fill in all fields.' });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.toLowerCase().trim();

  if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
    return res.render('signup', { error: 'Please enter a valid email address.' });
  }

  if (password.length < 6) {
    return res.render('signup', { error: 'Password must be at least 6 characters.' });
  }

  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match.' });
  }

  try {
    // Check for duplicate email
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.render('signup', { error: 'An account with this email already exists.' });
    }

    // Create new user (password is hashed by the pre-save hook in User model)
    const user = new User({ name: trimmedName, email: trimmedEmail, password });
    await user.save();

    // Auto-login after signup
    req.session.userId = user._id;
    req.session.userName = user.name;

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 11000) {
      return res.render('signup', { error: 'An account with this email already exists.' });
    }
    res.render('signup', { error: 'Something went wrong. Please try again.' });
  }
});

// ─── POST /logout ─────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

// ─── GET / ────────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.redirect('/login');
});

module.exports = router;
