const SubjectsPage = {
  render() {
    const subjects = Storage.getSubjects();
    return `
      <div class="toolbar">
        <input type="text" class="search-input" id="subject-search" placeholder="Search subjects...">
        <button class="btn btn-primary" id="add-subject-btn">+ Add Subject</button>
      </div>
      <div class="card">
        <div class="card-body table-wrap">
          <table id="subjects-table">
            <thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Teacher</th><th>Class</th><th>Credits</th><th>Actions</th></tr></thead>
            <tbody>
              ${subjects.length ? subjects.map(s => `
                <tr data-id="${s.id}">
                  <td>${s.id}</td><td><strong>${UI.escapeHtml(s.name)}</strong></td><td>${s.code}</td>
                  <td>${UI.getTeacherName(s.teacherId)}</td><td>${UI.getClassName(s.classId)}</td><td>${s.credits}</td>
                  <td class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-subject" data-id="${s.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-subject" data-id="${s.id}">Delete</button>
                  </td>
                </tr>
              `).join('') : `<tr><td colspan="7">${UI.emptyState('📚', 'No subjects')}</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('subject-search')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#subjects-table tbody tr[data-id]').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
    document.getElementById('add-subject-btn')?.addEventListener('click', () => this.showForm());
    document.querySelectorAll('.edit-subject').forEach(b => b.addEventListener('click', () => this.showForm(b.dataset.id)));
    document.querySelectorAll('.delete-subject').forEach(b => b.addEventListener('click', () => this.delete(b.dataset.id)));
  },

  showForm(id) {
    const subjects = Storage.getSubjects();
    const teachers = Storage.getTeachers();
    const classes = Storage.getClasses();
    const s = id ? subjects.find(x => x.id === id) : null;
    UI.showModal(id ? 'Edit Subject' : 'Add Subject', `
      <form id="subject-form">
        <div class="form-row">
          <div class="form-group"><label>Subject Name *</label><input name="name" value="${s?.name || ''}" required></div>
          <div class="form-group"><label>Code *</label><input name="code" value="${s?.code || ''}" required placeholder="MATH"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Teacher</label>
            <select name="teacherId"><option value="">—</option>
              ${teachers.map(t => `<option value="${t.id}" ${s?.teacherId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Class</label>
            <select name="classId"><option value="">—</option>
              ${classes.map(c => `<option value="${c.id}" ${s?.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label>Credits</label><input type="number" name="credits" value="${s?.credits || 3}" min="1" max="6"></div>
      </form>
    `, `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Save</button>`);
    document.getElementById('modal-cancel').onclick = () => UI.hideModal();
    document.getElementById('modal-save').onclick = () => this.save(id);
  },

  save(id) {
    const form = document.getElementById('subject-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    const subjects = Storage.getSubjects();
    const entry = { name: fd.get('name'), code: fd.get('code'), teacherId: fd.get('teacherId'), classId: fd.get('classId'), credits: parseInt(fd.get('credits')) || 3 };
    if (id) {
      const idx = subjects.findIndex(s => s.id === id);
      subjects[idx] = { ...subjects[idx], ...entry };
    } else {
      subjects.push({ id: Storage.nextId('SUB', subjects), ...entry });
    }
    Storage.updateCollection('subjects', subjects);
    UI.hideModal();
    UI.toast('Subject saved');
    Router.navigate('subjects');
  },

  delete(id) {
    UI.confirm('Delete this subject?', () => {
      Storage.updateCollection('subjects', Storage.getSubjects().filter(s => s.id !== id));
      UI.toast('Subject deleted');
      Router.navigate('subjects');
    });
  }
};
