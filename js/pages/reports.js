const ReportsPage = {
  render() {
    const students = Storage.getStudents();
    const teachers = Storage.getTeachers();
    const classes = Storage.getClasses();
    const grades = Storage.getGrades();
    const fees = Storage.getFees();
    const attendance = Storage.getAttendance();

    const avgGrade = grades.length
      ? Math.round(grades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / grades.length)
      : 0;

    const feeSummary = {
      paid: fees.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0),
      pending: fees.filter(f => f.status === 'Pending').reduce((s, f) => s + f.amount, 0),
      overdue: fees.filter(f => f.status === 'Overdue').reduce((s, f) => s + f.amount, 0)
    };

    const attPresent = attendance.filter(a => a.status === 'Present').length;
    const attTotal = attendance.length;
    const attRate = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;

    const classReport = classes.map(c => {
      const classStudents = students.filter(s => s.classId === c.id);
      const classGrades = grades.filter(g => classStudents.some(s => s.id === g.studentId));
      const avg = classGrades.length
        ? Math.round(classGrades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / classGrades.length)
        : 0;
      return { name: c.name, students: classStudents.length, avg };
    });

    return `
      <div class="toolbar">
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print Report</button>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon blue">📊</div><div><div class="stat-value">${avgGrade}%</div><div class="stat-label">School Avg Grade</div></div></div>
        <div class="stat-card"><div class="stat-icon green">✅</div><div><div class="stat-value">${attRate}%</div><div class="stat-label">Attendance Rate</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">💰</div><div><div class="stat-value">$${feeSummary.paid.toLocaleString()}</div><div class="stat-label">Revenue Collected</div></div></div>
        <div class="stat-card"><div class="stat-icon red">⚠️</div><div><div class="stat-value">$${(feeSummary.pending + feeSummary.overdue).toLocaleString()}</div><div class="stat-label">Outstanding Fees</div></div></div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header"><h3>Class Performance</h3></div>
          <div class="card-body table-wrap">
            <table>
              <thead><tr><th>Class</th><th>Students</th><th>Avg Score</th></tr></thead>
              <tbody>
                ${classReport.map(c => `<tr><td>${c.name}</td><td>${c.students}</td><td>${c.avg}%</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><h3>Fee Summary</h3></div>
          <div class="card-body">
            <ul class="recent-list">
              <li><span>Paid</span><strong style="color:var(--success)">$${feeSummary.paid.toLocaleString()}</strong></li>
              <li><span>Pending</span><strong style="color:var(--warning)">$${feeSummary.pending.toLocaleString()}</strong></li>
              <li><span>Overdue</span><strong style="color:var(--danger)">$${feeSummary.overdue.toLocaleString()}</strong></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>Top Students by Average</h3></div>
        <div class="card-body table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Student</th><th>Class</th><th>Avg %</th><th>Letter</th></tr></thead>
            <tbody>
              ${this.getTopStudents(students, grades).map((s, i) => `
                <tr><td>${i + 1}</td><td>${UI.escapeHtml(s.name)}</td><td>${UI.getClassName(s.classId)}</td>
                <td>${s.avg}%</td><td>${UI.badge(UI.gradeLetter(s.avg), s.avg >= 70 ? 'success' : 'warning')}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>School Overview</h3></div>
        <div class="card-body">
          <p style="font-size:.9rem;line-height:1.8">
            Total Students: <strong>${students.length}</strong> ·
            Total Teachers: <strong>${teachers.length}</strong> ·
            Total Classes: <strong>${classes.length}</strong> ·
            Grade Records: <strong>${grades.length}</strong> ·
            Attendance Records: <strong>${attendance.length}</strong>
          </p>
          <p style="font-size:.8rem;color:var(--text-muted);margin-top:.5rem">Report generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
  },

  getTopStudents(students, grades) {
    return students.map(s => {
      const sg = grades.filter(g => g.studentId === s.id);
      const avg = sg.length ? Math.round(sg.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / sg.length) : 0;
      return { ...s, avg };
    }).filter(s => s.avg > 0).sort((a, b) => b.avg - a.avg).slice(0, 10);
  },

  bindEvents() {}
};
