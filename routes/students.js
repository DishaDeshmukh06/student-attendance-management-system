const express = require('express');
const router  = express.Router();
const db      = require('../database');

router.get('/stats/summary', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as c FROM students').get().c;
    const good  = db.prepare('SELECT COUNT(*) as c FROM students WHERE attendance >= 75').get().c;
    const mid   = db.prepare('SELECT COUNT(*) as c FROM students WHERE attendance >= 60 AND attendance < 75').get().c;
    const low   = db.prepare('SELECT COUNT(*) as c FROM students WHERE attendance < 60').get().c;
    const avg   = Math.round(db.prepare('SELECT AVG(attendance) as a FROM students').get().a || 0);
    res.json({ total, good, mid, low, avg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', (req, res) => {
  try {
    const { dept, year, search } = req.query;
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params = [];
    if (dept)   { sql += ' AND dept = ?'; params.push(dept); }
    if (year)   { sql += ' AND year = ?'; params.push(year); }
    if (search) {
      sql += ' AND (name LIKE ? OR roll LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const q = '%' + search + '%';
      params.push(q, q, q, q);
    }
    sql += ' ORDER BY created_at DESC';
    res.json(db.prepare(sql).all(...params));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const s = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    if (!s) return res.status(404).json({ message: 'Student not found' });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, roll, email, phone, dept, year, gender, dob, attendance, guardian, address } = req.body;
    if (!name || !roll || !email || !phone || !dept || !year)
      return res.status(400).json({ message: 'Required fields missing' });
    if (db.prepare('SELECT id FROM students WHERE roll = ? OR email = ?').get(roll, email))
      return res.status(400).json({ message: 'Roll or email already exists' });
    const r = db.prepare('INSERT INTO students (name,roll,email,phone,dept,year,gender,dob,attendance,guardian,address) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(name, roll, email, phone, dept, year, gender||'', dob||'', attendance||0, guardian||'', address||'');
    res.status(201).json(db.prepare('SELECT * FROM students WHERE id = ?').get(r.lastInsertRowid));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, roll, email, phone, dept, year, gender, dob, attendance, guardian, address } = req.body;
    if (!db.prepare('SELECT id FROM students WHERE id = ?').get(req.params.id))
      return res.status(404).json({ message: 'Student not found' });
    db.prepare('UPDATE students SET name=?,roll=?,email=?,phone=?,dept=?,year=?,gender=?,dob=?,attendance=?,guardian=?,address=? WHERE id=?').run(name, roll, email, phone, dept, year, gender||'', dob||'', attendance||0, guardian||'', address||'', req.params.id);
    res.json(db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    if (!db.prepare('SELECT id FROM students WHERE id = ?').get(req.params.id))
      return res.status(404).json({ message: 'Student not found' });
    db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
