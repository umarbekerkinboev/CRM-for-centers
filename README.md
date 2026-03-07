# English Learning Center CRM - System Architecture & Backend Design

## 1. System Architecture Overview

The CRM system is designed using a **Client-Server Architecture** with a RESTful API backend.
- **Frontend:** Single Page Application (SPA) built with React.
- **Backend:** Node.js with Express.js, providing RESTful API endpoints.
- **Database:** SQLite (using `better-sqlite3` for synchronous, high-performance queries).
- **Authentication:** Token-based or session-based authentication (currently simplified with direct login validation).

The backend is modularized into distinct domains:
- **Auth Module:** Handles login validation and session management.
- **Student Module:** Manages student profiles, enrollment, and payment history.
- **Group & Course Module:** Manages educational offerings and class groupings.
- **Employee Module:** Manages staff, roles, and access credentials.
- **Timetable Module:** Core scheduling engine with conflict resolution.
- **Analytics Module:** Aggregates data for dashboard statistics.

---

## 2. Database Schema (Tables and Fields)

The database is highly relational, ensuring data integrity across modules.

### `users` (Employees & Admins)
- `id` (INTEGER, PK)
- `username` (TEXT, UNIQUE) - Used for login
- `password_hash` (TEXT) - Securely hashed password
- `name` (TEXT) - Full name
- `role` (TEXT) - e.g., 'GLOBAL_ADMIN', 'ADMIN', 'TEACHER'
- `phone` (TEXT)
- `email` (TEXT)

### `students`
- `id` (INTEGER, PK)
- `full_name` (TEXT)
- `phone` (TEXT)
- `email` (TEXT)
- `notes` (TEXT)

### `courses`
- `id` (INTEGER, PK)
- `name` (TEXT) - e.g., 'Pre-IELTS', 'Grammar'
- `description` (TEXT)
- `duration` (INTEGER) - Duration in weeks
- `level` (TEXT)

### `groups`
- `id` (INTEGER, PK)
- `name` (TEXT) - e.g., 'IELTS | E-15:30-Akmal'
- `course_id` (INTEGER, FK -> courses.id)
- `teacher_id` (INTEGER, FK -> users.id)
- `room_id` (INTEGER, FK -> rooms.id)

### `student_groups` (Many-to-Many Relationship)
- `student_id` (INTEGER, FK -> students.id)
- `group_id` (INTEGER, FK -> groups.id)
- *Primary Key: (student_id, group_id)*

### `rooms`
- `id` (INTEGER, PK)
- `name` (TEXT) - e.g., 'Room A'
- `capacity` (INTEGER)
- `equipment` (TEXT)

### `timetable_entries`
- `id` (INTEGER, PK)
- `group_id` (INTEGER, FK -> groups.id)
- `room_id` (INTEGER, FK -> rooms.id)
- `teacher_id` (INTEGER, FK -> users.id)
- `day_of_week` (INTEGER) - 1 (Monday) to 7 (Sunday)
- `start_time` (TEXT) - Format 'HH:MM' (e.g., '14:00')
- `end_time` (TEXT) - Format 'HH:MM' (e.g., '15:30')

### `payments`
- `id` (INTEGER, PK)
- `student_id` (INTEGER, FK -> students.id)
- `amount` (REAL)
- `payment_date` (TEXT)
- `notes` (TEXT)

---

## 3. Key Backend Logic

### Authentication Logic
- Global Admins create employee accounts and assign roles.
- The `/api/auth/login` endpoint verifies the `username` and `password_hash`.
- Returns a clear 401 Unauthorized error if credentials do not match.

### Group Management Logic
- When viewing a group, the backend performs SQL `JOIN`s to fetch the assigned Course, Teacher, Room, and the list of enrolled Students via the `student_groups` junction table.
- Adding a student to a group inserts a record into `student_groups`.

### Payment Tracking Logic
- Payments are linked directly to `students`.
- Outstanding payments can be calculated dynamically by comparing the total course prices of a student's enrolled groups against the sum of their `payments`.

---

## 4. Timetable Scheduling Logic (Conflict Prevention)

The Timetable system is the most critical component. When an admin attempts to add a new lesson, the backend performs three strict conflict checks before inserting the record.

**Time Overlap Formula:**
A time overlap occurs if: `(New_Start_Time < Existing_End_Time) AND (New_End_Time > Existing_Start_Time)`

**Conflict Checks:**
1. **Teacher Conflict:** Queries `timetable_entries` to ensure the selected `teacher_id` does not have another class on the same `day_of_week` that overlaps with the requested time.
2. **Room Conflict:** Queries `timetable_entries` to ensure the selected `room_id` is not already booked on the same `day_of_week` during the requested time.
3. **Group Conflict:** Queries `timetable_entries` to ensure the `group_id` is not scheduled for another class at the exact same time.

If any check returns a record, the API aborts the operation and returns a `400 Bad Request` with a specific error message (e.g., "Room is already booked for this time slot").

---

## 5. Analytics Calculations

Analytics are calculated dynamically using SQL aggregation functions to ensure real-time accuracy.

- **Total Students:** `SELECT COUNT(*) FROM students`
- **Total Groups:** `SELECT COUNT(*) FROM groups`
- **Total Payments:** `SELECT SUM(amount) FROM payments`
- **Total Employees:** `SELECT COUNT(*) FROM users`
- **Average Group Size:** Calculated by dividing the total number of records in `student_groups` by the total number of `groups`.
- **Outstanding Payments:** Calculated per student by subtracting `SUM(payments.amount)` from the total cost of their enrolled courses.

---

## 6. Example API Endpoints

### Authentication
- `POST /api/auth/login` - Validates credentials and returns user data.

### Students
- `GET /api/students` - Retrieves all students.
- `GET /api/students/:id` - Retrieves student profile, including enrolled groups and payment history.
- `POST /api/students` - Creates a new student.

### Groups
- `GET /api/groups` - Retrieves all groups with joined course, teacher, and room data.
- `POST /api/groups` - Creates a new group.
- `POST /api/groups/:groupId/students` - Enrolls a student in a group.

### Timetable
- `GET /api/timetable` - Retrieves the weekly schedule.
- `POST /api/timetable` - Adds a new lesson (runs conflict checks first).

### Analytics
- `GET /api/analytics` - Returns aggregated statistics for the dashboard.
