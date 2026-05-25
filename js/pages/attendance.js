const AttendancePage = {
  render() {
    const classes = Storage.getClasses();
    const today = new Date().toISOString().slice(0, 10);
    const records = Storage.getAttendance();

    return `
      <div class="card">
        <div class="card-header">
          <h3>Mark Attendance</h3>
          <div class="toolbar" style="margin:0">
            <select class="filter-select" id="att-class">
              <option value="">Select Class</option>
              ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
            <input type="date" class="filter-select" id="att-date" value="${today}">
            <button class="btn btn-primary" id="load-attendance">Load Students</button>
          </div>
        </div>
        <div class="card-body">
          <div id="attendance-list">${UI.emptyState('✅', 'Select a class and date to mark attendance')}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Recent Records</h3></div>
        <div class="card-body table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Student</th><th>Class</th><th>Status</th></tr></thead>
            <tbody>
              ${records.length ? records.slice(-20).reverse().map(r => `
                <tr>
                  <td>${UI.formatDate(r.date)}</td>
                  <td>${UI.getStudentName(r.studentId)}</td>
                  <td>${UI.getClassName(r.classId)}</td>
                  <td>${UI.badge(r.status, r.status === 'Present' ? 'success' : r.status === 'Late' ? 'warning' : 'danger')}</td>
                </tr>
              `).join('') : `<tr><td colspan="4">No records yet</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('load-attendance')?.addEventListener('click', () => this.loadStudents());
    document.getElementById('save-attendance')?.addEventListener('click', () => this.save());
  },

  loadStudents() {
    const classId = document.getElementById('att-class').value;
    const date = document.getElementById('att-date').value;
    if (!classId) { UI.toast('Select a class', 'error'); return; }

    const students = Storage.getStudents().filter(s => s.classId === classId && s.status === 'Active');
    const records = Storage.getAttendance();
    const list = document.getElementById('attendance-list');

    if (!students.length) {
      list.innerHTML = UI.emptyState('👨‍🎓', 'No active students in this class');
      return;
    }

    list.innerHTML = `
      <div class="attendance-grid">
        ${students.map(s => {
          const existing = records.find(r => r.studentId === s.id && r.date === date);
          const status = existing?.status || '';
          return `
          <div class="att-row" data-student="${s.id}">
            <span><strong>${UI.escapeHtml(s.name)}</strong> (${s.id})</span>
            <div class="att-btns">
              <button class="att-btn present ${status === 'Present' ? 'active' : ''}" data-status="Present" title="Present">✓</button>
              <button class="att-btn absent ${status === 'Absent' ? 'active' : ''}" data-status="Absent" title="Absent">✗</button>
              <button class="att-btn late ${status === 'Late' ? 'active' : ''}" data-status="Late" title="Late">⏰</button>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:1rem;text-align:right">
        <button class="btn btn-primary" id="save-attendance">Save Attendance</button>
      </div>
    `;

    list.querySelectorAll('.att-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.att-row');
        row.querySelectorAll('.att-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    document.getElementById('save-attendance')?.addEventListener('click', () => this.save());
  },

  save() {
    const classId = document.getElementById('att-class').value;
    const date = document.getElementById('att-date').value;
    const rows = document.querySelectorAll('.att-row');
    if (!rows.length) return;

    const studentIds = [...rows].map(row => row.dataset.student);
    let records = Storage.getAttendance().filter(r => !(r.date === date && studentIds.includes(r.studentId)));
    rows.forEach(row => {
      const active = row.querySelector('.att-btn.active');
      if (!active) return;
      records.push({
        id: 'ATT' + Date.now() + Math.random().toString(36).slice(2, 6),
        studentId: row.dataset.student,
        classId,
        date,
        status: active.dataset.status
      });
    });
    Storage.updateCollection('attendance', records);
    UI.toast('Attendance saved');
    Router.navigate('attendance');
  }
};
