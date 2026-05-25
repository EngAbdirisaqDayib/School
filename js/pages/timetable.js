const TimetablePage = {
  DAYS: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  PERIODS: [
    { period: 1, start: '08:00', end: '08:45' },
    { period: 2, start: '08:50', end: '09:35' },
    { period: 3, start: '09:40', end: '10:25' },
    { period: 4, start: '10:40', end: '11:25' },
    { period: 5, start: '11:30', end: '12:15' },
    { period: 6, start: '13:00', end: '13:45' }
  ],

  render() {
    const session = Auth.getSession();
    const classes = Storage.getClasses();
    let timetable = Storage.getTimetable();

    if (session.role === 'student') {
      const student = Storage.getStudents().find(s => s.id === session.linkedId);
      timetable = timetable.filter(t => t.classId === student?.classId);
    }

    const defaultClass = session.role === 'student'
      ? Storage.getStudents().find(s => s.id === session.linkedId)?.classId
      : classes[0]?.id;

    return `
      <div class="toolbar">
        ${session.role !== 'student' ? `
          <select class="filter-select" id="tt-class-filter">
            ${classes.map(c => `<option value="${c.id}" ${c.id === defaultClass ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
          ${session.role === 'admin' ? '<button class="btn btn-primary" id="add-tt-btn">+ Add Slot</button>' : ''}
        ` : `<span style="font-weight:500">${UI.getClassName(defaultClass)}</span>`}
      </div>
      <div class="card">
        <div class="card-body">
          <div id="timetable-grid" data-class="${defaultClass || ''}">
            ${this.buildGrid(timetable.filter(t => t.classId === defaultClass))}
          </div>
        </div>
      </div>
      ${session.role === 'admin' ? `
      <div class="card">
        <div class="card-header"><h3>All Slots</h3></div>
        <div class="card-body table-wrap">
          <table>
            <thead><tr><th>Class</th><th>Day</th><th>Period</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Actions</th></tr></thead>
            <tbody id="tt-table-body">
              ${Storage.getTimetable().map(t => `
                <tr><td>${UI.getClassName(t.classId)}</td><td>${t.day}</td><td>${t.period}</td>
                <td>${UI.getSubjectName(t.subjectId)}</td><td>${UI.getTeacherName(t.teacherId)}</td><td>${t.room}</td>
                <td><button class="btn btn-danger btn-sm delete-tt" data-id="${t.id}">Delete</button></td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>` : ''}
    `;
  },

  buildGrid(slots) {
    let html = '<div class="timetable-grid">';
    html += '<div class="tt-cell tt-header">Time</div>';
    this.DAYS.forEach(d => { html += `<div class="tt-cell tt-header">${d.slice(0,3)}</div>`; });

    this.PERIODS.forEach(p => {
      html += `<div class="tt-cell tt-time">${p.start}<br>${p.end}</div>`;
      this.DAYS.forEach(day => {
        const slot = slots.find(s => s.day === day && s.period === p.period);
        if (slot) {
          html += `<div class="tt-cell tt-slot"><strong>${UI.getSubjectName(slot.subjectId)}</strong><span>${UI.getTeacherName(slot.teacherId)} · ${slot.room}</span></div>`;
        } else {
          html += '<div class="tt-cell">—</div>';
        }
      });
    });
    html += '</div>';
    return html;
  },

  bindEvents() {
    const filter = document.getElementById('tt-class-filter');
    filter?.addEventListener('change', () => {
      const classId = filter.value;
      const slots = Storage.getTimetable().filter(t => t.classId === classId);
      document.getElementById('timetable-grid').innerHTML = this.buildGrid(slots);
      document.getElementById('timetable-grid').dataset.class = classId;
    });

    document.getElementById('add-tt-btn')?.addEventListener('click', () => this.showForm());
    document.querySelectorAll('.delete-tt').forEach(b => b.addEventListener('click', () => {
      UI.confirm('Delete this slot?', () => {
        Storage.updateCollection('timetable', Storage.getTimetable().filter(t => t.id !== b.dataset.id));
        UI.toast('Slot deleted');
        Router.navigate('timetable');
      });
    }));
  },

  showForm() {
    const classes = Storage.getClasses();
    const subjects = Storage.getSubjects();
    const teachers = Storage.getTeachers();
    UI.showModal('Add Timetable Slot', `
      <form id="tt-form">
        <div class="form-group"><label>Class *</label>
          <select name="classId" required>${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Day *</label>
            <select name="day" required>${this.DAYS.map(d => `<option>${d}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Period *</label>
            <select name="period" required>${this.PERIODS.map(p => `<option value="${p.period}">Period ${p.period} (${p.start}-${p.end})</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-group"><label>Subject *</label>
          <select name="subjectId" required>${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Teacher</label>
            <select name="teacherId"><option value="">—</option>${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label>Room</label><input name="room" placeholder="Room 101"></div>
        </div>
      </form>
    `, `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Save</button>`);
    document.getElementById('modal-cancel').onclick = () => UI.hideModal();
    document.getElementById('modal-save').onclick = () => this.save();
  },

  save() {
    const form = document.getElementById('tt-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    const period = parseInt(fd.get('period'));
    const p = this.PERIODS.find(x => x.period === period);
    const timetable = Storage.getTimetable();
    timetable.push({
      id: Storage.nextId('TT', timetable),
      classId: fd.get('classId'), day: fd.get('day'), period,
      startTime: p.start, endTime: p.end,
      subjectId: fd.get('subjectId'), teacherId: fd.get('teacherId'), room: fd.get('room')
    });
    Storage.updateCollection('timetable', timetable);
    UI.hideModal();
    UI.toast('Slot added');
    Router.navigate('timetable');
  }
};
