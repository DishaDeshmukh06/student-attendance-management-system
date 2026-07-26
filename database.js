const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');
const path     = require('path');

const db = new Database(path.join(__dirname, 'tgpcms.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    roll TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    dept TEXT NOT NULL,
    year TEXT NOT NULL,
    gender TEXT,
    dob TEXT,
    attendance REAL DEFAULT 0,
    guardian TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    subject TEXT NOT NULL,
    dept TEXT,
    year TEXT,
    present_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    percentage REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attendance_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    student_name TEXT,
    roll TEXT,
    status TEXT DEFAULT 'absent'
  );
`);

const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (userCount.c === 0) {
  const ins = db.prepare('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)');
  ins.run('Admin User',   'admin@tgpcms.edu.in',   bcrypt.hashSync('admin123',10),   'admin');
  ins.run('Prof. Sharma', 'teacher@tgpcms.edu.in', bcrypt.hashSync('teacher123',10), 'teacher');
  ins.run('Student User', 'student@tgpcms.edu.in', bcrypt.hashSync('student123',10), 'student');
  console.log('✅ Default users seeded');
}

const stuCount = db.prepare('SELECT COUNT(*) as c FROM students').get();
if (stuCount.c === 0) {
  const ins = db.prepare('INSERT INTO students (name,roll,email,phone,dept,year,gender,attendance) VALUES (?,?,?,?,?,?,?,?)');
  ins.run('Priya Sharma',   'MBA24001','priya.s@tgpcms.edu.in',  '9876501001','MBA - Marketing',                    'Second Year','Female',92);
  ins.run('Rahul Patil',    'MBA24002','rahul.p@tgpcms.edu.in',  '9876501002','MBA - Finance',                      'Second Year','Male',  78);
  ins.run('Sneha Desai',    'MBA24003','sneha.d@tgpcms.edu.in',  '9876501003','MBA - HR Management',                'First Year', 'Female',65);
  ins.run('Amit Kale',      'MBA24004','amit.k@tgpcms.edu.in',   '9876501004','MBA - Operations',                   'First Year', 'Male',  88);
  ins.run('Pooja Rane',     'MBA24005','pooja.r@tgpcms.edu.in',  '9876501005','MBA - Information Technology',       'Second Year','Female',45);
  ins.run('Vikram Joshi',   'MBA24006','vikram.j@tgpcms.edu.in', '9876501006','MBA - Finance',                      'First Year', 'Male',  81);
  ins.run('Anjali Mehta',   'MCA24001','anjali.m@tgpcms.edu.in', '9876501007','MCA - Computer Applications',        'First Year', 'Female',90);
  ins.run('Rohan Kulkarni', 'MCA24002','rohan.k@tgpcms.edu.in',  '9876501008','MCA - Computer Applications',        'Second Year','Male',  74);
  ins.run('Neha Wankhede',  'MI24001', 'neha.w@tgpcms.edu.in',   '9876501009','MI - Management Information Systems','First Year', 'Female',83);
  ins.run('Suraj Thakare',  'MI24002', 'suraj.t@tgpcms.edu.in',  '9876501010','MI - Management Information Systems','Second Year','Male',  58);
  console.log('✅ Sample students seeded');
}

module.exports = db;