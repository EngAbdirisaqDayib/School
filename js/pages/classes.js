const ClassesPage = {
  render() {
    const classes = Storage.getClasses();
    const teachers = Storage.getTeachers();
    const students = Storage.getStudents();

    return `
      <div class="toolbar">
        <button class="btn btn-primary" id="add-class-btn">+ Add Class</button>
      </div>
      <div class="stats-grid">
        ${classes.map(c => {
          const count = students.filter(s => s.classId === c.id).length;
          return `
          <div class="stat-card">
            <div class="stat-icon purple">🏫</div>
            <div>
              <div class="stat-value">${c.name}</div>
              <div class="stat-label">Grade ${c.grade} · Section ${c.section} · ${count} students</div>
              <p style="font-size:.8rem;color:var(--text-muted);margin-top:.35rem">Room: ${c.room} · Teacher: ${UI.getTeacherName(c.teacherId)}</p>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="card">
        <div class="card-header"><h3>All Classes</h3></div>
        <div class="card-body table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Grade</th><th>Section</th><th>Class Teacher</th><th>Room</th><th>Capacity</th><th>Students</th><th>Actions</th></tr></thead>
            <tbody>
              ${classes.length ? classes.map(c => {
                const count = students.filter(s => s.classId === c.id).length;
                return `<tr>
                  <td>${c.id}</td><td><strong>${c.name}</strong></td><td>${c.grade}</td><td>${c.section}</td>
                  <td>${UI.getTeacherName(c.teacherId)}</td><td>${c.room}</td><td>${c.capacity}</td><td>${count}</td>
                  <td class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-class" data-id="${c.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-class" data-id="${c.id}">Delete</button>
                  </td>
                </tr>`;
              }).join('') : `<tr><td colspan="9">${UI.emptyState('🏫', 'No classes')}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('add-class-btn')?.addEventListener('click', () => this.showForm());
    document.querySelectorAll('.edit-class').forEach(b => b.addEventListener('click', () => this.showForm(b.dataset.id)));
    document.querySelectorAll('.delete-class').forEach(b => b.addEventListener('click', () => this.delete(b.dataset.id)));
  },

  showForm(id) {
    const classes = Storage.getClasses();
    const teachers = Storage.getTeachers();
    const c = id ? classes.find(x => x.id === id) : null;
    UI.showModal(id ? 'Edit Class' : 'Add Class', `
      <form id="class-form">
        <div class="form-row">
          <div class="form-group"><label>Class Name *</label><input name="name" value="${c?.name || ''}" required placeholder="Grade 8-A"></div>
          <div class="form-group"><label>Room</label><input name="room" value="${c?.room || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Grade *</label><input name="grade" value="${c?.grade || ''}" required></div>
          <div class="form-group"><label>Section *</label><input name="section" value="${c?.section || ''}" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Class Teacher</label>
            <select name="teacherId"><option value="">—</option>
              ${teachers.map(t => `<option value="${t.id}" ${c?.teacherId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Capacity</label><input type="number" name="capacity" value="${c?.capacity || 30}"></div>
        </div>
      </form>
    `, `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Save</button>`);
    document.getElementById('modal-cancel').onclick = () => UI.hideModal();
    document.getElementById('modal-save').onclick = () => this.save(id);
  },

  save(id) {
    const form = document.getElementById('class-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    const classes = Storage.getClasses();
    const entry = { name: fd.get('name'), grade: fd.get('grade'), section: fd.get('section'), teacherId: fd.get('teacherId'), room: fd.get('room'), capacity: parseInt(fd.get('capacity')) || 30 };
    if (id) {
      const idx = classes.findIndex(c => c.id === id);
      classes[idx] = { ...classes[idx], ...entry };
    } else {
      classes.push({ id: Storage.nextId('CLS', classes), ...entry, students: 0 });
    }
    Storage.updateCollection('classes', classes);
    UI.hideModal();
    UI.toast('Class saved');
    Router.navigate('classes');
  },

  delete(id) {
    UI.confirm('Delete this class?', () => {
      Storage.updateCollection('classes', Storage.getClasses().filter(c => c.id !== id));
      UI.toast('Class deleted');
      Router.navigate('classes');
    });
  }
};
