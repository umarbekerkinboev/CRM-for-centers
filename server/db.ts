import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(process.cwd(), 'crm.db');

export const db = new Database(DB_PATH);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL, -- 'GLOBAL_ADMIN', 'ADMIN', 'TEACHER'
      phone TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER,
      level TEXT
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      equipment TEXT
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      course_id INTEGER,
      teacher_id INTEGER,
      room_id INTEGER,
      FOREIGN KEY(course_id) REFERENCES courses(id),
      FOREIGN KEY(teacher_id) REFERENCES users(id),
      FOREIGN KEY(room_id) REFERENCES rooms(id)
    );

    CREATE TABLE IF NOT EXISTS student_groups (
      student_id INTEGER,
      group_id INTEGER,
      PRIMARY KEY(student_id, group_id),
      FOREIGN KEY(student_id) REFERENCES students(id),
      FOREIGN KEY(group_id) REFERENCES groups(id)
    );

    CREATE TABLE IF NOT EXISTS timetable_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER,
      room_id INTEGER,
      teacher_id INTEGER,
      day_of_week INTEGER, -- 1-7 (Monday-Sunday)
      start_time TEXT, -- 'HH:MM'
      end_time TEXT, -- 'HH:MM'
      FOREIGN KEY(group_id) REFERENCES groups(id),
      FOREIGN KEY(room_id) REFERENCES rooms(id),
      FOREIGN KEY(teacher_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY(student_id) REFERENCES students(id)
    );
  `);

  // Insert a default global admin if none exists
  const adminExists = db.prepare("SELECT 1 FROM users WHERE username = 'admin'").get();
  if (!adminExists) {
    db.prepare(`
      INSERT INTO users (username, password_hash, name, role) 
      VALUES (?, ?, ?, ?)
    `).run('admin', 'admin123', 'Global Admin', 'GLOBAL_ADMIN'); // In real app, hash password
  }
}
