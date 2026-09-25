/**
 * Authentication middleware
 * Protects routes that require an authenticated session.
 */
const requireLogin = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  // Store the intended URL for post-login redirect (optional enhancement)
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
};

module.exports = { requireLogin };
