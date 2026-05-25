const Storage = {
  KEY: 'edumanage_data',

  get() {
    const raw = localStorage.getItem(this.KEY);
    if (raw) return JSON.parse(raw);
    return this.seed();
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  seed() {
    const data = {
      students: [
        { id: 'STU001', name: 'Alice Johnson', email: 'alice@student.school.com', phone: '555-0101', classId: 'CLS001', dob: '2010-03-15', gender: 'Female', address: '123 Oak St', parentName: 'Mary Johnson', parentPhone: '555-0102', status: 'Active', admissionDate: '2022-09-01' },
        { id: 'STU002', name: 'Bob Smith', email: 'bob@student.school.com', phone: '555-0103', classId: 'CLS001', dob: '2010-07-22', gender: 'Male', address: '456 Pine Ave', parentName: 'John Smith', parentPhone: '555-0104', status: 'Active', admissionDate: '2022-09-01' },
        { id: 'STU003', name: 'Carol Williams', email: 'carol@student.school.com', phone: '555-0105', classId: 'CLS002', dob: '2009-11-08', gender: 'Female', address: '789 Elm Rd', parentName: 'Susan Williams', parentPhone: '555-0106', status: 'Active', admissionDate: '2021-09-01' },
        { id: 'STU004', name: 'David Brown', email: 'david@student.school.com', phone: '555-0107', classId: 'CLS002', dob: '2009-01-30', gender: 'Male', address: '321 Maple Ln', parentName: 'Robert Brown', parentPhone: '555-0108', status: 'Active', admissionDate: '2021-09-01' },
        { id: 'STU005', name: 'Emma Davis', email: 'emma.j@student.school.com', phone: '555-0109', classId: 'CLS003', dob: '2008-05-12', gender: 'Female', address: '654 Cedar Dr', parentName: 'Lisa Davis', parentPhone: '555-0110', status: 'Active', admissionDate: '2020-09-01' }
      ],
      teachers: [
        { id: 'TCH001', name: 'Dr. James Wilson', email: 'teacher@school.com', phone: '555-0201', subject: 'Mathematics', qualification: 'PhD Mathematics', salary: 65000, joinDate: '2018-08-15', status: 'Active' },
        { id: 'TCH002', name: 'Sarah Martinez', email: 'sarah.m@school.com', phone: '555-0202', subject: 'English', qualification: 'MA English Literature', salary: 55000, joinDate: '2019-09-01', status: 'Active' },
        { id: 'TCH003', name: 'Michael Chen', email: 'michael.c@school.com', phone: '555-0203', subject: 'Science', qualification: 'MSc Physics', salary: 58000, joinDate: '2020-01-10', status: 'Active' },
        { id: 'TCH004', name: 'Emily Taylor', email: 'emily.t@school.com', phone: '555-0204', subject: 'History', qualification: 'MA History', salary: 52000, joinDate: '2021-08-20', status: 'Active' }
      ],
      classes: [
        { id: 'CLS001', name: 'Grade 8-A', grade: '8', section: 'A', teacherId: 'TCH001', room: 'Room 101', capacity: 30, students: 2 },
        { id: 'CLS002', name: 'Grade 9-B', grade: '9', section: 'B', teacherId: 'TCH002', room: 'Room 205', capacity: 30, students: 2 },
        { id: 'CLS003', name: 'Grade 10-A', grade: '10', section: 'A', teacherId: 'TCH003', room: 'Room 310', capacity: 28, students: 1 }
      ],
      subjects: [
        { id: 'SUB001', name: 'Mathematics', code: 'MATH', teacherId: 'TCH001', classId: 'CLS001', credits: 4 },
        { id: 'SUB002', name: 'English', code: 'ENG', teacherId: 'TCH002', classId: 'CLS001', credits: 4 },
        { id: 'SUB003', name: 'Science', code: 'SCI', teacherId: 'TCH003', classId: 'CLS002', credits: 4 },
        { id: 'SUB004', name: 'History', code: 'HIST', teacherId: 'TCH004', classId: 'CLS002', credits: 3 },
        { id: 'SUB005', name: 'Physics', code: 'PHY', teacherId: 'TCH003', classId: 'CLS003', credits: 4 }
      ],
      attendance: [],
      grades: [
        { id: 'GRD001', studentId: 'STU001', subjectId: 'SUB001', exam: 'Mid-Term', score: 88, maxScore: 100, date: '2026-03-15' },
        { id: 'GRD002', studentId: 'STU001', subjectId: 'SUB002', exam: 'Mid-Term', score: 92, maxScore: 100, date: '2026-03-16' },
        { id: 'GRD003', studentId: 'STU002', subjectId: 'SUB001', exam: 'Mid-Term', score: 75, maxScore: 100, date: '2026-03-15' },
        { id: 'GRD004', studentId: 'STU003', subjectId: 'SUB003', exam: 'Quiz 1', score: 45, maxScore: 50, date: '2026-04-01' },
        { id: 'GRD005', studentId: 'STU005', subjectId: 'SUB005', exam: 'Final', score: 91, maxScore: 100, date: '2026-04-10' }
      ],
      timetable: [
        { id: 'TT001', classId: 'CLS001', day: 'Monday', period: 1, startTime: '08:00', endTime: '08:45', subjectId: 'SUB001', teacherId: 'TCH001', room: 'Room 101' },
        { id: 'TT002', classId: 'CLS001', day: 'Monday', period: 2, startTime: '08:50', endTime: '09:35', subjectId: 'SUB002', teacherId: 'TCH002', room: 'Room 101' },
        { id: 'TT003', classId: 'CLS001', day: 'Tuesday', period: 1, startTime: '08:00', endTime: '08:45', subjectId: 'SUB002', teacherId: 'TCH002', room: 'Room 101' },
        { id: 'TT004', classId: 'CLS002', day: 'Monday', period: 3, startTime: '09:40', endTime: '10:25', subjectId: 'SUB003', teacherId: 'TCH003', room: 'Room 205' },
        { id: 'TT005', classId: 'CLS003', day: 'Wednesday', period: 2, startTime: '08:50', endTime: '09:35', subjectId: 'SUB005', teacherId: 'TCH003', room: 'Lab 1' }
      ],
      fees: [
        { id: 'FEE001', studentId: 'STU001', type: 'Tuition', amount: 2500, dueDate: '2026-06-01', paidDate: '2026-05-01', status: 'Paid' },
        { id: 'FEE002', studentId: 'STU002', type: 'Tuition', amount: 2500, dueDate: '2026-06-01', paidDate: null, status: 'Pending' },
        { id: 'FEE003', studentId: 'STU003', type: 'Tuition', amount: 2500, dueDate: '2026-06-01', paidDate: '2026-05-10', status: 'Paid' },
        { id: 'FEE004', studentId: 'STU004', type: 'Library', amount: 150, dueDate: '2026-05-15', paidDate: null, status: 'Overdue' },
        { id: 'FEE005', studentId: 'STU005', type: 'Tuition', amount: 2800, dueDate: '2026-06-01', paidDate: null, status: 'Pending' }
      ],
      announcements: [
        { id: 'ANN001', title: 'Summer Break Schedule', content: 'School will close from June 15 to August 25. Final exams begin June 1.', author: 'Admin', date: '2026-05-20', priority: 'High', audience: 'All' },
        { id: 'ANN002', title: 'Parent-Teacher Meeting', content: 'PTM scheduled for May 30. Please book your slot through the office.', author: 'Admin', date: '2026-05-18', priority: 'Medium', audience: 'Parents' },
        { id: 'ANN003', title: 'Science Fair Registration', content: 'Register for the annual science fair by May 28. Open to grades 8-10.', author: 'Dr. James Wilson', date: '2026-05-15', priority: 'Low', audience: 'Students' }
      ],
      users: [
        { id: 'USR001', email: 'admin@school.com', password: 'admin123', role: 'admin', name: 'System Admin', linkedId: null },
        { id: 'USR002', email: 'teacher@school.com', password: 'teacher123', role: 'teacher', name: 'Dr. James Wilson', linkedId: 'TCH001' },
        { id: 'USR003', email: 'student@school.com', password: 'student123', role: 'student', name: 'Alice Johnson', linkedId: 'STU001' }
      ]
    };
    this.save(data);
    return data;
  },

  nextId(prefix, items) {
    const nums = items.map(i => parseInt((i.id || '').replace(prefix, ''), 10)).filter(n => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 0;
    return prefix + String(max + 1).padStart(3, '0');
  },

  getStudents() { return this.get().students; },
  getTeachers() { return this.get().teachers; },
  getClasses() { return this.get().classes; },
  getSubjects() { return this.get().subjects; },
  getAttendance() { return this.get().attendance; },
  getGrades() { return this.get().grades; },
  getTimetable() { return this.get().timetable; },
  getFees() { return this.get().fees; },
  getAnnouncements() { return this.get().announcements; },

  updateCollection(key, items) {
    const data = this.get();
    data[key] = items;
    this.save(data);
  }
};
