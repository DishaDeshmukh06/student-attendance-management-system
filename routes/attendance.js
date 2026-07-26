const express = require('express');
const router  = express.Router();
const db      = require('../database');

router.get('/', (req, res) => {
  try {
    const { date, subject, dept } = req.query;
    let sql = 'SELECT * FROM attendance WHERE 1=1';
    const params = [];
    if (date)    { sql += ' AND date = ?';    params.push(date); }
    if (subject) { sql += ' AND subject = ?'; params.push(subject); }
    if (dept)    { sql += ' AND dept = ?';    params.push(dept); }
    sql += ' ORDER BY created_at DESC LIMIT 50';
    res.json(db.prepare(sql).all(...params));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { date, subject, dept, year, records } = req.body;
    if (!date || !subject || !records || !records.length)
      return res.status(400).json({ message: 'Date, subject and records required' });
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount  = records.filter(r => r.status === 'absent').length;
    const totalCount   = records.length;
    const percentage   = Math.round((presentCount / totalCount) * 100);
    const sid = db.prepare('INSERT INTO attendance (date,subject,dept,year,present_count,absent_count,total_count,percentage) VALUES (?,?,?,?,?,?,?,?)').run(date, subject, dept||'All', year||'All', presentCount, absentCount, totalCount, percentage).lastInsertRowid;
    const ins = db.prepare('INSERT INTO attendance_records (attendance_id,student_id,student_name,roll,status) VALUES (?,?,?,?,?)');
    records.forEach(r => {
      ins.run(sid, r.student_id, r.name, r.roll, r.status);
      if (r.student_id) {
        const s = db.prepare('SELECT attendance FROM students WHERE id = ?').get(r.student_id);
        if (s) {
          const upd = Math.min(100, Math.max(0, Math.round((s.attendance * 0.85) + (r.status === 'present' ? 15 : 0))));
          db.prepare('UPDATE students SET attendance = ? WHERE id = ?').run(upd, r.student_id);
        }
      }
    });
    res.status(201).json({ message: 'Attendance submitted!', id: sid, presentCount, absentCount, totalCount, percentage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM attendance WHERE id = ?').run(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;