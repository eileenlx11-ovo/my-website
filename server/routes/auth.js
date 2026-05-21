const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const express = require('express');
const { z } = require('zod');
const { getDb, createPublicId, serializeUser } = require('../db');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const registerSchema = z.object({
  displayName: z.string().trim().min(1, '请输入称呼。').max(40, '称呼太长。'),
  email: z.string().trim().email('请输入有效邮箱。').max(120, '邮箱太长。'),
  password: z.string().min(8, '密码至少 8 位。').max(120, '密码太长。')
});

const loginSchema = z.object({
  email: z.string().trim().email('请输入有效邮箱。').max(120, '邮箱太长。'),
  password: z.string().min(1, '请输入密码。').max(120, '密码太长。')
});

router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  const db = getDb();
  const { displayName, email, password } = req.body;
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) {
    res.status(409).json({ error: '这个邮箱已经登记过。' });
    return;
  }

  let publicId = createPublicId();
  while (db.prepare('SELECT id FROM users WHERE public_id = ?').get(publicId)) {
    publicId = createPublicId();
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = db.prepare('INSERT INTO users (public_id, display_name, email, password_hash) VALUES (?, ?, ?, ?)')
    .run(publicId, displayName, email.toLowerCase(), passwordHash);
  const user = serializeUser(db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid));
  createSession(res, user.id);
  res.status(201).json({ user });
});

router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!row || !(await bcrypt.compare(password, row.password_hash))) {
    res.status(401).json({ error: '邮箱或密码不正确。' });
    return;
  }

  const user = serializeUser(row);
  createSession(res, user.id);
  res.json({ user });
});

router.post('/logout', requireAuth, (req, res) => {
  const token = req.cookies?.anchor_session;
  if (token) {
    getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  res.clearCookie('anchor_session');
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  res.json({ user: req.user || null });
});

function createSession(res, userId) {
  const db = getDb();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().replace('T', ' ').slice(0, 19);
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  res.cookie('anchor_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 14
  });
}

module.exports = router;
