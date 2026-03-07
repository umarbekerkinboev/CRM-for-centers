import { Router } from 'express';
import { db } from './db.ts';

const router = Router();

// --- Authentication ---
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT id, username, name, role FROM users WHERE username = ? AND password_hash = ?').get(username, password);
  
  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password' });
  }
});

// --- Analytics ---
router.get('/analytics', (req, res) => {
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
  const totalGroups = db.prepare('SELECT COUNT(*) as count FROM groups').get() as { count: number };
  const totalPayments = db.prepare('SELECT SUM(amount) as total FROM payments').get() as { total: number };
  const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  res.json({
    studentStatistics: {
      totalStudents: totalStudents.count,
      activeStudents: totalStudents.count, // Simplified
    },
    groupStatistics: {
      totalGroups: totalGroups.count,
    },
    financialStatistics: {
      totalPayments: totalPayments.total || 0,
    },
    employeeStatistics: {
      totalEmployees: totalEmployees.count,
    }
  });
});

// --- Students ---
router.get('/students', (req, res) => {
  const students = db.prepare('SELECT * FROM students').all();
  res.json(students);
});

router.post('/students', (req, res) => {
  const { full_name, phone, email, notes } = req.body;
  const result = db.prepare('INSERT INTO students (full_name, phone, email, notes) VALUES (?, ?, ?, ?)')
    .run(full_name, phone, email, notes);
  res.json({ id: result.lastInsertRowid });
});

router.get('/students/:id', (req, res) => {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id) as any;
  const payments = db.prepare('SELECT * FROM payments WHERE student_id = ?').all(req.params.id);
  const groups = db.prepare(`
    SELECT g.* FROM groups g 
    JOIN student_groups sg ON g.id = sg.group_id 
    WHERE sg.student_id = ?
  `).all(req.params.id);
  
  if (student) {
    res.json({ ...student, payments, groups });
  } else {
    res.status(404).json({ error: 'Student not found' });
  }
});

// --- Payments ---
router.post('/payments', (req, res) => {
  const { student_id, amount, payment_date, notes } = req.body;
  const result = db.prepare('INSERT INTO payments (student_id, amount, payment_date, notes) VALUES (?, ?, ?, ?)')
    .run(student_id, amount, payment_date, notes);
  res.json({ id: result.lastInsertRowid });
});

// --- Groups ---
router.get('/groups', (req, res) => {
  const groups = db.prepare(`
    SELECT g.*, c.name as course_name, u.name as teacher_name, r.name as room_name 
    FROM groups g
    LEFT JOIN courses c ON g.course_id = c.id
    LEFT JOIN users u ON g.teacher_id = u.id
    LEFT JOIN rooms r ON g.room_id = r.id
  `).all();
  res.json(groups);
});

router.post('/groups', (req, res) => {
  const { name, course_id, teacher_id, room_id } = req.body;
  const result = db.prepare('INSERT INTO groups (name, course_id, teacher_id, room_id) VALUES (?, ?, ?, ?)')
    .run(name, course_id, teacher_id, room_id);
  res.json({ id: result.lastInsertRowid });
});

router.post('/groups/:groupId/students', (req, res) => {
  const { student_id } = req.body;
  db.prepare('INSERT INTO student_groups (student_id, group_id) VALUES (?, ?)')
    .run(student_id, req.params.groupId);
  res.json({ success: true });
});

// --- Courses ---
router.get('/courses', (req, res) => {
  const courses = db.prepare('SELECT * FROM courses').all();
  res.json(courses);
});

router.post('/courses', (req, res) => {
  const { name, description, duration, level } = req.body;
  const result = db.prepare('INSERT INTO courses (name, description, duration, level) VALUES (?, ?, ?, ?)')
    .run(name, description, duration, level);
  res.json({ id: result.lastInsertRowid });
});

// --- Rooms ---
router.get('/rooms', (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms').all();
  res.json(rooms);
});

router.post('/rooms', (req, res) => {
  const { name, capacity, equipment } = req.body;
  const result = db.prepare('INSERT INTO rooms (name, capacity, equipment) VALUES (?, ?, ?)')
    .run(name, capacity, equipment);
  res.json({ id: result.lastInsertRowid });
});

// --- Employees ---
router.get('/employees', (req, res) => {
  const employees = db.prepare('SELECT id, username, name, role, phone, email FROM users').all();
  res.json(employees);
});

router.post('/employees', (req, res) => {
  const { username, password, name, role, phone, email } = req.body;
  const result = db.prepare('INSERT INTO users (username, password_hash, name, role, phone, email) VALUES (?, ?, ?, ?, ?, ?)')
    .run(username, password, name, role, phone, email);
  res.json({ id: result.lastInsertRowid });
});

// --- Timetable ---
router.get('/timetable', (req, res) => {
  const entries = db.prepare(`
    SELECT t.*, g.name as group_name, u.name as teacher_name, r.name as room_name 
    FROM timetable_entries t
    JOIN groups g ON t.group_id = g.id
    JOIN users u ON t.teacher_id = u.id
    JOIN rooms r ON t.room_id = r.id
  `).all();
  res.json(entries);
});

router.post('/timetable', (req, res) => {
  const { group_id, room_id, teacher_id, day_of_week, start_time, end_time } = req.body;

  // Conflict Checking Logic
  // 1. Check Teacher Conflict
  const teacherConflict = db.prepare(`
    SELECT * FROM timetable_entries 
    WHERE teacher_id = ? AND day_of_week = ? 
    AND (start_time < ? AND end_time > ?)
  `).get(teacher_id, day_of_week, end_time, start_time);

  if (teacherConflict) {
    return res.status(400).json({ error: 'Teacher is already booked for this time slot.' });
  }

  // 2. Check Room Conflict
  const roomConflict = db.prepare(`
    SELECT * FROM timetable_entries 
    WHERE room_id = ? AND day_of_week = ? 
    AND (start_time < ? AND end_time > ?)
  `).get(room_id, day_of_week, end_time, start_time);

  if (roomConflict) {
    return res.status(400).json({ error: 'Room is already booked for this time slot.' });
  }

  // 3. Check Group Conflict
  const groupConflict = db.prepare(`
    SELECT * FROM timetable_entries 
    WHERE group_id = ? AND day_of_week = ? 
    AND (start_time < ? AND end_time > ?)
  `).get(group_id, day_of_week, end_time, start_time);

  if (groupConflict) {
    return res.status(400).json({ error: 'Group already has a class during this time slot.' });
  }

  // Insert if no conflicts
  const result = db.prepare(`
    INSERT INTO timetable_entries (group_id, room_id, teacher_id, day_of_week, start_time, end_time) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(group_id, room_id, teacher_id, day_of_week, start_time, end_time);

  res.json({ id: result.lastInsertRowid });
});

export default router;
