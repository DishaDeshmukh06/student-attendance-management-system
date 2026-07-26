const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../database');

const SECRET   = process.env.JWT_SECRET || 'tgpcms_secret_2025';
const genToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: '7d' });

router.post('/login', (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (role && user.role !== role)
      return res.status(401).json({ message: 'Not registered as ' + role });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token: genToken(user.id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
      return res.status(400).json({ message: 'Email already registered' });
    const hashed = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)').run(name, email, hashed, role || 'student');
    res.status(201).json({ id: result.lastInsertRowid, name, email, role: role || 'student', token: genToken(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', (req, res) => {
  try {
    res.json(db.prepare('SELECT id,name,email,role,created_at FROM users').all());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;