const DashboardPage = {
  render() {
    const session = Auth.getSession();
    const students = Storage.getStudents();
    const teachers = Storage.getTeachers();
    const classes = Storage.getClasses();
    const fees = Storage.getFees();
    const announcements = Storage.getAnnouncements();
    const grades = Storage.getGrades();

    let stats, recentItems;

    if (session.role === 'student') {
      const myGrades = grades.filter(g => g.studentId === session.linkedId);
      const myFees = fees.filter(f => f.studentId === session.linkedId);
      const pendingFees = myFees.filter(f => f.status !== 'Paid').reduce((s, f) => s + f.amount, 0);
      const avgScore = myGrades.length
        ? Math.round(myGrades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / myGrades.length)
        : 0;

      stats = `
        <div class="stat-card"><div class="stat-icon blue">📝</div><div><div class="stat-value">${myGrades.length}</div><div class="stat-label">My Grades</div></div></div>
        <div class="stat-card"><div class="stat-icon green">📊</div><div><div class="stat-value">${avgScore}%</div><div class="stat-label">Average Score</div></div></div>
        <div class="stat-card"><div class="stat-icon orange">💰</div><div><div class="stat-value">$${pendingFees}</div><div class="stat-label">Pending Fees</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">📢</div><div><div class="stat-value">${announcements.length}</div><div class="stat-label">Announcements</div></div></div>
      `;
      recentItems = myGrades.slice(-5).reverse().map(g =>
        `<li><span>${UI.getSubjectName(g.subjectId)} — ${g.exam}</span><strong>${g.score}/${g.maxScore}</strong></li>`
      ).join('') || '<li>No grades yet</li>';
    } else if (session.role === 'teacher') {
      const myStudents = students.filter(s => {
        const cls = classes.find(c => c.id === s.classId);
        return cls && cls.teacherId === session.linkedId;
      });
      stats = `
        <div class="stat-card"><div class="stat-icon blue">👨‍🎓</div><div><div class="stat-value">${myStudents.length || students.length}</div><div class="stat-label">Students</div></div></div>
        <div class="stat-card"><div class="stat-icon green">✅</div><div><div class="stat-value">${Storage.getAttendance().length}</div><div class="stat-label">Attendance Records</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">📝</div><div><div class="stat-value">${grades.length}</div><div class="stat-label">Grade Entries</div></div></div>
        <div class="stat-card"><div class="stat-icon orange">📢</div><div><div class="stat-value">${announcements.length}</div><div class="stat-label">Announcements</div></div></div>
      `;
      recentItems = announcements.slice(0, 5).map(a =>
        `<li><span>${UI.escapeHtml(a.title)}</span><span>${UI.formatDate(a.date)}</span></li>`
      ).join('');
    } else {
      const pendingFees = fees.filter(f => f.status === 'Pending' || f.status === 'Overdue');
      const totalRevenue = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0);
      stats = `
        <div class="stat-card"><div class="stat-icon blue">👨‍🎓</div><div><div class="stat-value">${students.length}</div><div class="stat-label">Total Students</div></div></div>
        <div class="stat-card"><div class="stat-icon green">👩‍🏫</div><div><div class="stat-value">${teachers.length}</div><div class="stat-label">Teachers</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">🏫</div><div><div class="stat-value">${classes.length}</div><div class="stat-label">Classes</div></div></div>
        <div class="stat-card"><div class="stat-icon orange">💰</div><div><div class="stat-value">$${totalRevenue.toLocaleString()}</div><div class="stat-label">Fees Collected</div></div></div>
      `;
      recentItems = students.slice(-5).reverse().map(s =>
        `<li><span>${UI.escapeHtml(s.name)}</span>${UI.statusBadge(s.status)}</li>`
      ).join('');
    }

    const pendingAlerts = fees.filter(f => f.status === 'Overdue').length;

    return `
      <div class="stats-grid">${stats}</div>
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>${session.role === 'student' ? 'Recent Grades' : 'Recent Activity'}</h3></div>
          <div class="card-body"><ul class="recent-list">${recentItems}</ul></div>
        </div>
        <div class="card">
          <div class="card-header"><h3>Quick Info</h3></div>
          <div class="card-body">
            <p style="margin-bottom:.75rem">Welcome back, <strong>${UI.escapeHtml(session.name)}</strong>!</p>
            <p style="color:var(--text-muted);font-size:.875rem;margin-bottom:.5rem">Role: <strong>${session.role.charAt(0).toUpperCase() + session.role.slice(1)}</strong></p>
            <p style="color:var(--text-muted);font-size:.875rem;margin-bottom:.5rem">Today: <strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
            ${session.role === 'admin' && pendingAlerts ? `<p style="color:var(--danger);font-size:.875rem">⚠️ ${pendingAlerts} overdue fee(s) need attention</p>` : ''}
          </div>
        </div>
      </div>
      ${session.role === 'admin' ? `
      <div class="card">
        <div class="card-header"><h3>Latest Announcements</h3></div>
        <div class="card-body">
          <ul class="recent-list">
            ${announcements.slice(0, 3).map(a => `
              <li><span>${UI.escapeHtml(a.title)}</span>${UI.badge(a.priority, a.priority === 'High' ? 'danger' : a.priority === 'Medium' ? 'warning' : 'info')}</li>
            `).join('') || '<li>No announcements</li>'}
          </ul>
        </div>
      </div>` : ''}
    `;
  }
};
