const TeachersPage = {
  render() {
    const teachers = Storage.getTeachers();
    return `
      <div class="toolbar">
        <input type="text" class="search-input" id="teacher-search" placeholder="Search teachers...">
        <button class="btn btn-primary" id="add-teacher-btn">+ Add Teacher</button>
      </div>
      <div class="card">
        <div class="card-body table-wrap">
          <table id="teachers-table">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Subject</th><th>Qualification</th><th>Salary</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>${this.renderRows(teachers)}</tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderRows(teachers) {
    if (!teachers.length) return `<tr><td colspan="8">${UI.emptyState('👩‍🏫', 'No teachers found')}</td></tr>`;
    return teachers.map(t => `
      <tr data-id="${t.id}">
        <td>${t.id}</td>
        <td><strong>${UI.escapeHtml(t.name)}</strong></td>
        <td>${UI.escapeHtml(t.email)}</td>
        <td>${UI.escapeHtml(t.subject)}</td>
        <td>${UI.escapeHtml(t.qualification)}</td>
        <td>$${t.salary?.toLocaleString()}</td>
        <td>${UI.statusBadge(t.status)}</td>
        <td class="table-actions">
          <button class="btn btn-ghost btn-sm edit-teacher" data-id="${t.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-teacher" data-id="${t.id}">Delete</button>
        </td>
      </tr>
    `).join('');
  },

  bindEvents() {
    document.getElementById('teacher-search')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#teachers-table tbody tr[data-id]').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
    document.getElementById('add-teacher-btn')?.addEventListener('click', () => this.showForm());
    document.querySelectorAll('.edit-teacher').forEach(btn => btn.addEventListener('click', () => this.showForm(btn.dataset.id)));
    document.querySelectorAll('.delete-teacher').forEach(btn => btn.addEventListener('click', () => this.delete(btn.dataset.id)));
  },

  showForm(id) {
    const teachers = Storage.getTeachers();
    const t = id ? teachers.find(x => x.id === id) : null;
    UI.showModal(id ? 'Edit Teacher' : 'Add Teacher', `
      <form id="teacher-form">
        <div class="form-row">
          <div class="form-group"><label>Full Name *</label><input name="name" value="${t?.name || ''}" required></div>
          <div class="form-group"><label>Email *</label><input type="email" name="email" value="${t?.email || ''}" required></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input name="phone" value="${t?.phone || ''}"></div>
          <div class="form-group"><label>Subject *</label><input name="subject" value="${t?.subject || ''}" required></div>
        </div>
        <div class="form-group"><label>Qualification</label><input name="qualification" value="${t?.qualification || ''}"></div>
        <div class="form-row">
          <div class="form-group"><label>Salary ($)</label><input type="number" name="salary" value="${t?.salary || ''}"></div>
          <div class="form-group"><label>Join Date</label><input type="date" name="joinDate" value="${t?.joinDate || ''}"></div>
        </div>
        <div class="form-group"><label>Status</label>
          <select name="status">${['Active','Inactive'].map(s => `<option ${t?.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
        </div>
      </form>
    `, `<button class="btn btn-ghost" id="modal-cancel">Cancel</button><button class="btn btn-primary" id="modal-save">Save</button>`);
    document.getElementById('modal-cancel').onclick = () => UI.hideModal();
    document.getElementById('modal-save').onclick = () => this.save(id);
  },

  save(id) {
    const form = document.getElementById('teacher-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    const teachers = Storage.getTeachers();
    const entry = {
      name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'),
      subject: fd.get('subject'), qualification: fd.get('qualification'),
      salary: parseInt(fd.get('salary')) || 0, joinDate: fd.get('joinDate'), status: fd.get('status')
    };
    if (id) {
      const idx = teachers.findIndex(t => t.id === id);
      teachers[idx] = { ...teachers[idx], ...entry };
    } else {
      teachers.push({ id: Storage.nextId('TCH', teachers), ...entry });
    }
    Storage.updateCollection('teachers', teachers);
    UI.hideModal();
    UI.toast(id ? 'Teacher updated' : 'Teacher added');
    Router.navigate('teachers');
  },

  delete(id) {
    UI.confirm('Delete this teacher?', () => {
      Storage.updateCollection('teachers', Storage.getTeachers().filter(t => t.id !== id));
      UI.toast('Teacher deleted');
      Router.navigate('teachers');
    });
  }
};
