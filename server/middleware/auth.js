const { getDb, serializeUser } = require('../db');

function requireAuth(req, res, next) {
  if (!req.user) {
    res.status(401).json({ error: '请先登录。' });
    return;
  }
  next();
}

function attachUser(req, _res, next) {
  const token = req.cookies?.anchor_session;
  if (!token) {
    next();
    return;
  }

  const db = getDb();
  const session = db.prepare(`
    SELECT s.token, u.*
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
  `).get(token);

  if (session) {
    req.user = serializeUser(session);
  }
  next();
}

module.exports = { attachUser, requireAuth };
