const Auth = {
  SESSION_KEY: 'edumanage_session',

  login(email, password) {
    const users = Storage.get().users;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return null;
    const session = { id: user.id, email: user.email, role: user.role, name: user.name, linkedId: user.linkedId };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  getSession() {
    const raw = localStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  canAccess(page) {
    const role = this.getSession()?.role;
    const permissions = {
      admin: ['dashboard', 'students', 'teachers', 'classes', 'subjects', 'attendance', 'grades', 'timetable', 'fees', 'announcements', 'reports'],
      teacher: ['dashboard', 'students', 'attendance', 'grades', 'timetable', 'announcements'],
      student: ['dashboard', 'grades', 'timetable', 'fees', 'announcements']
    };
    return permissions[role]?.includes(page) ?? false;
  },

  getNavItems() {
    const all = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'students', label: 'Students', icon: '👨‍🎓' },
      { id: 'teachers', label: 'Teachers', icon: '👩‍🏫' },
      { id: 'classes', label: 'Classes', icon: '🏫' },
      { id: 'subjects', label: 'Subjects', icon: '📚' },
      { id: 'attendance', label: 'Attendance', icon: '✅' },
      { id: 'grades', label: 'Grades', icon: '📝' },
      { id: 'timetable', label: 'Timetable', icon: '📅' },
      { id: 'fees', label: 'Fees', icon: '💰' },
      { id: 'announcements', label: 'Announcements', icon: '📢' },
      { id: 'reports', label: 'Reports', icon: '📈' }
    ];
    return all.filter(item => this.canAccess(item.id));
  }
};
