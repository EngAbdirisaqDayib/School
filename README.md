# EduManage — School Management System

A complete school management system built with **HTML, CSS, and JavaScript only** (no frameworks or backend).

## How to Run

1. Open `index.html` in any modern web browser (Chrome, Edge, Firefox).
2. Or double-click `index.html` from File Explorer.

Data is stored in your browser's **localStorage** — no server required.

## Demo Login Accounts

| Role    | Email                 | Password    |
|---------|-----------------------|-------------|
| Admin   | admin@school.com      | admin123    |
| Teacher | teacher@school.com    | teacher123  |
| Student | student@school.com    | student123  |

Click the demo buttons on the login screen to auto-fill credentials.

## Features

- **Dashboard** — Role-based stats and overview
- **Students** — Add, edit, delete, search students
- **Teachers** — Manage teacher records
- **Classes** — Organize grades and sections
- **Subjects** — Link subjects to teachers and classes
- **Attendance** — Mark daily attendance (Present / Absent / Late)
- **Grades** — Record exam scores with letter grades
- **Timetable** — Weekly class schedule grid
- **Fees** — Tuition and fee tracking with payment status
- **Announcements** — School notices with priority levels
- **Reports** — Performance, fees, and attendance analytics (Admin)

## Role Permissions

- **Admin** — Full access to all modules
- **Teacher** — Dashboard, students, attendance, grades, timetable, announcements
- **Student** — Dashboard, own grades, timetable, fees, announcements

## Reset Data

Clear browser localStorage for this site, or run in the browser console:

```javascript
localStorage.removeItem('edumanage_data');
localStorage.removeItem('edumanage_session');
location.reload();
```
